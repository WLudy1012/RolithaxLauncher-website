# Rolithax Launcher 官网

Vue 3 官网，支持明暗主题、手机布局与 Android / Windows / Linux 下载。首页采用居中的产品介绍、功能示意、Android 实机截图、连接流程和常见问题；下载页保留来源、版本与 SHA-256。

动效包括首屏分批入场、滚动渐入、桌面鼠标倾斜、截图交叉淡入淡出、卡片悬浮与菜单反馈。使用浏览器原生动画 API，不引入动画库；尊重 `prefers-reduced-motion`，键盘焦点进入时立即取消遮挡内容的入场动画。构建时生成完整正文，关闭 JavaScript 后也能阅读。

## 本地开发

需要 Node.js 22.18+ 或 24.12+。

```sh
npm ci
npm run dev
npm run build
npm test
npm run dev:worker
```

`dev` 用于 Vue 页面开发；`dev:worker` 在构建后启动本地 Cloudflare Pages 运行时，验证静态页面、重定向及 CNB 接口。`npm run preview` 可查看构建时生成的静态 HTML，但不模拟 Pages 路由与接口。

## 渲染与搜索引擎

采用构建时预渲染（SSG）。`scripts/build.mjs` 构建浏览器资源后，在构建进程中调用 `server/render.js` 的 Vue `renderToString`，生成完整的 `index.html`、`download.html` 与兼容旧地址的 `mobile.html`。渲染器只在构建时使用，不输出到发布目录。

Googlebot、Bingbot 和普通访客读取相同的静态 HTML；不检测 User-Agent，不在请求时渲染。浏览器随后使用同一组件树完成 hydration，保留交互、动画和下载信息更新。首页和下载页响应带有 `X-Rolithax-Render: prerender`；`pages.dev` 域名通过 `_headers` 设置 `noindex`。

旧的 `/index.html`、`/mobile`、`/mobile.html` 重定向至 `/`，`/download.html` 和 `/download/` 重定向至 `/download`。提供 canonical、Open Graph、robots.txt 和 sitemap.xml。未知地址返回 404。

测试检查完整静态 HTML、canonical、浏览器资源、Functions 路由范围、旧链接、预览 noindex、404 以及 API 的 GET / HEAD / 方法限制。搜索引擎是否收录仍由搜索服务决定。

Google Search Console 的站点验证文件为 `public/google308c54d9be376f92.html`，发布后位于 `/google308c54d9be376f92.html`。该文件需要长期保留，后续改版、构建和清理时不要删除、改名或修改内容；Vite 会将其原样复制到发布目录。`_redirects` 中对应的 200 内部重写规则也需保留，确保原始 `.html` 地址直接返回验证内容，不被 Pages 跳转到无后缀地址。

## 下载数据

静态 HTML 展示仓库内已核对的公开发布快照，明确标记为「发布快照」。页面加载后同步 GitHub 与 CNB 最新版本；请求失败保留可用下载链接。Java 运行时按需下载。更新静态正文需要重新构建发布。

`/api/releases/cnb` 使用 `functions/api/releases/cnb.js`，由 Pages Functions 的文件路由提供。仅访问固定上游，限制响应体积与请求时间，支持 GET / HEAD；其他方法返回 405。

## Cloudflare 发布

正式域名：[rolithax.wludy.xyz](https://rolithax.wludy.xyz)。Pages 项目：`mslx-android-website`。

继续使用 Cloudflare 的 GitHub 集成：监听本仓库 `main`，执行 `npm run build`，发布 `dist/`。`wrangler.jsonc` 固定输出目录与兼容日期。发布目录不再包含 `_worker.js`，页面由 Pages 静态托管，只有 CNB 接口使用 Functions。

`public/_routes.json` 只包含 `/api/releases/cnb`。HTML、图片、脚本、robots.txt 和 sitemap.xml 均直接由 Pages 分发，不消耗 Workers 请求额度；CNB 接口请求仍计入 Workers / Pages Functions 额度。旧链接由 `_redirects` 处理，不调用 Function。

上线后验证：

```sh
curl -sI https://rolithax.wludy.xyz/
curl -A Googlebot https://rolithax.wludy.xyz/
curl -A bingbot https://rolithax.wludy.xyz/download
```

检查 HTTP 200、`X-Rolithax-Render: prerender`、正文标题和实际下载链接。浏览器关闭 JavaScript 后仍应显示内容；开启 JavaScript 后检查主题切换、菜单和下载信息更新。
