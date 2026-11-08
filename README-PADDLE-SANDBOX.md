# Book2Audio GO：Paddle 沙盒购买

官网使用 Vinext、React、Vite 和 Cloudflare Worker。沙盒购买页复用官网的样式与 Worker，只在本机开发环境开放。

直接打开此页时，仍可独立测试结账和订单入库。通过桌面测试账号发起的结账会带上账号服务创建的交易 ID，验证付款后可给该本地账号开通 PRO。

## 联调桌面账号和支付

1. 在账号服务项目运行 `npm run build` 和 `npm run licensing:local -- init --paddle-sandbox`。初始化只需执行一次，生成独立测试签名密钥和 `.local-paddle/client-config.json`。
2. 在 Paddle 沙盒创建具备 **Transactions Write** 权限的 API 密钥。把密钥与下方通知目标的签名密钥分别填进账号服务的 `.local-paddle/secrets.json` 中的 `B2A_PADDLE_SANDBOX_API_KEY` 和 `B2A_PADDLE_SANDBOX_WEBHOOK_SECRET`。将 `test_` 开头的客户端令牌填进官网的本地 `.env`。
3. 在账号服务运行 `npm run licensing:local -- test-account --paddle-sandbox`，终端会显示一次性生成的本地测试登录凭据。再运行 `npm run licensing:local -- serve --paddle-sandbox`。这两个命令使用独立的本地 D1 状态。
4. 在官网分别运行 `npm run dev` 和 `npm run webhook:account-sandbox`。用后者输出的随机路径配置 Paddle 沙盒通知目标，按下方的临时 HTTPS 隧道步骤将本地端口 `8788` 接到 Paddle。订阅 `transaction.completed`、`adjustment.created` 和 `adjustment.updated`。通知目标的签名密钥填好后重启本地账号服务。
5. 在桌面项目运行 `python run_paddle_sandbox.py "<账号服务目录>/.local-paddle/client-config.json"`。使用本地测试账号登录，打开「用户中心 → Paddle 沙盒购买」，用 Paddle 测试卡付款。服务端确认后，在桌面端刷新设备授权。

同一笔付款只发放一次权益。Paddle 确认全额退款或拒付后，设备下次联网刷新时会更新授权。账号绑定和权益数据都保存在沙盒，线上账号可继续使用原来的注册和授权流程。

## 独立结账测试

使用 Node.js 22.13 或更高版本，在官网仓库根目录运行：

```powershell
npm ci --cache .local/npm-cache
npm run dev
```

打开 http://127.0.0.1:3000/sandbox/purchase 。临时文件、Wrangler 状态和 npm 缓存保存在项目的 `.local/` 和 `.wrangler/`。

已有 `.env` 时不要覆盖它。`.env.example` 不含凭据。编辑 `.env` 后重启服务；缺少令牌时页面显示配置说明，购买按钮不可用。首次启动会在 `.env` 不存在时复制示例。

## 只在本地填写的配置

```dotenv
B2A_PADDLE_SANDBOX_ENABLED=true
PADDLE_SANDBOX_CLIENT_TOKEN=
PADDLE_SANDBOX_WEBHOOK_SECRET=
```

在 Paddle **沙盒后台** https://sandbox-vendors.paddle.com/ 中，进入 My account → Settings → Authentication → Client-side tokens，创建沙盒客户端令牌，并在本机填入 `PADDLE_SANDBOX_CLIENT_TOKEN`。令牌必须以 `test_` 开头；`live_` 会被拒绝。无需 API 密钥，不要把任何凭据粘贴到聊天。

客户端令牌按官方设计会传给 Paddle.js。Webhook 秘密仅由 Worker 的运行时环境读取，不进入前端配置响应。不要添加 `VITE_` 或 `NEXT_PUBLIC_` 前缀，也不要把秘密写入代码、日志或版本库。`.env*`（示例除外）、`.dev.vars*`、运行时数据及构建产物均已忽略。

`PADDLE_SANDBOX_WEBHOOK_SECRET` 应使用沙盒 notification destination 的 endpoint secret。没有实际通知投递目标时可先留空，仅测试前端。没有创建 API 密钥、扩大权限、接受条款或提交审核。

## 产品与金额

