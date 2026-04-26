# Sakura Search (樱搜)

AI 智能搜索桌面应用 —— 搜过的不会白搜

![Tauri](https://img.shields.io/badge/Tauri-v1.8-blue?logo=tauri)
![React](https://img.shields.io/badge/React-18-61dafb?logo=react)
![Rust](https://img.shields.io/badge/Rust-1.70+-orange?logo=rust)

## 特性

- **AI 搜索** — 输入问题，自动搜索网页并用 AI 生成简洁回答，支持流式输出
- **多轮追问** — 对搜索结果继续提问，保持上下文对话
- **零延迟回答** — 搜过的问题再次搜索时，直接从本地剪藏库返回答案，无需等待
- **智能剪藏** — 手动剪藏搜索结果，AI 自动提取精简知识点，支持添加个人批注
- **智能回忆** — 搜索时自动匹配已有剪藏，相关历史置顶展示
- **实时翻译** — 独立翻译 Tab，粘贴即译，自动检测语言方向
- **全局快捷键** — `Alt+Space` 一键唤起，`Alt+Shift+S` 剪藏剪贴板内容
- **三主题切换** — 樱花绽放 / 暮樱晚霞 / 夜樱梦幻
- **樱花交互** — 鼠标移动樱花跟随，点击花瓣绽放

## 截图

<!-- TODO: 添加截图 -->

## 技术栈

| 层 | 技术 |
|---|------|
| 桌面框架 | Tauri v1.8 + Rust |
| 前端 | React 18 + TypeScript + Vite |
| 样式 | Tailwind CSS + Framer Motion |
| 搜索 API | [Tavily](https://tavily.com/) |
| LLM API | [阶跃星辰 Stepfun](https://platform.stepfun.com/) |
| 数据存储 | 本地 JSON 文件（Tauri Commands） |

## 快速开始

### 环境要求

- Node.js 18+
- Rust 1.70+
- 系统依赖（见下方）

### 安装

```bash
git clone https://github.com/3651862/sakura-search.git
cd sakura-search
npm install
```

### 配置 API Key

复制环境变量模板并填入你的 API Key：

```bash
cp .env.example .env
```

编辑 `.env`：

```env
VITE_TAVILY_API_KEY=your_tavily_api_key
VITE_STEPFUN_API_KEY=your_stepfun_api_key
VITE_STEPFUN_MODEL=step-3.5-flash
```

- Tavily API Key: [tavily.com](https://tavily.com/) 注册获取
- Stepfun API Key: [platform.stepfun.com](https://platform.stepfun.com/) 注册获取

### 开发运行

```bash
npm run tauri:dev
```

### 构建打包

```bash
npm run tauri:build
```

## 系统依赖

### Ubuntu / Debian

```bash
sudo apt install libwebkit2gtk-4.0-dev build-essential curl wget libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
```

### macOS

```bash
xcode-select --install
```

### Windows

安装 [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)，包含 C++ 工作负载。

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Alt + Space` | 唤起 / 隐藏窗口 |
| `Alt + Shift + S` | 剪藏剪贴板内容 |
| `Esc` | 隐藏窗口 |
| `Ctrl + K` | 清空搜索 |
| `Ctrl + L` | 聚焦搜索框 |

## 项目结构

```
sakura-search/
├── src/
│   ├── App.tsx                 # 主应用
│   ├── themes.ts               # 主题定义
│   ├── types.ts                # 类型定义
│   ├── components/
│   │   ├── CherryBlossom.tsx    # 樱花飘落背景动画
│   │   ├── SakuraCursor.tsx     # 鼠标樱花跟随交互
│   │   ├── DecoLayer.tsx        # 装饰符号浮动层
│   │   ├── SearchBox.tsx        # 搜索输入框
│   │   ├── SearchResults.tsx    # 搜索结果 + AI回答 + 剪藏
│   │   ├── TranslatePanel.tsx   # 实时翻译面板
│   │   ├── ClipPanel.tsx        # 剪藏库侧面板
│   │   ├── ClipToast.tsx        # 剪藏成功提示
│   │   ├── TitleBar.tsx         # 标题栏 + Tab导航
│   │   └── Settings.tsx         # 快捷键设置
│   └── services/
│       ├── tavily.ts            # Tavily 搜索服务
│       ├── stepfun.ts           # Stepfun LLM (流式 + 知识提取)
│       └── storage.ts           # 本地数据持久化
├── src-tauri/
│   ├── src/main.rs              # Rust 后端 (Tauri Commands + 系统托盘 + 全局快捷键)
│   ├── Cargo.toml
│   └── tauri.conf.json
└── .env.example                 # API Key 配置模板
```

## License

MIT
