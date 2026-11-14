# Rolithax Launcher 官网

官网使用 Vue 3 和 Vite。桌面与手机共享同一个首页，下载页独立访问。

## 本地运行

需要 Node.js 22.18+ 或 24.12+。

```sh
npm ci
npm run dev
npm run build
npm run preview
```

生产文件位于 `dist/`。相对资源路径兼容站点根目录和子目录。旧的 `index.html`、`mobile.html` 和 `download.html` 仍可访问，`mobile.html` 使用响应式首页。

## 下载页

下载页从 GitHub 和 CNB 读取公开 Release，并显示各附件的版本、来源与 SHA-256。新版 Android 只有一个 APK。Windows 和 Linux 正式包来自 GitHub。实时查询失败时，页面使用标有版本的公开发布快照。

在 Cloudflare Pages 上，`/api/releases/cnb` 通过 Pages Function 读取 CNB 最新版本。该接口只访问预设的 CNB 地址。静态托管仍可使用 GitHub 实时数据和 CNB 发布快照。

## Cloudflare Pages

正式站点 [rolithax.wludy.xyz](https://rolithax.wludy.xyz) 由 Cloudflare Pages 项目 `mslx-android-website` 部署。Cloudflare 监听本仓库的 `main` 分支，运行 `npm run build`，发布 `dist/`，并编译仓库根目录的 `functions/`。部署状态可在 GitHub 提交的 **Cloudflare Pages** 检查中查看。

在仓库根目录运行 Wrangler 可以本地预览 Pages Functions。

```sh
npm ci
npm run build
npx wrangler@4.158.0 pages dev dist --compatibility-date=2026-11-04
```
