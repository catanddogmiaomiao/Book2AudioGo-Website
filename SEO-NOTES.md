# Book2Audio GO SEO 修订与部署说明

检查日期：2026-10-13（北京时间）。仓库：catanddogmiaomiao/Book2AudioGo-Website，基于 main 的 a6e9598。

## 已确认的现状

- 网站是 React 19 + Vinext/Vite，由 `worker/index.ts` 接入 Cloudflare Worker；页面可在服务器端输出 HTML，不是空壳 SPA。
- 公共域名首页 HTTPS 返回 200。HTTP 首页也返回 200，没有自动跳转到 HTTPS。
- 线上 `/sitemap.xml` 返回 404。仓库没有 sitemap 或 robots 文件。
- 线上 `/robots.txt` 返回 200，只有 Cloudflare 内容信号说明，未发现阻止 Googlebot 的 Disallow 规则，也没有 sitemap 声明。
- 线上默认 HTML 正文为英文，但 title、description、html lang 为中文，且没有 canonical。已有 viewport 和一个 H1。
- 目前唯一独立内容页面是 `/`。Features / How it works / Formats 是首页锚点，四种语言是客户端切换，不是四个独立网址。
- `.openai/hosting.json` 保留历史 Sites 项目身份。该 Sites 项目目前没有自定义域名，不能据此确认它负责 book2audiogo.com 的部署。
- 仓库没有 GitHub Actions 部署流程，也没有根目录 wrangler 配置；自定义域名绑定及线上发布入口需从现有 Cloudflare 项目确认。不要把历史 Sites 项目的发布当作公共域名部署完成。
- Search Console 首页已收录、HTTPS 正常、Performance 无数据是用户提供的状态，本次没有登录 Search Console。

## 修改清单

| 文件 | 修改与目的 |
| --- | --- |
| `public/sitemap.xml` | 新增标准 UTF-8 XML，只列已存在的首页 HTTPS canonical URL，避免提交未发布页面或锚点；不虚构 lastmod。 |
| `public/robots.txt` | 允许抓取并声明完整 sitemap URL。Cloudflare 边缘仍可能附加其内容信号规则，部署后需核实最终返回内容。 |
| `app/layout.tsx` | title 改为 Book2Audio GO – Convert Ebooks to MP3 Audiobooks；description 自然覆盖 EPUB/PDF/TXT/DOCX、MP3/WAV 与 chapter splitting；设置 HTTPS canonical 和 metadataBase；默认 lang=en。 |
| `app/page.tsx` | 英文 H1 改为 Convert Ebooks to Audiobooks Easily；导语和格式正文覆盖 ebook to audiobook、EPUB to MP3、PDF to audiobook、chapter-based MP3。默认英文稳定呈现，保留 EN/JA/ZH/KO 手动切换，切换时同步 html lang。下载链接和产品功能不变。 |
| `worker/index.ts` | 公共域名 HTTP 和 www 请求永久 301 跳转至 HTTPS 裸域名，保留路径及查询参数，不影响 localhost 或 Sites 预览。www 是否有 DNS/TLS 和 Worker 路由需部署后验证。 |
| `app/globals.css` | 限制手机装饰圆形宽度，修复现有横向滚动。 |
| `.gitignore` | 排除依赖、构建缓存和本地环境文件。 |
| `tests/seo.test.mjs` | 使用构建后的 Cloudflare Worker 验证首页渲染、单个 H1、描述格式、关键词、canonical、sitemap、robots 和生产重定向。 |
| `package.json` | 将原来引用不存在测试文件的 test 命令更新为构建后运行 SEO 检查。 |
| `SEO-NOTES.md` | 记录检查证据、验证范围、部署及后续计划。 |

## 验证结果与范围

- 最终 Vinext 构建通过；构建器提示无法自动判定路由静态/动态类型，这是框架分类提示，不是构建失败。
- Miniflare 中实际构建 Worker 的首页、抓取文件、canonical 与重定向验证通过。重定向测试保留查询参数，也验证本地 HTTP 页面不跳转。
- 本地生产 HTML 的 title/description/canonical 在初始响应中可见，只有一个 H1，没有 meta noindex。canonical 渲染为 `https://book2audiogo.com`，与带末尾 `/` 的根 URL 等价。
- 浏览器验证 320、375、390、768、1280 像素视口；均无横向滚动，英文标题和下载入口显示正常。日语手动切换正常，lang 同步为 ja。
- 未测量 Lighthouse 或 Core Web Vitals；不能据此承诺 LCP、INP、CLS 分数。未发布到公共域名，线上 X-Robots-Tag、最终 Cloudflare robots 合并结果及 DNS/TLS 路由需部署后复核。

