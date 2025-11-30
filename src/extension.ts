import * as vscode from 'vscode';
import { exec, spawn, ChildProcess } from 'child_process';
import * as net from 'net';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { ensureHttpsConfig } from './httpsonlan';

let liveServerProcess: ChildProcess | undefined;
let statusBarItem: vscode.StatusBarItem;
let statusBarLanItem: vscode.StatusBarItem | undefined;
let isServerRunning = false;
let serverUrl = '';
let isPhpProject = false;
let useXampp = false;
let xamppPath = 'C:\\xampp';
let useXamppApache = false;
let autoCopyToHtdocs = false;
let copiedToHtdocs = false;
let htdocsProjectPath = '';
let enableLanAccess = false;
let localIpAddress = '';
let enableHttpsOnLan = false;
let strictWorkspaceRoot = true;
let workspaceRoot: string | undefined;
let workspaceChangeDisposable: vscode.Disposable | undefined;
let extensionContext: vscode.ExtensionContext | undefined;

export function activate(context: vscode.ExtensionContext) {
    console.log('Live Server extension is now active!');
    extensionContext = context;
    workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

    // Detect project type
    detectProjectType();

    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'extension.liveServer.toggle';
    updateStatusBar();
    statusBarItem.show();

    // Create LAN status bar item (hidden by default). Clicking it will cycle interfaces.
    statusBarLanItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 90);
    statusBarLanItem.command = 'extension.liveServer.cycleLanInterface';
    statusBarLanItem.tooltip = 'Cycle LAN interfaces';
    statusBarLanItem.hide();
    context.subscriptions.push(statusBarLanItem);

    // Register toggle command
    const toggleCommand = vscode.commands.registerCommand('extension.liveServer.toggle', () => {
        if (isServerRunning) {
            stopLiveServer();
        } else {
            startLiveServer();
        }
    });

    // Register explicit start and stop commands
    const startCommand = vscode.commands.registerCommand('extension.liveServer.start', (resource?: vscode.Uri) => {
        if (!isServerRunning) {
            startLiveServer(resource);
        }
    });

    const stopCommand = vscode.commands.registerCommand('extension.liveServer.stop', () => {
        if (isServerRunning) {
            stopLiveServer();
        }
    });

    const settingsCommand = vscode.commands.registerCommand('extension.liveServer.settings', () => {
        vscode.commands.executeCommand('workbench.action.openSettings', 'liveServer');
    });

    context.subscriptions.push(toggleCommand, startCommand, stopCommand, settingsCommand, statusBarItem);

    // Register command to cycle LAN interfaces (clicking status bar cycles)
    const cycleInterfacesCommand = vscode.commands.registerCommand('extension.liveServer.cycleLanInterface', async () => {
        const ifaces = getAllLanInterfaces();
        if (ifaces.length === 0) {
            vscode.window.showInformationMessage('No LAN interfaces found.');
            return;
        }
        // Find current index and move to next
        let idx = ifaces.findIndex(i => i.address === localIpAddress);
        idx = (idx + 1) % ifaces.length;
        localIpAddress = ifaces[idx].address;
        vscode.window.showInformationMessage(`Switched LAN interface to ${localIpAddress}`);
        updateStatusBar();
    });
    context.subscriptions.push(cycleInterfacesCommand);

    // Note: QR toggle removed — QR feature intentionally disabled per user request.

    // Detect project type (e.g., PHP)
    detectProjectType();
    // Stop server if workspace folders change (strict mode)
    workspaceChangeDisposable = vscode.workspace.onDidChangeWorkspaceFolders(() => {
        if (strictWorkspaceRoot && isServerRunning) {
            stopLiveServer({ silent: true });
            vscode.window.showWarningMessage('Workspace folders changed. Live Server stopped to prevent serving other project content.');
        }
    });
    if (workspaceChangeDisposable) {
        context.subscriptions.push(workspaceChangeDisposable);
    }
}

