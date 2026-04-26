<p align="center">
  <img src="src-tauri/icons/icon.png" width="80" height="80" alt="Sakura" />
</p>

<h1 align="center">Sakura</h1>

<p align="center"><strong>别开浏览器了</strong></p>

<p align="center">
  开发者桌面旁的即时问答窗口<br/>
  Alt+Space 秒出答案，搜过的永不重搜
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Tauri-v1.8-blue?logo=tauri" />
  <img src="https://img.shields.io/badge/React-18-61dafb?logo=react" />
  <img src="https://img.shields.io/badge/Rust-1.70+-orange?logo=rust" />
  <img src="https://img.shields.io/badge/Linux-supported-success" />
  <img src="https://img.shields.io/badge/macOS-supported-success" />
  <img src="https://img.shields.io/badge/Windows-supported-success" />
</p>

---

## 为什么需要 Sakura？

你在终端用 AI 助手写代码，突然想查个简单问题——

- **问 AI？** 浪费 token 和上下文，一个简单的事实查询占了对话窗口
- **开浏览器？** 切窗口、找网址、等加载，等你看完答案已经忘了刚才写到哪了
- **下次又忘了？** 浏览器 history 埋在几百条记录里，下次还得重新搜

**Sakura 解决这个问题：**

- **Alt+Space**，零摩擦唤起，问完即走
- **搜过的秒回来**，本地剪藏自动匹配，第二次问同样的问题不用等
- **剪藏 + 批注**，AI 提取精简知识点，加一句你自己的话，知识才真正是你的

## 功能

### 搜索

输入问题 → 网页搜索 + AI 流式总结 → 一眼看到答案。支持多轮追问，不用重新搜索。

### 零延迟回忆

搜过的问题再次搜索时，直接从本地剪藏库返回答案，不调 API，不等待。答案旁标注"来自剪藏"。

### 剪藏

觉得答案有价值？点书签按钮剪藏，AI 自动提取精简知识点。可以加一句批注——下次搜到时，你的批注也会跟着出来。

### 翻译

独立翻译 Tab，粘贴即译。自动检测语言方向，非中文翻中文，中文翻英文。

### 全局快捷键

`Alt+Space` 唤起/隐藏，`Alt+Shift+S` 一键剪藏剪贴板内容。不用离开当前工作。

### 樱花

三主题切换（樱花绽放 / 暮樱晚霞 / 夜樱梦幻），鼠标移动樱花跟随，点击花瓣绽放。好看，心情好。

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

### 配置

```bash
cp .env.example .env
```

编辑 `.env` 填入 API Key：

```env
VITE_TAVILY_API_KEY=your_tavily_api_key
VITE_STEPFUN_API_KEY=your_stepfun_api_key
VITE_STEPFUN_MODEL=step-3.5-flash
```

| Key | 获取地址 |
|-----|---------|
| Tavily | [tavily.com](https://tavily.com/) |
| Stepfun | [platform.stepfun.com](https://platform.stepfun.com/) |

### 运行

```bash
npm run tauri:dev
```

### 打包

```bash
npm run tauri:build
```

## 系统依赖

**Ubuntu / Debian**
```bash
sudo apt install libwebkit2gtk-4.0-dev build-essential curl wget libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
```

**macOS**
```bash
xcode-select --install
```

**Windows**
安装 [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)，包含 C++ 工作负载。

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Alt + Space` | 唤起 / 隐藏 |
| `Alt + Shift + S` | 剪藏剪贴板 |
| `Esc` | 隐藏 |
| `Ctrl + K` | 清空搜索 |
| `Ctrl + L` | 聚焦搜索框 |

## 技术栈

| 层 | 技术 |
|---|------|
| 桌面框架 | Tauri v1.8 + Rust |
| 前端 | React 18 + TypeScript + Vite |
| 样式 | Tailwind CSS + Framer Motion |
| 搜索 | [Tavily](https://tavily.com/) |
| LLM | [阶跃星辰 Stepfun](https://platform.stepfun.com/) |
| 存储 | 本地 JSON 文件 |

## 项目结构

```
src/
├── App.tsx                 # 主应用
├── themes.ts               # 三主题定义
├── components/
│   ├── CherryBlossom.tsx    # 樱花飘落背景
│   ├── SakuraCursor.tsx     # 鼠标樱花交互
│   ├── SearchBox.tsx        # 搜索输入
│   ├── SearchResults.tsx    # AI 回答 + 剪藏
│   ├── TranslatePanel.tsx   # 翻译面板
│   ├── ClipPanel.tsx        # 剪藏库
│   └── ...
└── services/
    ├── tavily.ts            # 搜索 API
    ├── stepfun.ts           # LLM（流式 + 知识提取）
    └── storage.ts           # 本地持久化

src-tauri/
├── src/main.rs              # Rust 后端
└── tauri.conf.json
```

## License

MIT
