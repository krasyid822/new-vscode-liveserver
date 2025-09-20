# 📦 Panduan Install dan Publikasi VS Code Extension

## 🔧 Install Extension Secara Lokal

### Method 1: Install dari VSIX Package

1. **Package Extension**:
   ```bash
   npm install -g vsce
   vsce package
   ```

2. **Install VSIX File**:
   - Buka VS Code
   - Press `Ctrl+Shift+P`
   - Type "Extensions: Install from VSIX..."
   - Pilih file `.vsix` yang dihasilkan

### Method 2: Development Mode

1. **Clone/Copy Project**:
   ```bash
   git clone [your-repo] atau copy folder ini
   cd new-vscode-liveserver
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   npm run compile
   ```

3. **Launch Extension Development Host**:
   - Buka folder di VS Code
   - Press `F5` untuk debug mode
   - Atau press `Ctrl+Shift+P` → "Developer: Reload Window"

## 🌐 Publikasi ke VS Code Marketplace

### Persiapan Sebelum Publikasi

1. **Update Package.json**:
   - Ganti `publisher` dari "your-publisher-name" ke nama publisher Anda
   - Pastikan `name` unik di marketplace
   - Update `version`, `description`, dan `keywords`

2. **Tambahkan File yang Diperlukan**:
   - `README.md` (sudah ada)
   - `CHANGELOG.md`
   - `LICENSE`
   - Icon extension (opsional)

3. **Test Extension Thoroughly**:
   - Test semua functionality
   - Test di berbagai OS (Windows, Mac, Linux)
   - Pastikan tidak ada error

### Langkah Publikasi

#### 1. Setup Publisher Account

1. **Buat Azure DevOps Account**:
   - Kunjungi https://dev.azure.com
   - Sign up dengan Microsoft account

2. **Buat Personal Access Token**:
   - Go to User Settings → Personal Access Tokens
   - Create new token dengan scope "Marketplace (publish)"
   - Save token dengan aman

3. **Create Publisher**:
   ```bash
   vsce create-publisher [publisher-name]
   ```
   
   Atau via web: https://marketplace.visualstudio.com/manage

#### 2. Login ke Publisher Account

```bash
vsce login [publisher-name]
```
Masukkan Personal Access Token when prompted.

#### 3. Update Package.json

```json
{
  "name": "live-server-extension",
  "publisher": "your-publisher-name",
  "version": "1.0.0",
  "displayName": "Live Server",
  "description": "Launch a development local Server with live reload feature",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/your-repo.git"
  },
  "bugs": {
    "url": "https://github.com/yourusername/your-repo/issues"
  },
  "homepage": "https://github.com/yourusername/your-repo#readme",
  "icon": "icon.png"
}
```

#### 4. Publikasi Extension

```bash
# Publish extension
vsce publish

# Atau publish dengan increment version
vsce publish patch  # 1.0.0 → 1.0.1
vsce publish minor  # 1.0.0 → 1.1.0
vsce publish major  # 1.0.0 → 2.0.0
```

## 📋 Checklist Sebelum Publikasi

### ✅ Required Files
- [ ] `package.json` dengan informasi lengkap
- [ ] `README.md` dengan dokumentasi yang baik
- [ ] `CHANGELOG.md` dengan riwayat perubahan
- [ ] `LICENSE` file
- [ ] Icon extension (128x128 px, format PNG)

### ✅ Package.json Requirements
- [ ] `name`: Unique dan descriptive
- [ ] `publisher`: Registered publisher name
- [ ] `version`: Semantic versioning
- [ ] `description`: Clear dan informative
- [ ] `categories`: Appropriate category
- [ ] `keywords`: Relevant keywords
- [ ] `repository`: Git repository URL
- [ ] `bugs`: Issue tracker URL
- [ ] `license`: License identifier

### ✅ Functionality Tests
- [ ] Toggle button works correctly
- [ ] Server starts and stops properly
- [ ] Browser opens automatically
- [ ] Status bar updates correctly
- [ ] Commands work from Command Palette
- [ ] Context menu works on HTML files
- [ ] No console errors
- [ ] Works on different file types

## 🔄 Update Extension

Untuk update extension yang sudah dipublikasi:

1. **Update Code**
2. **Update Version** di package.json
3. **Update CHANGELOG.md**
4. **Test Changes**
5. **Publish Update**:
   ```bash
   vsce publish
   ```

## 📊 Monitor Extension

1. **Marketplace Stats**:
   - Kunjungi https://marketplace.visualstudio.com/manage
   - View downloads, ratings, reviews

2. **User Feedback**:
   - Monitor GitHub issues
   - Respond to marketplace reviews
   - Update based on feedback

## 🚨 Troubleshooting

### Common Issues:

1. **"Publisher not found"**:
   - Pastikan publisher sudah dibuat
   - Login dengan benar: `vsce login [publisher]`

2. **"Extension name already exists"**:
   - Ganti `name` di package.json
   - Check availability di marketplace

3. **"Invalid version"**:
   - Gunakan semantic versioning (x.y.z)
   - Version harus lebih tinggi dari yang sudah ada

4. **"Missing required fields"**:
   - Lengkapi semua field required di package.json
   - Tambahkan repository, bugs, homepage

## 💡 Tips Publikasi

1. **Buat Extension Icon** yang menarik (128x128px)
2. **Tulis README yang comprehensive** dengan screenshots
3. **Gunakan keywords yang relevan** untuk SEO
4. **Test di multiple platforms** sebelum publish
5. **Respond to user feedback** dengan cepat
6. **Regular updates** untuk maintain quality

## 📈 Promote Extension

1. **Social Media**: Share di Twitter, LinkedIn, Reddit
2. **Blog Post**: Tulis artikel tentang extension
3. **GitHub**: Add topics dan description yang baik
4. **Community**: Share di VS Code communities
5. **Documentation**: Buat video tutorial (YouTube)