function getLocalIpAddress(): string {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        const iface = interfaces[name];
        if (!iface) continue;
        
        for (const alias of iface) {
            // Skip internal (loopback) and non-IPv4 addresses
            if (alias.family === 'IPv4' && !alias.internal) {
                return alias.address;
            }
        }
    }
    return 'localhost';
}

function getAllLanInterfaces(): Array<{ name: string; address: string }> {
    const results: Array<{ name: string; address: string }> = [];
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        const iface = interfaces[name];
        if (!iface) continue;
        for (const alias of iface) {
            const fam = String(alias.family);
            if ((fam === 'IPv4' || fam === '4') && !alias.internal) {
                results.push({ name, address: alias.address });
            }
        }
    }
    return results;
}

function updateStatusBar() {
    const serverType = useXamppApache ? 'XAMPP Apache Server' : (useXampp && isPhpProject ? 'XAMPP PHP Server' : (isPhpProject ? 'PHP Server' : 'Live Server'));
    if (isServerRunning) {
        statusBarItem.text = "$(broadcast) Go Live";
        let tooltipText = `${serverType} running at ${serverUrl}`;
        if (enableLanAccess) {
            const allIfaces = getAllLanInterfaces();
            if (allIfaces.length > 0) {
                const addresses = allIfaces.map(i => i.address).join(', ');
                // If serverUrl contains localhost, show an example LAN URL for the first address
                let lanLine = '';
                if (localIpAddress && serverUrl) {
                    const lanUrl = serverUrl.replace('localhost', localIpAddress).replace('127.0.0.1', localIpAddress);
                    lanLine = `\nLAN: ${lanUrl}`;
                }
                tooltipText += `${lanLine}\nInterfaces: ${addresses}`;
            }
        }
        tooltipText += '. Click to stop.';
        statusBarItem.tooltip = tooltipText;
        statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        // Show LAN status item when LAN access enabled
        if (enableLanAccess) {
            const allIfaces = getAllLanInterfaces();
            if (allIfaces.length > 0) {
                // Prefer the selected localIpAddress when available
                const displayAddress = localIpAddress || allIfaces[0].address;
                if (statusBarLanItem) {
                    statusBarLanItem.text = `$(device-mobile) ${displayAddress}`;
                    statusBarLanItem.tooltip = 'Generating QR...';
                    statusBarLanItem.show();
                    // update tooltip with QR image asynchronously
                    const lanExampleUrl = serverUrl && serverUrl !== 'Starting...'
                        ? serverUrl.replace('localhost', displayAddress).replace('127.0.0.1', displayAddress)
                        : (isPhpProject ? `http://${displayAddress}:8000` : `http://${displayAddress}`);
                    updateLanTooltipAsync(lanExampleUrl, allIfaces);
                }
            }
        } else {
            statusBarLanItem?.hide();
        }
    } else {
        statusBarItem.text = "$(circle-large-outline) Go Live";
        statusBarItem.tooltip = `Click to start ${serverType}`;
        statusBarItem.backgroundColor = undefined;
        statusBarLanItem?.hide();
    }
}

