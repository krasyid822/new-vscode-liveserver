# Live Server VS Code Extension

Ekstensi VS Code yang menyediakan toggle "Go Live" di status bar untuk menjalankan live server lokal dengan mudah. Mendukung static files dan PHP projects secara otomatis.

## Features

- 🚀 **Toggle Button**: Tombol "Go Live" di status bar pojok kanan bawah
- 🔄 **One-Click Start/Stop**: Klik sekali untuk start, klik lagi untuk stop
- 🌐 **Auto Browser Open**: Otomatis membuka browser dengan alamat server (dipaksa ke `localhost` agar konsisten)
- 📊 **Status Indicator**: Status bar menampilkan informasi server + URL LAN ketika diaktifkan
- ⚡ **Live Reload**: Menggunakan `npx live-server` untuk proyek static, lengkap dengan live reload
- 🔒 **HTTPS on LAN**: Opsi self-signed certificate otomatis ketika LAN access aktif (static project)
- 🐘 **PHP Support**: Otomatis mendeteksi file `.php` dan menjalankan PHP built-in server / PHP dari XAMPP
- 🏠 **XAMPP Integration**: Gunakan PHP atau Apache dari instalasi XAMPP + opsi copy ke `htdocs`
- 🛡️ **Workspace Guard**: `strictWorkspaceRoot` memastikan server tidak memuat folder dari workspace lain

## Installation

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Live Server"
4. Click Install

## Configuration

Semua opsi tersedia di **Settings > Extensions > Live Server**:

| Setting | Default | Deskripsi |
| --- | --- | --- |
| `liveServer.useXampp` | `false` | Gunakan PHP dari instalasi XAMPP (bukannya PHP sistem). |
| `liveServer.xamppPath` | `C:\xampp` | Lokasi instalasi XAMPP untuk mencari `php.exe` dan Apache. |
| `liveServer.useXamppApache` | `false` | Pakai Apache dari XAMPP (perlu Apache sedang berjalan atau akan dimulai otomatis). |
| `liveServer.autoCopyToHtdocs` | `false` | Tawarkan copy project ke `htdocs` saat memakai Apache untuk memastikan path sesuai. |
| `liveServer.enableLanAccess` | `false` | Bind server ke `0.0.0.0` sehingga bisa diakses dari perangkat lain di LAN. |
| `liveServer.enableHttpsOnLan` | `false` | Gunakan HTTPS (sertifikat self-signed otomatis) untuk server static ketika LAN access aktif. Akan membuka `https://<ip>` dan mungkin perlu menandai trust di browser. |
| `liveServer.strictWorkspaceRoot` | `true` | Membatasi root server ke single workspace aktif. Server akan berhenti jika daftar workspace berubah, dan menolak start saat multi-root masih terbuka. Cocok untuk mencegah konten folder lain ikut terbuka. |

### Catatan XAMPP

Jika Anda ingin memakai PHP atau Apache dari XAMPP:

1. Aktifkan `Use Xampp` atau `Use Xampp Apache` sesuai kebutuhan.
2. Pastikan `Xampp Path` menunjuk ke folder instalasi (default sudah `C:\xampp`).
3. Saat Apache dipilih, ekstensi akan memeriksa status Apache, menawarkan start otomatis/open control panel, dan dapat menyalin project ke `htdocs` bila opsi auto copy diaktifkan.

## Usage

Ekstensi ini secara otomatis mendeteksi tipe project:
- **PHP Projects**: Jika ada file `.php` di workspace, akan menggunakan PHP built-in server (`php -S localhost:8000`) atau PHP dari XAMPP jika disetel.
- **Static Projects**: Jika tidak ada file PHP, akan menggunakan live-server dengan live reload (opsional HTTPS + LAN).

### Using Status Bar Toggle

1. **Start Server**: 
   - Klik tombol "○ Go Live" di status bar (pojok kanan bawah)
   - Server akan start sesuai tipe project dan browser otomatis terbuka
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

### HTTPS on LAN

1. Aktifkan `Enable Lan Access` dan `Enable Https On Lan` di Settings.
2. Saat pertama kali dijalankan, extension akan membuat sertifikat self-signed dan menyimpannya di global storage VS Code.
3. Browser akan membuka `https://localhost:<port>`; pada perangkat lain gunakan URL LAN di tooltip. Tandai sertifikat sebagai trusted di browser jika muncul peringatan.

## How It Works

Ekstensi ini menggunakan `npx live-server --open=./` untuk:
1. Menjalankan local development server
2. Otomatis membuka browser ke alamat server
3. Menyediakan live reload functionality
4. Menampilkan status di VS Code status bar

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
- Paket `live-server` membawa dependency lama (chokidar v1/v2). Gunakan hanya untuk kebutuhan development lokal dan nonaktifkan LAN jika tidak diperlukan.

## Changelog

### 1.0.0
- Toggle "Go Live" button di status bar
- Integrasi dengan npx live-server --open=./
- Auto browser opening dengan alamat server
- Start/stop functionality dengan satu klik
- Status indicator di status bar