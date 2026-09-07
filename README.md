# 周末活着

兼容手机 H5 与桌面 Web 的工作生活指南。使用 Next.js App Router、TypeScript、Tailwind CSS、Lucide、Recharts、React Hook Form、Zod、Drizzle 与 Supabase Auth。

## UI 组件与主题

使用 shadcn/ui 官方源码组件：Button、Input、Textarea、Label、Card、Badge、Tabs 和 NativeSelect。颜色、边框、焦点状态统一由 `src/app/globals.css` 的主题变量控制，页面布局使用语义化类名。桌面端采用清晰的双栏/多列布局，H5 保留底部导航、单列卡片和触控尺寸。

`pnpm test:e2e tests/e2e/ui.spec.ts` 检查 320、390、768、1440px 布局、登录注册标签的鼠标/键盘切换和城市筛选。该用例不提交真实数据。测试地址使用与开发预览一致的 `http://localhost:3000`。

## 本地启动

```sh
pnpm install
pnpm dev
```

打开 http://localhost:3000。开发服务器监听所有网卡，同一局域网手机可通过电脑 IP 的 3000 端口访问（需系统防火墙允许）。

```sh
pnpm typecheck
pnpm test
pnpm build
pnpm start
```

在本地服务已启动时，执行 `pnpm test:e2e` 进行浏览器检查（当前配置使用本机 Microsoft Edge）。

## 两种运行方式

- 未设置 DATABASE_URL：只读演示模式，展示虚构公司和反馈，页面始终提示演示数据；提交不会伪装成功，也不保存在浏览器。
- 配置真实数据库：公司列表和反馈从 PostgreSQL 读取，所有写入经服务端身份验证、Zod 校验及审核。公开页面不返回用户 ID。

## 接入 Supabase

1. 将 `.env.example` 复制为 `.env.local`，填写数据库连接、Supabase URL、publishable key。
2. 数据库迁移工具通过当前进程的 DATABASE_URL 读取连接。执行迁移前将环境变量加载到终端，再执行 `pnpm db:migrate`。
3. 迁移完成后运行 `database/security.sql`，关闭浏览器 Data API 对业务表的访问。业务数据库仅由服务器 Drizzle 访问。
4. Supabase 启用 Email/Password 登录及邮箱验证，配置项目 Site URL。邮箱确认后回站登录。
   面向公开用户注册时，需配置 [自定义 SMTP](https://supabase.com/docs/guides/auth/auth-smtp)。默认邮件服务仅支持项目团队邮箱，并有严格发送限额。若注册失败，在服务端日志搜索 `Authentication failed`，根据 `code` 排查：`email_address_not_authorized` 表示邮件收件人限制，`over_email_send_rate_limit` 表示邮件限额，`unexpected_failure` 需结合 Supabase Auth 日志检查邮件服务或数据库错误。日志不记录邮箱和密码。
5. 将管理员 Supabase 用户 UUID 填入 `ADMIN_USER_IDS`，多个使用英文逗号分隔；重新启动服务。
6. 用户通过 `/companies/submit` 投稿，管理员在 `/admin` 通过后自动创建公司和办公城市；真实模式不会混入虚构种子。

数据库连接仅使用服务器环境变量，绝不能加 NEXT_PUBLIC 前缀。可直接部署到 Vercel，并配置同样的环境变量。当前未进行线上部署。

### Vercel 数据库连接

部署环境的 `DATABASE_URL` 应使用 Supabase 控制台 Connect 中的 **Transaction pooler** 连接串（通常为 `*.pooler.supabase.com:6543`），参见 [官方连接说明](https://supabase.com/docs/guides/database/connecting-to-postgres)。迁移工具继续使用适合迁移的直连或 Session pooler 连接串，不要盲目替换所有数据库端口。修改 Vercel 环境变量后需重新部署。

应用每个进程最多使用 1 个连接，空闲 20 秒后释放，并复用开发热更新之间的连接池。真实公司数据只在请求时查询，构建不依赖数据库可用性；未配置数据库时仍可静态生成演示页面。若出现 `MAXCONNSESSION`，检查部署是否仍使用 Session pooler，以及旧部署或本地进程是否占用了连接。单进程限额不等于所有部署实例的总连接限额。

## 已实现

首页、公司搜索与筛选、公司详情、城市/岗位/时间范围统计、下班时间分布、双休榜、结构化匿名评价、注册登录、个人收藏与评价进度、评价点赞、回复及举报提交、公司投稿和内容审核。

不足 3 条反馈隐藏数值结论。普通双休率与加权友好度分别展示。后台通过评价后自动刷新公开页。收藏、点赞具备数据库唯一约束。所有业务写入要求已认证账号，审核要求服务端管理员白名单。

## 当前实现边界

这是第一轮可运行实现。评价结构暂以 JSONB 存储，城市通过 company_locations 单独建模；公开统计在服务端对已发布反馈聚合。随着数据量增长，应按查询范围下推 SQL 聚合和分页。后台目前覆盖评价、回复、投稿、举报审核，尚未实现独立公司编辑和用户封禁管理。工作经历认证、图片上传、两层回复、账号资料修改、限流和重复评价限制尚未实现；上线前需要补齐反刷机制并对真实 Supabase 做端到端验收。当前未配置真实服务，无法验证邮件送达、真实登录和数据库写入。

## 目录

`src/app` 页面与响应式样式；`src/components` 交互与显示组件；`src/actions` 权限校验和写入；`src/db` 数据库定义及查询；`src/lib/domain.ts` 业务校验和统计规则；`tests` 统计边界测试。
