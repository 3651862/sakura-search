# Sakura 构建指南

## 环境要求

- Node.js 18+
- Rust 1.70+
- 系统依赖（根据平台）

## 安装依赖

```bash
npm install
```

## 开发模式运行

```bash
npm run tauri:dev
```

## 构建生产版本

### macOS

```bash
npm run tauri:build
```

构建完成后，安装包位于：
- `src-tauri/target/release/bundle/dmg/*.dmg`

### Windows

```bash
npm run tauri:build
```

构建完成后，安装包位于：
- `src-tauri/target/release/bundle/msi/*.msi`
- `src-tauri/target/release/bundle/nsis/*.exe`

### Linux

```bash
npm run tauri:build
```

构建完成后，安装包位于：
- `src-tauri/target/release/bundle/deb/*.deb`
- `src-tauri/target/release/bundle/appimage/*.AppImage`

## 清理构建缓存

```bash
# 清理前端构建
rm -rf dist

# 清理 Rust 构建
cd src-tauri
cargo clean
```

## 常见问题

### 构建失败：Rust 未安装

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### 构建失败：缺少系统依赖

**macOS:**
```bash
xcode-select --install
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install libwebkit2gtk-4.0-dev build-essential curl wget libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
```

**Windows:**
安装 Visual Studio Build Tools，包含 C++ 工作负载
