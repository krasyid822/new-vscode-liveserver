# Live Server VS Code Extension

Ekstensi VS Code yang menyediakan toggle "Go Live" di status bar untuk menjalankan live server lokal dengan mudah. Ini menggantikan Live Server tradisional yang memiliki sistem path yang berbeda dengan Github Pages misalnya, yang mana itu memicu error 404 disalah satunya.

## Features

- 🚀 **Toggle Button**: Tombol "Go Live" di status bar pojok kanan bawah
- 🔄 **One-Click Start/Stop**: Klik sekali untuk start, klik lagi untuk stop
- 🌐 **Auto Browser Open**: Otomatis membuka browser dengan alamat server
- 📊 **Status Indicator**: Status bar menampilkan informasi server
- ⚡ **Live Reload**: Menggunakan npx live-server dengan fitur live reload

## Installation

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Live Server"
4. Click Install

## Usage

### Using Status Bar Toggle

1. **Start Server**: 
   - Klik tombol "○ Go Live" di status bar (pojok kanan bawah)
   - Server akan start dan browser otomatis terbuka
   - Status bar berubah menjadi "📡 Go Live" dengan alamat server

2. **Stop Server**:
   - Klik tombol "📡 Go Live" di status bar
   - Server akan berhenti
   - Status bar kembali ke "○ Go Live"

### Using Command Palette

1. **Start Server**:
   - Press `Ctrl+Shift+P`
   - Type "Live Server: Open with Live Server" atau "Live Server: Toggle Live Server"
   - Press Enter

2. **Stop Server**:
   - Press `Ctrl+Shift+P`
   - Type "Live Server: Stop Live Server" atau "Live Server: Toggle Live Server"
   - Press Enter

### Using Context Menu

- Right-click on an HTML file in the Explorer
- Select "Open with Live Server"

## How It Works

Ekstensi ini menggunakan `npx live-server --open=./` untuk:
1. Menjalankan local development server
2. Otomatis membuka browser ke alamat server
3. Menyediakan live reload functionality
4. Menampilkan status di VS Code status bar

## Configuration

Currently uses default live-server settings. Future versions will include customizable options.

## Commands

- `Live Server: Toggle Live Server` - Toggle start/stop server
- `Live Server: Open with Live Server` - Start the live server
- `Live Server: Stop Live Server` - Stop the live server

## Development

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- VS Code

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Compile the TypeScript:
   ```bash
   npm run compile
   ```
4. Open in VS Code and press F5 to launch Extension Development Host

### Building

```bash
npm run compile
```

## Requirements

- live-server package (akan diinstall otomatis via npx)
- Node.js untuk menjalankan live-server

## Known Issues

- Pada Windows, proses live-server mungkin perlu dihentikan secara manual jika terjadi error
- Status bar mungkin perlu refresh manual dalam beberapa kasus

## Changelog

### 1.0.0
- Toggle "Go Live" button di status bar
- Integrasi dengan npx live-server --open=./
- Auto browser opening dengan alamat server
- Start/stop functionality dengan satu klik
- Status indicator di status bar