- 商品：Book2Audio GO Pro — Perpetual License。
- 商品 ID：`pro_01m6fk4av9fqjyx1nkdxd6zapw`。
- 价格 ID：`pri_01m6fk9sjr68pdczk37kzwtd86`，数量为 1。
- 一次性购买，购买版本可永久使用；没有自动续费或订阅试用。
- 复用沙盒里已存在的全部地区价，没有创建、修改或删除商品和价格。

使用官方 `@paddle/paddle-js`，固定 sandbox 环境。`PricePreview()` 不传国家或自定义汇率，让 Paddle 自行识别所在地并应用已有地区价，显示其 `formattedTotals.total`。预览失败时仍允许进入结账查看价格。最终币种、税费和总额以结账中的账单地址及 Paddle 明细为准；没有硬编码最终含税金额。

页面明确显示“测试环境，不会真实扣款”。结账完成、关闭、支付失败和加载错误有独立反馈；关闭成功画面不会覆盖完成状态。关闭结账只是前端动作，不能证明服务器确认了取消。前端 `checkout.completed` 事件不用于发放授权。

## 服务端付款确认

沿用现有 Worker，新增：

- `GET /api/paddle/sandbox/config`：只返回沙盒客户端令牌和配置状态。
- `POST /api/paddle/sandbox/webhook`：读取未经 JSON 中间件改写的原始请求体，通过官方 Node SDK 校验 `Paddle-Signature`，并检查时间戳。
- `PaddleTestOrders`：复用现有 Durable Object + SQLite 的存储方式，建立独立的 `paddle_test_orders` 表；本地状态持久化到 `.wrangler/`。

仅接收 `transaction.completed` 入账，核对交易为 `completed`、商品与价格 ID、数量为 1、无订阅和试用，并保存事件 ID、交易 ID、时间、币种及 Paddle 金额。事件 ID 与交易 ID 均有唯一约束，事务内幂等插入；并发和重新投递不能创建重复订单。存储成功后才返回成功，存储失败返回 503，供 Paddle 重试。无效签名返回 401，交易与商品不匹配返回 422。

测试入口和接口需要显式开启开关，并只接受 localhost/127.0.0.1。正式域名返回 404；本轮没有部署或创建公网地址。测试订单没有公开查询接口，不存买家邮箱，也不调用账号发码、兑换或授权更新逻辑。

**2026-11-04 实测状态**：已通过临时专用网关接收一条真正的 Paddle transaction.completed，官方 SDK 验签与交易校验通过，HTTP 200 并记录 1 条 USD 39.99 测试订单。停止服务后订单仍保存在 SQLite 中。临时公网通道已在测试结束后关闭；后续联调需要重新启动并更新通知 URL。服务端已配置提示本身仍只表示配置存在。

完整的端到端联调需要让 Paddle 沙盒通知能通过 HTTPS 到达专用网关。购买页面仍留在本机，转发细节见下文。

## 自动检查

```powershell
npm test
```

该命令仅做本地构建、TypeScript 检查及官网 SEO、反馈功能、Paddle 集成检查，不部署、不调用 Paddle 支付 API。已构建时可单独运行 `npm run test:paddle`。

Paddle 检查使用明确标为合成数据的本地测试 secret，覆盖：页面可达、正式域名不可达、开关关闭、缺少令牌、配置不泄露 secret、无效/过期/未来签名、原始请求体篡改、错误商品/价格/状态/数量/订阅、忽略其他事件、并发重复通知、同交易新事件 ID、重启后仍然幂等，以及不自动激活。合成事件不是 Paddle 平台交易，不能作为真实结账已验证的证据。

## 按官方文档执行人工沙盒测试

