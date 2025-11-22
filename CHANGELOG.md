# Changelog

All notable changes to the "Live Server" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] - 2025-10-08
## [1.0.30] - 2025-11-22

### Changed
- Auto-open browser now forced to use `localhost` even when LAN mode enabled for consistency.
- Removed interactive "Open Browser" prompt; browser opens automatically on start (static & PHP).

### Added
- Internal logic to parse live-server port and reconstruct deterministic `http://localhost:<port>` URL.

### Fixed
- Potential confusion when LAN access enabled opening `0.0.0.0` or local IP directly.


### Added
- PHP support: Automatic detection of PHP projects and use of PHP built-in server
- Auto-detection: Extension now detects project type (PHP or static) automatically
- Improved status messages: Status bar and notifications now reflect server type
- XAMPP integration: Option to use PHP from XAMPP installation
- XAMPP Apache support: Option to use Apache from XAMPP with confirmation dialog
- Apache status check: Automatically checks if Apache is running before proceeding
- Auto-start Apache: Attempts to start Apache service automatically when needed

## [1.0.1]
- Fix project URL

## [1.0.0] - 2025-09-20

### Added
- Initial release of Live Server extension
- Toggle "Go Live" button in status bar (bottom right corner)
- One-click start/stop live server functionality
- Integration with `npx live-server --open=./` command
- Automatic browser opening with server address
- Status indicator showing server URL and status
- Command Palette integration with multiple commands:
  - `Live Server: Toggle Live Server`
  - `Live Server: Open with Live Server`
  - `Live Server: Stop Live Server`
- Context menu integration for HTML files
- Live reload functionality via live-server
- Process management for cross-platform compatibility
- Error handling and user feedback notifications

### Features
- 🚀 **Toggle Button**: Status bar button for easy access
- 🔄 **One-Click Operation**: Start and stop with single click
- 🌐 **Auto Browser**: Automatically opens browser to server URL
- 📊 **Status Display**: Shows server status and URL in status bar
- ⚡ **Live Reload**: Real-time file watching and browser refresh
- 🎯 **Context Menu**: Right-click HTML files to start server
- ⌨️ **Command Palette**: Full command palette integration
- 🔧 **Cross Platform**: Works on Windows, macOS, and Linux

### Technical
- Uses `npx live-server --open=./` for server functionality
- TypeScript implementation with full type safety
- Proper activation events for performance optimization
- Child process management for server lifecycle
- Status bar API integration
- Command registration and management
- Error handling and user notifications