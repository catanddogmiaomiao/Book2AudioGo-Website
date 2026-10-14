# 搜索意图优化：PDF / EPUB 转有声书

日期：2026-10-14。生产仓库：catanddogmiaomiao/Book2AudioGo-Website。

## 改动

- 首页 title：Free PDF & EPUB to Audiobook Converter | Book2Audio GO。
- 首页 H1：Convert PDF and EPUB Books to MP3 Audiobooks。
- description 明确 Windows、PDF/EPUB/TXT/DOCX、MP3/WAV、主要功能免费以及按章节导出。
- 首页增加 book to audio converter 介绍、PDF/EPUB 真实页面链接和可展开 FAQ；保留视觉设计、R2 下载地址与语言切换。
- 新增 `/pdf-to-audiobook`：覆盖 PDF to audio / MP3 / audiobook；包含实际操作步骤、文本提取顺序、扫描 PDF 需要 OCR 的限制和问答。
- 新增 `/epub-to-mp3`：覆盖 EPUB to MP3 / audiobook；包含目录预览、章节导出、DRM 限制、语音选择和問答。
- 新页各有唯一 title、H1、description、自指 canonical、Open Graph / Twitter 元数据，以及首页和另一格式页面的链接。
- sitemap 从 1 页扩展为 3 页，不为近义词创建内容重复的页面。
- 免费描述采用 free core features，不宣称无限免费或浏览器在线转换。补充准确数据流：书籍解析在本地完成；生成语音时文本发送至在线语音服务。

## 文件

| 文件 | 用途 |
|---|---|
| app/layout.tsx | 首页搜索及分享元数据 |
| app/page.tsx | 首屏定位、免费核心功能与隐私说明 |
| app/_components/DiscoveryContent.tsx | 首页搜索需求介绍、落地页内链与 FAQ |
| app/_components/ConversionGuide.tsx | 两个格式页面的独特文案及共同布局 |
| app/pdf-to-audiobook/page.tsx | PDF 路由和专属元数据 |
| app/epub-to-mp3/page.tsx | EPUB 路由和专属元数据 |
| app/globals.css | 指南及 FAQ 的响应式样式 |
| public/sitemap.xml | 三个正式页面 URL |
| tests/seo.test.mjs | 构建 Worker 上的路由与 SEO 检查 |
| SEO-V2-NOTES.md | 优化及验证记录 |

## 验证

`npm test` 已通过：实际构建 Worker 返回三个页面 200；检查初始 HTML、唯一 H1、独特标题、自指 canonical、内链、FAQ、抓取文件和生产 HTTPS 重定向。

本轮浏览器工具启动失败，无法进行新的截图和视觉检查；不把构建测试视为手机视觉测试。样式沿用已有主题并增加移动断点，部署后还需复核显示。未测量 Core Web Vitals，不承诺排名或点击数量。

## 部署和 Search Console

沿用已经验证的 Cloudflare Worker `book2audiogo-website`：合并到 main 自动构建和发布，正式域名 https://book2audiogo.com/。保留现有域名和 Always Use HTTPS 设置。

部署后先检查三页及 sitemap/robots 均返回 200，确认新页 canonical 不继承首页地址。

在 Search Console 提交/检查 https://book2audiogo.com/sitemap.xml，对首页、PDF 和 EPUB 页面分别执行 Test live URL → Request indexing。已有成功 sitemap 可等待 Google 重新读取；提交后核实它发现的 URL 是否更新。

Performance 中同时检查 impressions、clicks、queries、pages 及时间范围。0 clicks 不等于没有搜索展示：有展示无点击时，需要结合查询相关性、平均排名和 CTR 分析；没有展示时先查索引状态与 Google 是否已抓取新内容。不要仅凭一次手动搜索判断整个站点不存在。

关键词来自用户截图与搜索结果的意图分析，没有付费搜索量数据，所以不把页面优先级描述成已验证的流量预测。