async function startLiveServer(targetResource?: vscode.Uri) {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
        vscode.window.showErrorMessage('No workspace folder found. Please open a folder first.');
        return;
    }
    if (strictWorkspaceRoot && folders.length > 1) {
        vscode.window.showErrorMessage('Multiple workspace folders detected. Disable strictWorkspaceRoot or close other folders.');
        return;
    }
    const workspaceFolder = folders[0];
    const workspacePath = workspaceFolder.uri.fsPath;
    if (strictWorkspaceRoot && workspaceRoot && workspaceRoot !== workspacePath) {
        vscode.window.showErrorMessage('Workspace path changed since activation. Reload window or disable strictWorkspaceRoot.');
        return;
    }

    // Prepare relativePath early so we can use it when the server is already running
    let relativePath = '';

    // If server is already running, open the requested file URL without restarting
    if (isServerRunning) {
        let openUrl = serverUrl && serverUrl !== 'Starting...' ? serverUrl : '';
        if (!openUrl) {
            if (useXamppApache) {
                openUrl = 'http://localhost';
            } else if (useXampp && isPhpProject) {
                openUrl = 'http://localhost:8000';
            } else if (isPhpProject) {
                openUrl = 'http://localhost:8000';
            } else {
                openUrl = 'http://localhost:3000';
            }
        }
        if (relativePath) {
            if (openUrl.endsWith('/') && relativePath.startsWith('/')) {
                openUrl = openUrl.slice(0, -1) + relativePath;
            } else {
                openUrl = openUrl + relativePath;
            }
        }
        try {
            vscode.env.openExternal(vscode.Uri.parse(openUrl));
        } catch (err) {
            console.error('Failed to open URL for running server:', err);
            vscode.window.showErrorMessage('Failed to open file on running Live Server.');
        }
        return;
    }
    
    let httpsConfigPath: string | undefined;
    if (enableLanAccess && enableHttpsOnLan && !isPhpProject && !useXamppApache) {
        if (!extensionContext) {
            vscode.window.showErrorMessage('HTTPS configuration unavailable (extension context missing).');
            return;
        }
        try {
            httpsConfigPath = await ensureHttpsConfig(extensionContext);
        } catch (error) {
            console.error('Failed to prepare HTTPS config:', error);
            vscode.window.showErrorMessage('Failed to prepare HTTPS certificate for LAN access. See console for details.');
            return;
        }
    } else if (enableHttpsOnLan && !enableLanAccess) {
        vscode.window.showWarningMessage('Enable LAN Access to serve over HTTPS on LAN.');
    }

    // Determine relative path from either the provided resource (when invoked from explorer)
    // or the active editor (when invoked from command palette/status bar)
    relativePath = '';
    if (targetResource && targetResource.fsPath) {
        const activeFilePath = targetResource.fsPath;
        if (activeFilePath.startsWith(workspacePath)) {
            relativePath = activeFilePath.substring(workspacePath.length).replace(/\\/g, '/');
            if (!relativePath.startsWith('/')) {
                relativePath = '/' + relativePath;
            }
        } else if (strictWorkspaceRoot) {
            vscode.window.showWarningMessage('Selected file is outside workspace root. Deep link ignored.');
        }
    } else {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            const activeFilePath = activeEditor.document.uri.fsPath;
            if (activeFilePath.startsWith(workspacePath)) {
                relativePath = activeFilePath.substring(workspacePath.length).replace(/\\/g, '/');
                if (!relativePath.startsWith('/')) {
                    relativePath = '/' + relativePath;
                }
            } else if (strictWorkspaceRoot) {
                vscode.window.showWarningMessage('Active file outside workspace root. Deep link ignored.');
            }
        }
    }
    
    // Check if we should copy to htdocs for Apache
    if (useXamppApache && autoCopyToHtdocs && !copiedToHtdocs) {
        const action = await vscode.window.showInformationMessage(
            'Would you like to copy this project to XAMPP htdocs folder for better Apache compatibility?',
            'Copy to htdocs', 'Skip'
        );
        
        if (action === 'Copy to htdocs') {
            const htdocsPath = await copyProjectToHtdocs(workspacePath);
            if (htdocsPath) {
                copiedToHtdocs = true;
                htdocsProjectPath = htdocsPath;
                // Update relative path to use project name
                const projectName = path.basename(workspacePath);
                if (relativePath) {
                    relativePath = '/' + projectName + relativePath;
                }
            }
        }
    }
    
    // Choose command based on project type and configuration
    let command: string = '';
    let shouldStartProcess = true;
    let staticProtocol: 'http' | 'https' = 'http';
    
    if (useXamppApache) {
        // Check if Apache is running
        const isApacheRunning = await checkApacheStatus();
        if (!isApacheRunning) {
            const action = await vscode.window.showWarningMessage(
                'Apache is not running in XAMPP. What would you like to do?',
                'Start Apache', 'Open XAMPP Control', 'Cancel'
            );
            
            if (action === 'Start Apache') {
                // Try to start Apache using XAMPP control
                const success = await startApacheViaXampp();
                if (!success) {
                    vscode.window.showErrorMessage('Failed to start Apache automatically. Please start it manually in XAMPP Control Panel.');
                    return;
                }
                // Wait a bit for Apache to start
                await new Promise(resolve => setTimeout(resolve, 3000));
            } else if (action === 'Open XAMPP Control') {
                // Try to open XAMPP Control Panel
                exec(`"${xamppPath}\\xampp-control.exe"`, (error) => {
                    if (error) {
                        vscode.window.showErrorMessage('Could not open XAMPP Control Panel. Please start Apache manually.');
                    }
                });
                vscode.window.showInformationMessage('Please start Apache in XAMPP Control Panel, then try again.');
                return;
            } else {
                return;
            }
        }
        
        serverUrl = 'http://localhost';
        shouldStartProcess = false;
        
        // Add relative path for Apache
        if (relativePath) {
            serverUrl += relativePath;
        }
    } else if (useXampp && isPhpProject) {
        // Use PHP from XAMPP with -t flag to set document root
        command = `"${xamppPath}\\php\\php.exe" -S localhost:8000 -t "${workspacePath}"`;
    } else if (isPhpProject) {
        // Use system PHP with -t flag to set document root
        const host = enableLanAccess ? '0.0.0.0' : 'localhost';
        command = `php -S ${host}:8000 -t "${workspacePath}"`;
    } else {
        // Use browser-sync for static files (replaces live-server)
        const hostBind = enableLanAccess ? '0.0.0.0' : '127.0.0.1';
        const port = 3000;
        let bsCommand = `npx browser-sync start --server "${workspacePath}" --host ${hostBind} --port ${port} --no-open --files "${workspacePath}"`;
        if (httpsConfigPath) {
            // read https config file generated by ensureHttpsConfig
            try {
                const cfg = JSON.parse(fs.readFileSync(httpsConfigPath, 'utf8')) as { cert?: string; key?: string };
                if (cfg.cert && cfg.key) {
                    bsCommand += ` --https --https.key "${cfg.key}" --https.cert "${cfg.cert}"`;
                    staticProtocol = 'https';
                }
            } catch (err) {
                console.error('Failed to read HTTPS config for browser-sync:', err);
            }
        }
        command = bsCommand;
    }
    
    const serverType = useXamppApache ? 'XAMPP Apache Server' : (useXampp && isPhpProject ? 'XAMPP PHP Server' : (isPhpProject ? 'PHP Server' : 'Live Server'));
    vscode.window.showInformationMessage(`Starting ${serverType}...`);
    
    if (shouldStartProcess) {
        if (isPhpProject) {
            // For PHP built-in server, use spawn to create a long-lived child process
            // Build args: -S host:8000 -t workspacePath
            const host = enableLanAccess ? '0.0.0.0' : 'localhost';
            const phpArgs = ['-S', `${host}:8000`, '-t', workspacePath];
            liveServerProcess = spawn('php', phpArgs, { cwd: workspacePath, shell: false });

            // Attach listeners similar to exec handling
            liveServerProcess.stderr?.on('data', (data: Buffer | string) => {
                const text = data.toString();
                console.error(`${serverType} stderr: ${text}`);
            });
            liveServerProcess.stdout?.on('data', (data: Buffer | string) => {
                const text = data.toString();
                console.log(`${serverType} stdout: ${text}`);
            });
            liveServerProcess.on('error', (error) => {
                console.error(`${serverType} spawn error:`, error);
                vscode.window.showErrorMessage(`Failed to start ${serverType}: ${error.message}`);
                isServerRunning = false;
                updateStatusBar();
                liveServerProcess = undefined;
            });
            liveServerProcess.on('close', (code) => {
                console.log(`${serverType} process exited with code ${code}`);
                isServerRunning = false;
                serverUrl = '';
                updateStatusBar();
                liveServerProcess = undefined;
            });
        } else {
            liveServerProcess = exec(command, {
                cwd: workspacePath
            }, (error, stdout, stderr) => {
                if (error) {
                    console.error(`${serverType} error: ${error}`);
                    vscode.window.showErrorMessage(`Failed to start ${serverType}: ${error.message}`);
                    isServerRunning = false;
                    updateStatusBar();
                    return;
                }
            });
        }
    } else {
        // For Apache, just set as running and open browser
        isServerRunning = true;
        updateStatusBar();
        vscode.env.openExternal(vscode.Uri.parse(serverUrl));
        return;
    }

    if (liveServerProcess) {
        if (isPhpProject) {
            // For PHP server, set URL immediately and wait a bit for server to start
            setTimeout(() => {
                // Always open in browser using localhost even if LAN mode enabled
                const hostForBrowser = 'localhost';
                serverUrl = `http://${hostForBrowser}:8000`;
                // Add relative path for PHP server
                if (relativePath) {
                    serverUrl += relativePath;
                }
                isServerRunning = true;
                updateStatusBar();
                // Auto-open browser to localhost (not LAN IP) for consistency
                vscode.env.openExternal(vscode.Uri.parse(serverUrl));
                vscode.window.showInformationMessage(`${serverType} started at ${serverUrl}`);
            }, 1500);
        } else {
            // For browser-sync static server, we know the port we set (3000)
            const protocolForBrowser = staticProtocol;
            setTimeout(() => {
                serverUrl = `${protocolForBrowser}://localhost:3000`;
                // If relativePath present, append
                if (relativePath) {
                    serverUrl += relativePath;
                }
                isServerRunning = true;
                updateStatusBar();
                vscode.env.openExternal(vscode.Uri.parse(serverUrl));
                vscode.window.showInformationMessage(`${serverType} started at ${serverUrl}`);
            }, 800);
        }

        liveServerProcess.stderr?.on('data', (data: string) => {
            console.error(`${serverType} stderr: ${data}`);
        });

        liveServerProcess.on('close', (code) => {
            console.log(`${serverType} process exited with code ${code}`);
            isServerRunning = false;
            serverUrl = '';
            updateStatusBar();
            liveServerProcess = undefined;
        });

        liveServerProcess.on('error', (error) => {
            console.error(`Live Server process error: ${error}`);
            vscode.window.showErrorMessage(`Live Server error: ${error.message}`);
            isServerRunning = false;
            updateStatusBar();
            liveServerProcess = undefined;
        });

        // Set initial status for non-PHP servers
        if (!isPhpProject) {
            isServerRunning = true;
            serverUrl = 'Starting...';
            updateStatusBar();
        }
    }
}

