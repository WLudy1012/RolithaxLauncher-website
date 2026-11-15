# Rolithax Launcher 官网

Vue 3 官网，支持明暗主题、手机布局与 Android / Windows / Linux 下载。首页采用居中的产品介绍、功能示意、Android 实机截图、连接流程和常见问题；下载页保留来源、版本与 SHA-256。

动效包括首屏分批入场、滚动渐入、桌面鼠标倾斜、截图交叉淡入淡出、卡片悬浮与菜单反馈。使用浏览器原生动画 API，不引入动画库；尊重 `prefers-reduced-motion`，键盘焦点进入时立即取消遮挡内容的入场动画。SSR 和无 JavaScript 页面始终保留正文。

## 本地开发

需要 Node.js 22.18+ 或 24.12+。

```sh
npm ci
npm run dev
npm run build
npm test
npm run dev:worker
```

`dev` 用于 Vue 页面开发；`dev:worker` 在构建后启动本地 Cloudflare Workers 运行时，验证 SSR、重定向及 CNB 接口。`npm run preview` 可查看构建时生成的静态 HTML。

## 渲染与搜索引擎

`server/worker.js` 使用 Vue `renderToString` 处理 `/` 和 `/download`，浏览器使用同一组件树完成 hydration。Googlebot、Bingbot 和普通访客收到相同的完整正文，不依赖 User-Agent 分流，不维护爬虫专用内容。

`scripts/build.mjs` 先构建浏览器资源，再打包 `dist/_worker.js`，同时生成完整的静态 HTML 作为兜底。图片与脚本直接走静态资源。正式 HTML 响应带有 `X-Rolithax-Render: vue-ssr`；Worker 渲染失败而静态回退成功时为 `prerender-fallback`。预览域名的 SSR 响应设为 `noindex`。

旧的 `/index.html`、`/mobile`、`/mobile.html` 重定向至 `/`，`/download.html` 和 `/download/` 重定向至 `/download`。提供 canonical、Open Graph、robots.txt 和 sitemap.xml。未知地址返回 404。

测试覆盖 Googlebot / Bingbot / 普通浏览器的完整 HTML 与一致性、旧链接、HEAD、预览 noindex、404 和静态兜底。搜索引擎是否收录仍由搜索服务决定。

## 下载数据

SSR 首次展示仓库内已核对的公开发布快照，明确标记为「发布快照」。页面加载后同步 GitHub 与 CNB 最新版本；请求失败保留可用下载链接。Java 运行时按需下载。

`/api/releases/cnb` 由 Worker 显式调用原有 CNB 处理器，仅访问固定上游，限制响应体积与请求时间。启用 `_worker.js` 后 Pages 不再自动路由 `functions/`，不要删除这个显式转发。

## Cloudflare 发布

正式域名：[rolithax.wludy.xyz](https://rolithax.wludy.xyz)。Pages 项目：`mslx-android-website`。

继续使用 Cloudflare 的 GitHub 集成：监听本仓库 `main`，执行 `npm run build`，发布 `dist/`。`wrangler.jsonc` 固定输出目录与兼容日期。`_worker.js` 启用 Pages Advanced Mode，SSR 在 Cloudflare Workers 上运行，无需额外建一个 Worker 服务或改动域名。

`public/_routes.json` 将文档与 API 交给 Worker；图片、打包资源、robots.txt 和 sitemap.xml 直接由 Pages 分发。不要改回只有 API 路由，否则文档请求不会进入 SSR。

上线后验证：

```sh
curl -sI https://rolithax.wludy.xyz/
curl -A Googlebot https://rolithax.wludy.xyz/
curl -A bingbot https://rolithax.wludy.xyz/download
```

检查 HTTP 200、`X-Rolithax-Render: vue-ssr`、正文标题和实际下载链接。浏览器关闭 JavaScript 后仍应显示内容。
