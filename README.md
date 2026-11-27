# CSC Museum Website

> CSC Museum（csc菜市场）Minecraft 基岩版生存服务器官网。
>
> Official website for CSC Museum, a Minecraft Bedrock survival server.

[简体中文](#简体中文) · [English](#english)

![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite 7](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Node](https://img.shields.io/badge/Node-20.19%2B%20%7C%2022.12%2B-339933?logo=nodedotjs&logoColor=white)

---

## 简体中文

### 项目简介

这是 **CSC Museum** 的官方网站。CSC Museum 是一个 Minecraft 基岩版生存服务器，以建筑、生电科技和友好社区为核心。

本项目已从 Vue 3 完整迁移到 **React 19 + Vite 7 + React Router 7**。迁移保持原有路由结构、DOM 类名和 CSS 选择器不变，主要目标是替换技术栈、减少重复代码并改善加载与交互性能，而不是重新设计页面。

### 页面与功能

| 路由 | 页面 | 功能 |
| :--- | :--- | :--- |
| `/` | 首页 | 服务器介绍、在线人数、IP / 端口复制、建筑跑马灯、特色卡片、QQ 群入口 |
| `/commands` | 指令列表 | 从 JSON 读取并分类展示服务器指令 |
| `/scenery` | 建筑风景 | 建筑图片瀑布流、大图预览、图片加载重试 |
| `/aboutus` | 关于我们 | 团队成员、玩家风采、集体合影 |
| `/tools` | 便捷功能 | 卫星云图入口、语音聊天占位页 |
| `/developing` | 开发中 | 功能开发中的占位页面 |

其他特性：

- 通过 `mcstatus.io` 查询基岩版服务器在线人数与版本。
- 一键复制服务器 IP、端口和 QQ 群号，兼容 HTTP 环境下的剪贴板降级。
- 首页视差滚动、导航栏明暗切换和图片跑马灯。
- 图片懒加载、异步解码和加载失败重试。
- 路由级代码分割，非首页页面按需加载。
- 全站响应式布局，保留 Minecraft 像素字体与视觉风格。

### 技术栈

- **React 19**
- **Vite 7**
- **TypeScript 5.9**
- **React Router 7**
- **CSS**：沿用原有页面样式，无 UI 框架依赖
- **图片处理**：`sharp`，用于生成 `building_tiny` 缩略图

### 环境要求

- Node.js `^20.19.0` 或 `>=22.12.0`
- npm 10+

### 快速开始

```sh
npm install
npm run dev        # 启动开发服务器
npm run build      # TypeScript 检查 + 生产构建
npm run preview    # 本地预览 dist
```

可选脚本：

```sh
npm run dev-slow   # 低速网络模拟，验证加载体验
npm run gen:tiny   # 重新生成建筑 tiny 缩略图
```

### 配置

全站服务器信息集中在 `src/config/site.ts`：

```ts
export const SITE = {
  name: 'CSC Museum',
  ip: 'play.csc2022.top',
  port: '进群查看->674166080',
  statusPort: 49886,
  qqGroup: '674166080',
  qqJoinUrl: 'https://qm.qq.com/q/k7TDguPCne',
  bilibili: 'https://space.bilibili.com/3494373285169866',
  bilibiliName: 'B站:Chips呀',
  fallbackVersion: '1.21.132',
}
```

修改服务器名称、IP、查询端口、QQ 群或外链时，只改这里，不要在组件里散落硬编码。

### 数据文件

- `public/imgs/data.json`：建筑、玩家、合影图片数据
- `public/commandPage/commands.json`：指令分类与条目
- `public/.htaccess`：Apache 单页应用回退规则
- `tools/generate_building_tiny.mjs`：建筑缩略图生成脚本

`/imgs/data.json` 与 `/commandPage/commands.json` 保持原路径，部署方可以继续沿用现有数据接入方式。

### 目录结构

```text
src/
├── config/site.ts          # 全站唯一服务器信息源
├── context/NavLight.ts     # 导航栏浅色文字模式
├── hooks/
│   ├── useJson.ts          # JSON 拉取与模块级缓存
│   ├── useServerStatus.ts  # mcstatus.io 状态轮询与指数退避
│   ├── useImagePreview.ts  # 大图预览与滚动锁定清理
│   └── usePreloadImage.ts  # 首屏图片预加载
├── components/             # NavBar / Footer / IpBox / OnlinePlayer / ImagePreview / SmartImage
├── pages/                  # Home / Commands / Scenery / AboutUs / Tools / Developing
├── styles/global.css       # reset、body 与共享字体
└── utils/clipboard.ts      # Clipboard API + HTTP 降级
```

### 部署

```sh
npm run build
```

构建产物位于 `dist/`。将 `dist/` 上传到任意静态站点服务器即可。

因为项目使用 `BrowserRouter`，服务器必须把未知路径回退到 `index.html`：

- **Apache**：仓库已提供 `public/.htaccess`，构建后会复制到 `dist/.htaccess`。
- **Nginx**：

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

- **Vercel / Netlify / Cloudflare Pages**：配置 SPA fallback 到 `index.html`。

### 性能与迁移说明

- 首页以下页面全部使用路由级 `lazy` 加载。
- 滚动视差使用 `requestAnimationFrame` 节流，并直接更新 ref 样式，避免每个滚动事件触发整页重渲染。
- 在线状态查询失败后指数退避，组件卸载时中止请求。
- 图片统一使用 `decoding="async"`，非首屏图片保持 `loading="lazy"`。
- 图片预览关闭或切换路由时自动释放 `body` 滚动锁。
- 原有路由、DOM 类名、CSS 选择器和数据文件路径保持兼容。

### 安全说明

站点本身不需要后端服务，服务器状态来自 `mcstatus.io` 公共 API。请不要把私人令牌、管理后台地址或其他敏感配置写入前端代码；前端环境变量和构建产物对访问者可见。

### 许可证

当前仓库尚未声明开源许可证。对外分发或商用前，请先补充 `LICENSE` 文件。

---

## English

### Overview

This is the official website of **CSC Museum**, a Minecraft Bedrock survival server focused on building, redstone/technical gameplay, and a friendly community.

The project has been fully migrated from Vue 3 to **React 19 + Vite 7 + React Router 7**. The migration preserves the original routes, DOM class names, and CSS selectors. The goal was to modernize the stack, remove duplicated code, and improve loading and interaction performance without redesigning the site.

### Pages and Features

| Route | Page | Features |
| :--- | :--- | :--- |
| `/` | Home | Server intro, online player count, IP/port copy, building marquee, feature cards, QQ group entry |
| `/commands` | Commands | Categorized server commands loaded from JSON |
| `/scenery` | Scenery | Building gallery, large-image preview, image retry |
| `/aboutus` | About Us | Team members, player showcase, group photos |
| `/tools` | Tools | Satellite map link and voice-chat placeholder |
| `/developing` | Developing | Placeholder page for unfinished features |

Other features:

- Queries Bedrock server status and version through `mcstatus.io`.
- One-click copy for server IP, port, and QQ group, with an HTTP clipboard fallback.
- Parallax hero, light/dark navigation switching, and an image marquee.
- Lazy image loading, async decoding, and automatic retry.
- Route-level code splitting for every page except the home page.
- Responsive layout with the original Minecraft-style pixel typography and visuals.

### Tech Stack

- **React 19**
- **Vite 7**
- **TypeScript 5.9**
- **React Router 7**
- **CSS**: original page styles preserved, no UI framework dependency
- **Image tooling**: `sharp` for generating `building_tiny` thumbnails

### Requirements

- Node.js `^20.19.0` or `>=22.12.0`
- npm 10+

### Quick Start

```sh
npm install
npm run dev        # Start the development server
npm run build      # Type-check and build for production
npm run preview    # Preview the production build locally
```

Optional scripts:

```sh
npm run dev-slow   # Simulate a slow network for loading tests
npm run gen:tiny   # Regenerate tiny building thumbnails
```

### Configuration

All server-facing information lives in `src/config/site.ts`:

```ts
export const SITE = {
  name: 'CSC Museum',
  ip: 'play.csc2022.top',
  port: '进群查看->674166080',
  statusPort: 49886,
  qqGroup: '674166080',
  qqJoinUrl: 'https://qm.qq.com/q/k7TDguPCne',
  bilibili: 'https://space.bilibili.com/3494373285169866',
  bilibiliName: 'B站:Chips呀',
  fallbackVersion: '1.21.132',
}
```

Change the server name, IP, status port, QQ group, or external links only in this file. Avoid scattering hard-coded values across components.

### Data Files

- `public/imgs/data.json`: building, player, and group-photo data
- `public/commandPage/commands.json`: command categories and entries
- `public/.htaccess`: Apache SPA fallback
- `tools/generate_building_tiny.mjs`: building thumbnail generator

The `/imgs/data.json` and `/commandPage/commands.json` paths are preserved so existing deployment data can be reused.

### Project Structure

```text
src/
├── config/site.ts          # Single source of truth for server info
├── context/NavLight.ts     # Cross-component navigation color state
├── hooks/
│   ├── useJson.ts          # JSON fetching with module-level cache
│   ├── useServerStatus.ts  # mcstatus.io polling with exponential backoff
│   ├── useImagePreview.ts  # Image preview and scroll-lock cleanup
│   └── usePreloadImage.ts  # Hero image preloading
├── components/             # NavBar / Footer / IpBox / OnlinePlayer / ImagePreview / SmartImage
├── pages/                  # Home / Commands / Scenery / AboutUs / Tools / Developing
├── styles/global.css       # Reset, body, and shared font declarations
└── utils/clipboard.ts      # Clipboard API + HTTP fallback
```

### Deployment

```sh
npm run build
```

The production output is written to `dist/`. Upload `dist/` to any static hosting provider.

Because the app uses `BrowserRouter`, the server must fall back to `index.html` for unknown paths:

- **Apache**: `public/.htaccess` is included and copied into `dist/.htaccess` during the build.
- **Nginx**:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

- **Vercel / Netlify / Cloudflare Pages**: configure an SPA fallback to `index.html`.

### Performance and Migration Notes

- Every page except the home page is route-level `lazy` loaded.
- Parallax scrolling is throttled with `requestAnimationFrame` and writes directly to refs, avoiding full-page re-renders on every scroll event.
- Failed status requests use exponential backoff; pending requests are aborted on unmount.
- Images use `decoding="async"` and non-hero images keep `loading="lazy"`.
- Closing an image preview or changing routes releases the `body` scroll lock automatically.
- Existing routes, DOM class names, CSS selectors, and data-file paths remain compatible.

### Security

The site has no backend of its own; server status comes from the public `mcstatus.io` API. Do not put private tokens, admin endpoints, or other sensitive configuration into frontend code. Frontend environment variables and build output are visible to visitors.

### License

No license file is currently declared. Add a `LICENSE` file before redistribution or commercial use.