function stopLiveServer(options: { silent?: boolean } = {}) {
    const silent = options.silent ?? false;
    const serverType = useXamppApache ? 'XAMPP Apache Server' : (useXampp && isPhpProject ? 'XAMPP PHP Server' : (isPhpProject ? 'PHP Server' : 'Live Server'));

    if (liveServerProcess) {
        // On Windows, we need to kill the process tree
        if (process.platform === 'win32') {
            exec(`taskkill /pid ${liveServerProcess.pid} /T /F`, (error) => {
                if (error) {
                    console.error(`Error killing process: ${error}`);
                }
            });
        } else {
            liveServerProcess.kill();
        }
    }

    if (useXamppApache && !liveServerProcess && !silent) {
        vscode.window.showInformationMessage('Apache continues running in XAMPP Control Panel. Please stop it manually if needed.');
    }

    liveServerProcess = undefined;
    isServerRunning = false;
    serverUrl = '';
    updateStatusBar();

    if (!silent) {
        vscode.window.showInformationMessage(`${serverType} stopped`);
    }
}

function detectProjectType(): void {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) return;

    // Check for PHP files
    vscode.workspace.findFiles('**/*.php', null, 1).then(files => {
        isPhpProject = files.length > 0;
    });

    // Read configuration
    const config = vscode.workspace.getConfiguration('liveServer');
    useXampp = config.get('useXampp', false);
    xamppPath = config.get('xamppPath', 'C:\\xampp');
    useXamppApache = config.get('useXamppApache', false);
    autoCopyToHtdocs = config.get('autoCopyToHtdocs', false);
    enableLanAccess = config.get('enableLanAccess', false);
    enableHttpsOnLan = config.get('enableHttpsOnLan', false);
    strictWorkspaceRoot = config.get('strictWorkspaceRoot', true);
    
    // Get local IP address if LAN access is enabled
    if (enableLanAccess) {
        const allIfaces = getAllLanInterfaces();
        if (allIfaces.length > 0) {
            localIpAddress = allIfaces[0].address;
        } else {
            localIpAddress = getLocalIpAddress();
        }
        console.log('Local IP Address:', localIpAddress);
    }
}

