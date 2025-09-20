import * as vscode from 'vscode';
import { exec, ChildProcess } from 'child_process';
import * as path from 'path';

let liveServerProcess: ChildProcess | undefined;
let statusBarItem: vscode.StatusBarItem;
let isServerRunning = false;
let serverUrl = '';

export function activate(context: vscode.ExtensionContext) {
    console.log('Live Server extension is now active!');

    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'extension.liveServer.toggle';
    updateStatusBar();
    statusBarItem.show();

    // Register toggle command
    const toggleCommand = vscode.commands.registerCommand('extension.liveServer.toggle', () => {
        if (isServerRunning) {
            stopLiveServer();
        } else {
            startLiveServer();
        }
    });

    // Register explicit start and stop commands
    const startCommand = vscode.commands.registerCommand('extension.liveServer.start', () => {
        if (!isServerRunning) {
            startLiveServer();
        }
    });

    const stopCommand = vscode.commands.registerCommand('extension.liveServer.stop', () => {
        if (isServerRunning) {
            stopLiveServer();
        }
    });

    context.subscriptions.push(toggleCommand, startCommand, stopCommand, statusBarItem);
}

function updateStatusBar() {
    if (isServerRunning) {
        statusBarItem.text = "$(broadcast) Go Live";
        statusBarItem.tooltip = `Live Server running at ${serverUrl}. Click to stop.`;
        statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
    } else {
        statusBarItem.text = "$(circle-large-outline) Go Live";
        statusBarItem.tooltip = "Click to start Live Server";
        statusBarItem.backgroundColor = undefined;
    }
}

function startLiveServer() {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder found. Please open a folder first.');
        return;
    }

    const workspacePath = workspaceFolder.uri.fsPath;
    
    // Use npx live-server with --open=./ parameter
    const command = 'npx live-server --open=./';
    
    vscode.window.showInformationMessage('Starting Live Server...');
    
    liveServerProcess = exec(command, {
        cwd: workspacePath
    }, (error, stdout, stderr) => {
        if (error) {
            console.error(`Live Server error: ${error}`);
            vscode.window.showErrorMessage(`Failed to start Live Server: ${error.message}`);
            isServerRunning = false;
            updateStatusBar();
            return;
        }
    });

    if (liveServerProcess) {
        // Listen for output to get the server URL
        liveServerProcess.stdout?.on('data', (data: string) => {
            console.log(`Live Server: ${data}`);
            
            // Extract URL from live-server output
            const urlMatch = data.match(/http:\/\/[^\s]+/);
            if (urlMatch) {
                serverUrl = urlMatch[0];
                isServerRunning = true;
                updateStatusBar();
                
                // Show success message with option to open browser
                vscode.window.showInformationMessage(
                    `Live Server started at ${serverUrl}`,
                    'Open Browser'
                ).then((selection: string | undefined) => {
                    if (selection === 'Open Browser') {
                        vscode.env.openExternal(vscode.Uri.parse(serverUrl));
                    }
                });
            }
        });

        liveServerProcess.stderr?.on('data', (data: string) => {
            console.error(`Live Server stderr: ${data}`);
        });

        liveServerProcess.on('close', (code) => {
            console.log(`Live Server process exited with code ${code}`);
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

        // Set initial status
        isServerRunning = true;
        serverUrl = 'Starting...';
        updateStatusBar();
    }
}

function stopLiveServer() {
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
        
        liveServerProcess = undefined;
        isServerRunning = false;
        serverUrl = '';
        updateStatusBar();
        
        vscode.window.showInformationMessage('Live Server stopped');
    }
}

export function deactivate() {
    stopLiveServer();
    statusBarItem?.dispose();
}