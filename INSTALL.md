# 🚀 Quick Installation & Testing Script

## Install Extension Locally

### Option 1: Install dari VSIX (Recommended)
```bash
# Install extension dari VSIX file
code --install-extension live-server-extension-1.0.0.vsix
```

### Option 2: Install via VS Code UI
1. Open VS Code
2. Press `Ctrl+Shift+P`
3. Type "Extensions: Install from VSIX..."
4. Select file: `live-server-extension-1.0.0.vsix`

## Test Extension

### 1. Restart VS Code
```bash
# Restart VS Code to load the extension
code .
```

### 2. Test Toggle Button
- Look for "○ Go Live" button in status bar (bottom right)
- Click it to start live server
- Should change to "📡 Go Live" with URL
- Browser should open automatically

### 3. Test Commands
Press `Ctrl+Shift+P` and try:
- "Live Server: Toggle Live Server"
- "Live Server: Open with Live Server"  
- "Live Server: Stop Live Server"

### 4. Test Context Menu
- Right-click on `test.html` file
- Select "Open with Live Server"

## Uninstall (if needed)
```bash
# Uninstall extension
code --uninstall-extension rasyid-kurniawan.live-server-extension
```

## Publish to Marketplace

### Prerequisites
1. Create Azure DevOps account
2. Create Personal Access Token
3. Create Publisher account

### Commands
```bash
# Login to publisher account
vsce login [your-publisher-name]

# Publish extension
vsce publish

# Or publish with version increment
vsce publish patch   # 1.0.0 → 1.0.1
vsce publish minor   # 1.0.0 → 1.1.0
vsce publish major   # 1.0.0 → 2.0.0
```

## Files Generated
- `live-server-extension-1.0.0.vsix` - Installable extension package
- Size: ~8.67 KB (optimized)
- Contains: compiled JS, package.json, README, LICENSE

## Extension Info
- **Name**: live-server-extension
- **Publisher**: rasyid-kurniawan
- **Version**: 1.0.0
- **Category**: Other
- **Engine**: VS Code ^1.74.0