1. 本地填入 `test_` 令牌，启动并确认横幅“测试环境，不会真实扣款”和 Paddle 测试环境标记。
2. 点击“测试购买 Pro”，用你拥有的测试邮箱填写账单信息。使用官方成功测试卡 `4242 4242 4242 4242`，任意姓名、未来有效期与测试 CVV（如 `100`）。只用测试卡。
3. 完成后检查页面显示“前端收到测试结账完成事件”，并在 Paddle 沙盒 Transactions 中确认交易为 completed、对应正确商品和一次性价格。页面不得显示账号已激活。
4. 再开一笔结账直接关闭，确认显示已关闭且没有完成事件；不要把它理解为后端已确认取消。
5. 用官方拒付卡 `4000 0000 0000 0002` 测试失败提示。可在同一结账窗口改用成功测试卡重试，关闭失败窗口后也应能重新打开。
6. 如需 3DS，使用官方测试卡 `4000 0038 0000 0446`，在 Paddle 提供的测试验证流程中操作。
7. 分别用合法测试账单信息检查中国、英国、爱尔兰、澳大利亚和日本，核对 Paddle 应用已设的地区价；最终含税金额按结账明细判断，不以本地硬编码数字作为验收。
8. 在 Paddle **沙盒**配置用于联调的通知目标，仅订阅 `transaction.completed`，将该目标的 endpoint secret 在本地填好。再完成一笔测试支付，确认接口返回 `received:true, duplicate:false`，本地表新增一条且响应里的 `activation` 为 `not_implemented`。
9. 在沙盒通知记录重发同一通知，确认 `duplicate:true` 且没有第二条订单。Paddle 重发会产生当前有效签名，不要直接重用过期签名。
10. 无效签名、重复通知与并发行为可先通过 `npm run test:paddle` 在本地隔离数据库验证。关闭并重启开发服务后，真实本地测试订单应仍保留；不要删除 `.wrangler/`。

2026-11-04 的独立结账测试已验证客户端令牌加载、USD 价格预览、前端成功/关闭/拒付与真实 Webhook 验签入库。本机用同一事件 ID 和交易 ID 构造的合成通知返回 duplicate=true，订单数仍为 1。账号联调流程需要单独跑一笔真实的沙盒付款。

## 官方资料（2026-11-03 查阅）

- Paddle.js 安装与初始化：https://developer.paddle.com/paddle-js/about/include-paddlejs/
- 客户端令牌：https://developer.paddle.com/paddle-js/about/client-side-tokens/
- 地区价格预览：https://developer.paddle.com/paddle-js/methods/paddle-pricepreview/
- 签名校验：https://developer.paddle.com/webhooks/about/signature-verification/
- 官方测试卡：https://developer.paddle.com/concepts/payment-methods/card/

## 结账弹出 Something went wrong 时

价格预览成功不等于账号已具备创建结账所需的全部配置。先关闭 Paddle 错误弹窗，查看购买页新增的 Paddle 错误代码。页面只展示短错误代码和本地提示，不记录原始事件、买家资料或令牌。

若为 `transaction_default_checkout_url_not_set`，在**沙盒**后台 Checkout → Checkout configuration → Default payment link 保存默认支付链接。官方错误参考明确允许沙盒使用 localhost，可填写当前本地页 `http://127.0.0.1:3000/sandbox/purchase`（需保持本机服务运行）；若后台界面另有 URL 校验限制，以实际界面为准，不要提交正式网站审核。此设置不会部署网页。保存后关闭旧弹窗，刷新本地页并重新测试。

若为 `transaction_checkout_not_enabled`，请检查沙盒账号的结账启用状态。需要接受条款、提交审核或扩大权限的步骤由账号所有者亲自操作，本项目不会代为执行。

错误参考：https://developer.paddle.com/errors/transactions/transaction_default_checkout_url_not_set/
事件字段：https://developer.paddle.com/paddle-js/events/checkout-error/

## 真实 Webhook 联调前的本地转发入口

已准备本地专用网关：`npm run webhook:gateway`。只监听 127.0.0.1:8788；每次生成一个随机通知路径，保存在忽略的 `.local/webhook-gateway-session.json`。仅此路径上的 POST 且带 Paddle-Signature 才会被转发至原本地 Worker 验签接口；其余路径和方法均返回 404。原始请求体保持字节一致，Cookie 和 Authorization 不转发，也不输出原始通知、客户信息或秘密。

`npm run test:webhook-gateway` 使用本机合成请求验证该边界，不会创建公网地址。此网关不读取任何 `.env` 凭据。

如使用 Cloudflare Quick Tunnel 联调，请只转发该网关端口。临时 URL 仅用于 Paddle 沙盒通知，结束后关闭隧道和网关，并停用沙盒通知目标。Webhook 签名秘密始终留在本地 Worker。Quick Tunnel 停止后链接失效：https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/

## 本轮联调已结束

2026-11-04 的真实通知已验签入库，本机重复处理检查通过，停止服务后仍保存 1 条测试订单。临时隧道和网关已停止。
