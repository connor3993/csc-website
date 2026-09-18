# csc-website-react

CSC Museum（csc菜市场，Minecraft 基岩版服务器）官网 —— 由 Vue 3 完整迁移至 **React 19 + Vite 7 + react-router 7**。

## 开发

```sh
npm install
npm run dev        # 启动开发服务器
npm run build      # 生产构建
npm run preview    # 本地预览构建产物
```

## 目录结构

```
src/
├── config/site.js        # 全站唯一数据源：名称 / IP / 群号 / 外链
├── context/NavLight.js   # 导航栏浅色文字模式的跨组件通信
├── hooks/
│   ├── useJson.js        # JSON 拉取（模块级缓存，多页面共用 data.json）
│   ├── useServerStatus.js# mcstatus.io 在线人数轮询（指数退避）
│   └── useImagePreview.js# 大图预览 + 背景滚动锁定（自动清理）
├── components/           # NavBar / Footer / IpBox / OnlinePlayer / ImagePreview / SmartImage
├── pages/                # Home / Commands / Scenery / AboutUs / Tools / Developing（懒加载）
├── styles/global.css     # reset + body + 共享 @font-face
└── utils/clipboard.js    # 剪贴板（Clipboard API + HTTP 降级）
```

## 相对 Vue 版的主要改动

### 消除冗余
- 首页 4 段手写的 feature 卡片 HTML → `FEATURES` 数组数据驱动（加卡片 = 加一条数据）；
- `IpBox` 两行重复的复制逻辑 → 字段数组 map 渲染 + 单一复制状态；
- 服务器名 / IP / 群号 / B 站链接散落在 App、Footer、Home 三处 → 收敛到 `config/site.js`；
- `zipImages` 在 Scenery、AboutUs 各写一份 → 收敛到 `hooks/useJson.js`；
- 三个页面重复的 fetch JSON 样板 → `useJson` hook（附带模块级缓存）；
- `@font-face mojangles` 在 NavBar.css、IpBox.css 各声明一次 → 移入 `global.css`；
- Scenery 页里 DOM 操作式的图片重试 → 声明式 `SmartImage` 组件，全站复用（跑马灯也获得重试能力）；
- 删除从未被渲染的 `.table-header` 死样式。

### 性能
- 除首页外全部页面路由级代码分割（`lazy`）；
- 滚动视差不再每个 scroll tick 重渲染整页：`requestAnimationFrame` 节流 + 直接改 ref 样式，导航栏变色只在跨越阈值时更新一次 state；
- 在线状态轮询改为指数退避（修复原版离线时每 2s 无限重试打接口），卸载时 `AbortController` 中止请求；
- 图片统一 `decoding="async"`，非首屏图保持 `loading="lazy"`。

### 顺手修的 bug
- 预览大图打开时切换路由，`body` 滚动锁永不释放 → `useImagePreview` 的 effect 自动清理；
- 桌面端 hover「便捷功能」下拉菜单被 `v-show` 的内联 `display:none` 永久隐藏 → 移动端手风琴改为纯 CSS 控制，桌面 hover 恢复正常；
- 复制成功提示注释写 1.5s 实际 5s → 统一为 1.5s。

### 行为保持一致
- 路由结构、页面 DOM 类名、CSS 选择器与 Vue 版一致，样式零改动迁移（vue-router 的 `router-link-active` 对应 NavLink 的 `active`）；
- `/imgs/data.json`、`/commandPage/commands.json` 数据文件原样保留，部署方数据接入方式不变；
- `.htaccess`（Apache SPA 回退）与 `tools/` 图片生成脚本原样保留。