复现（Node >=22.13）：

```text
npm ci
npm test
```

Windows 可直接构建：

```text
node node_modules/vinext/dist/cli.js build
node tests/seo.test.mjs
```

## 发布到现有公共站点

1. 审查合并本次修复分支。
2. 在 Cloudflare 中找到目前承接 `book2audiogo.com` 的现有 Worker/项目，确认仓库、发布分支、Worker 名称和域名路由。不要创建替代项目或更换域名。
3. 沿用当前构建/发布流程。Vinext 输出 `dist/server/index.js`、`dist/client/` 与 `dist/server/wrangler.json`，必须同时部署 Worker 和静态 assets；新 sitemap 与 robots 会被复制到 assets。
4. 若当前发布通过 Wrangler，先核对生成配置与已有 Worker 身份和路由一致，再使用该配置部署；若 Cloudflare 的构建设置使用 `npm run build`，注意原脚本的 Unix 环境变量语法，在 Windows 上使用上述直接 Node 构建命令。
5. 开启/确认 Cloudflare 对该域名的 HTTPS 强制跳转，确保包括静态 assets 在内的 HTTP 请求统一跳转；Worker 中的跳转是服务器请求的保障，assets 优先路由可能绕过 Worker。
6. 访问首页、`/sitemap.xml`、`/robots.txt`，确认均为 HTTPS 200。XML 必须是真实 sitemap，不能被首页 fallback 替代。确认 HTTP 301 到 HTTPS、首页没有 X-Robots-Tag: noindex、最终 robots 不阻止抓取，canonical 指向正式裸域名。
7. 手机浏览并检查下载链接。必要时清除旧首页及抓取文件缓存。

## Google Search Console 操作（部署核实后）

1. 选择 `book2audiogo.com` 资源，打开左侧 **Sitemaps**。
2. 在 **Add a new sitemap** 中：若输入框已带 `https://book2audiogo.com/` 前缀，只填 `sitemap.xml`；如果是完整 URL 输入框，填 `https://book2audiogo.com/sitemap.xml`。
3. 点击 **Submit**，随后检查状态是否为 **Success**；如果 Couldn't fetch，先核实线上 200、XML 内容、边缘缓存及访问规则。
4. 在顶部 **URL Inspection** 输入 `https://book2audiogo.com/`。先点 **Test live URL** 确认修改后的页面可抓取，再点 **Request indexing** 一次，请 Google 重抓已更新首页。
5. 后续在 Performance 查看 impressions、queries、clicks；当前 0 clicks 本身不能证明抓取故障。请求抓取不保证立即收录或排名提升，不需要反复点击。

官方依据：
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl
- https://support.google.com/webmasters/answer/7451001

## 后续独立页面规划（本次不创建）

| URL | 内容重点 |
| --- | --- |
| `/epub-to-mp3` | EPUB 导入、目录检测、章节选择、MP3 导出及常见失败原因。 |
| `/pdf-to-audiobook` | PDF 文本提取、段落检查、语音与导出；如尚无 OCR，不宣称扫描 PDF 可直接识别。 |
| `/txt-to-mp3` | TXT 编码、分段、语速与输出。 |
| `/docx-to-audiobook` | DOCX 标题与正文、章节组织、试听和导出。 |
| `/ja/` | 独立日文介绍、使用步骤、格式说明和 Windows 下载入口。 |

发布这些页面前，先确认应用实际能力；每页使用独特 title/description、清晰 H1、自己的 canonical、可抓取内链及完整有用正文，避免仅换关键词的重复页面。日文页需要服务器初始 HTML 的 lang=ja、自己 canonical，以及和英文页互相对应的 hreflang。只有真实上线并返回 200 后才加入 sitemap。当前语言按钮不声明 hreflang，避免指向不存在的独立页面。
