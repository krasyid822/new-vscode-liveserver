import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { GenerateOptions } from 'selfsigned';

const CERT_FILE = 'lan-cert.pem';
const KEY_FILE = 'lan-key.pem';
const CONFIG_FILE = 'lan-https.json';

async function ensureDir(dir: string): Promise<void> {
	await fs.promises.mkdir(dir, { recursive: true });
}

function getStoragePath(context: vscode.ExtensionContext): string {
	if (context.globalStorageUri) {
		return context.globalStorageUri.fsPath;
	}
	if (context.globalStoragePath) {
		return context.globalStoragePath;
	}
	return path.join(os.tmpdir(), 'live-server');
}

async function generateCertificates(certPath: string, keyPath: string): Promise<void> {
	const attrs = [{ name: 'commonName', value: 'Live Server LAN' }];
	const options: GenerateOptions = {
		days: 365,
		keySize: 2048,
		algorithm: 'sha256'
	};

	let selfsignedModule: any;
	try {
		selfsignedModule = await import('selfsigned');
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		throw new Error(`Failed to load selfsigned dependency: ${message}`);
	}
	const generator = selfsignedModule.default ?? selfsignedModule;
	const pems = generator.generate(attrs, options);
	await fs.promises.writeFile(certPath, pems.cert, { encoding: 'utf8' });
	await fs.promises.writeFile(keyPath, pems.private, { encoding: 'utf8' });
}

export async function ensureHttpsConfig(context: vscode.ExtensionContext): Promise<string> {
	const storageDir = path.join(getStoragePath(context), 'https');
	await ensureDir(storageDir);

	const certPath = path.join(storageDir, CERT_FILE);
	const keyPath = path.join(storageDir, KEY_FILE);
	const configPath = path.join(storageDir, CONFIG_FILE);

	const certExists = fs.existsSync(certPath);
	const keyExists = fs.existsSync(keyPath);

	if (!certExists || !keyExists) {
		await generateCertificates(certPath, keyPath);
	}

	const httpsConfig = {
		cert: certPath,
		key: keyPath
	};
	await fs.promises.writeFile(configPath, JSON.stringify(httpsConfig, null, 2), { encoding: 'utf8' });
	return configPath;
}
