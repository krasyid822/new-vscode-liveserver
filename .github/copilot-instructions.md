# Live Server VS Code Extension

Ekstensi VS Code yang menyediakan toggle "Go Live" di status bar untuk menjalankan live server lokal.

## Project Structure

- `src/extension.ts` - Main extension entry point, commands, dan status bar logic
- `package.json` - Extension manifest dan dependencies
- `tsconfig.json` - TypeScript configuration
- `.vscode/` - VS Code debugging dan task configuration

## Features

- Toggle "Go Live" button di status bar pojok kanan bawah
- Menggunakan `npx live-server --open=./` untuk menjalankan server
- Auto browser opening dengan alamat server
- One-click start/stop functionality
- Status indicator dengan alamat server
- Live reload via live-server

## Development

1. Install dependencies: `npm install`
2. Compile TypeScript: `npm run compile`
3. Press F5 to launch Extension Development Host
4. Test toggle button di status bar

## Commands

- `extension.liveServer.toggle` - Toggle start/stop live server
- `extension.liveServer.start` - Start the live server
- `extension.liveServer.stop` - Stop the live server

## How It Works

1. Status bar menampilkan "○ Go Live" saat server tidak berjalan
2. Klik tombol untuk menjalankan `npx live-server --open=./`
3. Status bar berubah menjadi "📡 Go Live" dengan URL server
4. Browser otomatis terbuka ke alamat server
5. Klik lagi untuk menghentikan server