async function checkApacheStatus(): Promise<boolean> {
    return new Promise((resolve) => {
        const client = net.createConnection({ port: 80, host: 'localhost' }, () => {
            client.end();
            resolve(true);
        });
        client.on('error', () => resolve(false));
        setTimeout(() => {
            client.end();
            resolve(false);
        }, 2000);
    });
}

async function startApacheViaXampp(): Promise<boolean> {
    return new Promise((resolve) => {
        // Try to start Apache using net start command (for Windows service)
        exec('net start apache2.4', (error, stdout, stderr) => {
            if (error) {
                console.error('Failed to start Apache service:', error);
                resolve(false);
            } else {
                console.log('Apache service started successfully');
                resolve(true);
            }
        });
    });
}

async function copyProjectToHtdocs(workspacePath: string): Promise<string | null> {
    const htdocsPath = path.join(xamppPath, 'htdocs');
    const projectName = path.basename(workspacePath);
    const targetPath = path.join(htdocsPath, projectName);

    return new Promise((resolve) => {
        // Check if htdocs exists
        if (!fs.existsSync(htdocsPath)) {
            vscode.window.showErrorMessage(`htdocs folder not found at: ${htdocsPath}`);
            resolve(null);
            return;
        }

        // Check if project already exists in htdocs
        if (fs.existsSync(targetPath)) {
            vscode.window.showWarningMessage(`Project "${projectName}" already exists in htdocs. Using existing copy.`);
            resolve(targetPath);
            return;
        }

        // Copy project to htdocs using xcopy (Windows) or cp (Linux/Mac)
        const copyCommand = process.platform === 'win32'
            ? `xcopy "${workspacePath}" "${targetPath}" /E /I /H /Y`
            : `cp -r "${workspacePath}" "${targetPath}"`;

        vscode.window.showInformationMessage('Copying project to htdocs...');
        
        exec(copyCommand, (error, stdout, stderr) => {
            if (error) {
                console.error('Copy error:', error);
                vscode.window.showErrorMessage(`Failed to copy project to htdocs: ${error.message}`);
                resolve(null);
            } else {
                vscode.window.showInformationMessage(`Project copied to: ${targetPath}`);
                resolve(targetPath);
            }
        });
    });
}

export function deactivate() {
    stopLiveServer({ silent: true });
    statusBarItem?.dispose();
    statusBarLanItem?.dispose();
}

async function updateLanTooltipAsync(lanUrl: string, allIfaces: Array<{ name: string; address: string }>) {
    if (!statusBarLanItem) return;
    try {
        // Dynamically require qrcode and generate data URL
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        // @ts-ignore
        const qrcode = require('qrcode');
        const dataUrl = await qrcode.toDataURL(lanUrl);

        // Build markdown tooltip with image and interface list
        const ifaceLines = allIfaces.map(i => `- ${i.name} — ${i.address}`).join('\n');
        const md = new vscode.MarkdownString(`![QR](${dataUrl})\n\n**LAN URL:** ${lanUrl}\n\n**Interfaces:**\n${ifaceLines}`);
        md.isTrusted = true;
        statusBarLanItem.tooltip = md;
    } catch (err) {
        console.error('Failed to build LAN tooltip QR:', err);
        statusBarLanItem.tooltip = `LAN: ${allIfaces.map(i => i.address).join(', ')}`;
    }
}