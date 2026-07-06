# X-Pocket 目标驱动开发工作流（BDD）

> 本文件将 X-Pocket 完整开发链路拆解为一组有序的 `/goal` 目标。
> 智能体使用 `/goal <目标ID>` 命令逐个完成目标，每个目标遵循 **RED → GREEN → REFACTOR → VERIFY** 的 TDD 闭环。

---

## 目标依赖链

```
Phase 1 (MVP) ✅
G1.1 ──► G1.2 ──► G1.3 ──► G1.4
                  │
                  ▼
           G1.5 ──► G1.6 ──► G1.7

Phase 2 (增强) ✅
G2.1 ──┬──► G2.2
       ├──► G2.3
       └──► G2.4 ──► G2.5

Phase 3 (完善) ✅
G3.1 ──► G3.2 ──► G3.3 ──► G3.4

Extras ✅
❤️ 点赞收藏 + 取消收藏移除 + 滚动分页 + Obsidian 导出
```

> **状态**: 全部 14 个目标已完成 + 4 个额外特性。112 个测试全部通过。

---

## `/goal` 命令使用说明

```
/goal G1.2    # 开始执行目标 G1.2（类型定义 + 解析器）
/goal status  # 查看当前目标进度
/goal next    # 自动定位到下一个未完成的目标
/goal verify  # 仅运行当前目标的验收检查
```

每个目标执行流程：

```
接收 /goal <ID>
      │
      ▼
  读取本文件 → 定位目标 → 读取依赖设计文档
      │
      ▼
  Step 1: RED   — 编写测试 → 确认失败
  Step 2: GREEN — 最小实现 → 确认通过
  Step 3: REFACTOR — 安全重构 → 确认通过
  Step 4: 收紧   — 补充边界/异常测试 → RED → GREEN → REFACTOR
  Step 5: VERIFY — 运行验收清单 → 全部通过 → 标记完成
```

---

---

# Phase 1 — MVP（核心闭环）

---

## G1.1 — 项目脚手架搭建

> **Given** 项目目录下仅有 `.trae/documents/` 设计文档和 `template.html`
> **When** 智能体执行 `/goal G1.1`
> **Then** 项目具备可构建、可加载到 Chrome 的空扩展骨架

### 前置依赖

无（起点）

### BDD 场景

```gherkin
Feature: 项目脚手架
  作为 开发者
  我想要 一个可运行的空 Chrome 扩展骨架
  以便 后续功能可以在其上构建

  Scenario: 项目可构建
    Given 智能体已配置好 package.json / tsconfig / vite.config / manifest.config
    When 智能体运行 pnpm dev
    Then Vite 构建成功，dist/ 目录生成
    And dist/ 包含 manifest.json 和 service-worker.js

  Scenario: 扩展可加载到 Chrome
    Given dist/ 目录已生成
    When 开发者在 chrome://extensions 中加载 dist/ 为"未打包的扩展"
    Then 扩展图标出现在 Chrome 工具栏
    And chrome://extensions 中无错误提示

  Scenario: TypeScript 类型检查通过
    Given 项目已配置 TypeScript strict 模式
    When 智能体运行 pnpm vue-tsc --noEmit
    Then 无类型错误输出（允许空文件无导出警告）
```

### 开发任务

| # | 任务 | 产出 |
|---|------|------|
| 1 | `pnpm init` + 安装依赖 | `package.json` 含 vue/pinia/vue-router/dompurify/@vueuse/core + devDependencies |
| 2 | 创建 `tsconfig.json` + `tsconfig.node.json` | strict: true, paths 别名 `@/*` → `src/*` |
| 3 | 创建 `vite.config.ts` | 引入 `@crxjs/vite-plugin` + `@vitejs/plugin-vue` |
| 4 | 创建 `manifest.config.ts` | 定义 `defineManifest`，含 MV3 基本字段 |
| 5 | 创建目录结构 | `src/background/` `src/content/` `src/popup/` `src/display/` `src/shared/` `public/icons/` |
| 6 | 创建最小入口文件 | `popup/index.html`、`display/index.html`、`background/index.ts`（空 SW）、`content/index.ts`（空导出） |
| 7 | 生成扩展图标 | `public/icons/icon-16.png` `icon-48.png` `icon-128.png`（可用纯色占位） |
| 8 | 验证构建 | `pnpm dev` → 无报错 |

### 测试方法

- 本目标无单元测试（纯配置文件）
- 手动验证：`pnpm dev` 构建成功 + Chrome 加载无报错

### 验收清单

- [ ] `pnpm dev` 构建成功
- [ ] `pnpm build`（含 `vue-tsc --noEmit`）构建成功
- [ ] Chrome `chrome://extensions` 开发者模式加载 `dist/` 目录成功
- [ ] 扩展图标出现在工具栏
- [ ] `pnpm vue-tsc --noEmit` 无错误（允许空文件无导出警告）

### 完成信号

Chrome 工具栏出现 X-Pocket 扩展图标，点击弹出空白弹窗（或默认占位文字）。

---

## G1.2 — 类型定义 + blockquote 解析器

> **Given** G1.1 完成，项目可构建
> **When** 智能体执行 `/goal G1.2`
> **Then** 类型定义完整，`parseBlockquote(template.html)` 返回正确的结构化数据

### 前置依赖

`G1.1` — 项目脚手架

### 必读文档

`.trae/documents/04-detailed-design.md` §1, §2

### BDD 场景

```gherkin
Feature: blockquote 解析
  作为 用户
  我想要 将粘贴的 X.com 推文嵌入 HTML 解析为结构化数据
  以便 系统可以存储和展示推文

  Scenario: 解析标准中文推文嵌入码（Happy Path）
    Given 用户从 X.com 复制了一段中文推文的 blockquote HTML
    When 系统调用 parseBlockquote(html)
    Then 返回 ParsedTweet 对象
    And tweetId = "2073779604264047025"
    And tweetUrl = "https://x.com/iamai_omni/status/2073779604264047025"
    And author = "✧ 𝕀𝔸𝕄𝔸𝕀 ✧"
    And handle = "iamai_omni"
    And lang = "zh"
    And contentText 包含 "cornex楚能"
    And mediaUrls 包含 pic.twitter.com 短链
    And blockquoteHtml 不含 <script> 标签

  Scenario: 解析英文推文嵌入码
    Given 用户粘贴了一段英文推文的 blockquote HTML
    When 系统调用 parseBlockquote(html)
    Then lang = "en"
    And postedAt 为有效 ISO 8601 日期

  Scenario: 输入非 blockquote 内容时返回 null
    Given 用户粘贴了普通文本 "<div>hello</div>"
    When 系统调用 parseBlockquote(html)
    Then 返回 null
    And 不抛出异常

  Scenario: 输入空字符串时返回 null
    Given 用户未粘贴任何内容
    When 系统调用 parseBlockquote("")
    Then 返回 null

  Scenario: XSS 攻击载荷被消毒
    Given 用户粘贴了含 <img src=x onerror=alert(1)> 的 blockquote
    When 系统调用 parseBlockquote(html)
    Then contentHtml 不含 onerror 属性
    And contentHtml 不含 <script> 标签

  Scenario: URL 归一化（twitter.com → x.com）
    Given blockquote 中的推文链接域名为 twitter.com
    When 系统调用 normalizeTweetUrl(url)
    Then 返回的 URL 域名为 x.com
    And 不含 query 参数

  Scenario: 日期解析（英文格式 "July 5, 2026"）
    Given 推文日期文本为 "July 5, 2026"
    When 系统调用 parseTweetDate(text)
    Then 返回 ISO 8601 格式的日期字符串
```

### 开发任务

| # | 任务 | 产出 |
|---|------|------|
| 1 | 编写单元测试（RED） | `src/__tests__/shared/parser/blockquoteParser.test.ts`、`urlParser.test.ts`、`dateParser.test.ts` |
| 2 | 定义所有类型 | `src/shared/types/tweet.ts`、`tag.ts`、`settings.ts`、`storage.ts`、`messages.ts` |
| 3 | 实现 `urlParser.ts` | `normalizeTweetUrl()` |
| 4 | 实现 `dateParser.ts` | `parseTweetDate()` |
| 5 | 实现 `blockquoteParser.ts` | `parseBlockquote()`，含 DOMParser + DOMPurify |
| 6 | 实现工具函数 | `src/shared/utils/id.ts` (`generateId`)、`sanitize.ts`、`date.ts` |
| 7 | 运行测试 → GREEN | 所有测试通过 |
| 8 | 补充边界测试 → RED → GREEN | 含图片/视频链接的 blockquote、缺少作者信息、缺少推文链接 |
| 9 | REFACTOR | 类型守卫消除 `any`/`as`，提取魔法字符串 |

### 测试方法

```bash
pnpm vitest run src/__tests__/shared/parser/
```

### 验收清单

- [ ] `parseBlockquote(template.html)` 返回正确的 `ParsedTweet`
- [ ] 非法输入返回 `null`，不抛异常
- [ ] XSS 攻击载荷被 DOMPurify 消毒
- [ ] URL 归一化正确（twitter.com → x.com，去 query）
- [ ] 日期解析支持英文格式 `"July 5, 2026"` 和中文格式 `"2026年7月5日"`
- [ ] `vue-tsc --noEmit` 无类型错误
- [ ] 所有单元测试通过，覆盖率 ≥ 90%

### 完成信号

```bash
pnpm vitest run  # 全部通过
pnpm vue-tsc --noEmit  # 无错误
```

---

## G1.3 — 存储层 CRUD

> **Given** G1.2 完成，类型定义就绪
> **When** 智能体执行 `/goal G1.3`
> **Then** 推文数据可增/删/改/查，与 chrome.storage.local 正确交互

### 前置依赖

`G1.2` — 类型定义 + 解析器

### 必读文档

`.trae/documents/04-detailed-design.md` §3, `.trae/documents/02-system-architecture.md` §5

### BDD 场景

```gherkin
Feature: 推文存储 CRUD
  作为 用户
  我想要 将解析后的推文持久化到本地存储
  以便 关闭扩展后数据不丢失

  Scenario: 首次使用无数据
    Given 用户首次安装扩展
    When 系统调用 getAllTweets()
    Then 返回空数组 []

  Scenario: 收藏一条推文
    Given 系统中尚无推文
    When 系统调用 addTweet(tweet)
    Then 返回 { success: true }
    And getAllTweets() 返回包含该推文的数组

  Scenario: 重复收藏同一推文被拒绝（按 tweetId 去重）
    Given 系统中已有 tweetId="2073779604264047025" 的推文
    When 系统再次调用 addTweet(同 tweetId 的新对象)
    Then 返回 { success: false, duplicate: true }
    And getAllTweets() 仍只有 1 条

  Scenario: 删除推文
    Given 系统中有 1 条推文
    When 系统调用 deleteTweet(id)
    Then getAllTweets() 返回空数组

  Scenario: 更新推文字段
    Given 系统中有一条推文
    When 系统调用 updateTweet(id, { tags: ['tag-1'] })
    Then 该推文的 tags 变为 ['tag-1']
    And 其他字段不变

  Scenario: 读取设置（首次使用返回默认值）
    Given 用户首次安装
    When 系统调用 getSettings()
    Then 返回 DEFAULT_SETTINGS（renderMode='local', theme='system', ...）

  Scenario: 更新设置并持久化
    Given 用户修改了主题设置
    When 系统调用 updateSettings({ theme: 'dark' })
    Then 返回的 Settings 中 theme = 'dark'
    And 再次调用 getSettings() 仍返回 theme = 'dark'

  Scenario: 存储配额接近上限时警告
    Given chrome.storage.local 已使用 > 8MB
    When 系统调用 addTweet(tweet)
    Then 返回 { success: false, error: 'STORAGE_QUOTA_WARNING' }
```

### 开发任务

| # | 任务 | 产出 |
|---|------|------|
| 1 | mock `chrome.storage` API | `src/__tests__/__mocks__/chrome-storage.ts` |
| 2 | 定义 storage keys + 默认值 | `src/shared/storage/keys.ts` |
| 3 | 编写 tweetStore 测试（RED） | `src/__tests__/shared/storage/tweetStore.test.ts` |
| 4 | 实现 tweetStore CRUD | `src/shared/storage/tweetStore.ts`（addTweet/getAllTweets/deleteTweet/updateTweet） |
| 5 | 编写 settingsStore 测试（RED） | `src/__tests__/shared/storage/settingsStore.test.ts` |
| 6 | 实现 settingsStore | `src/shared/storage/settingsStore.ts`（getSettings/updateSettings） |
| 7 | 实现 inbox 队列 | `src/shared/storage/inbox.ts`（pushInbox/popInbox） |
| 8 | 补充边界测试（RED→GREEN） | 去重、配额检查、meta 同步更新 |
| 9 | 实现数据迁移框架 | `src/shared/storage/migrate.ts`（版本号检查 + 迁移函数注册） |

### 测试方法

```bash
pnpm vitest run src/__tests__/shared/storage/
```

### 验收清单

- [ ] `addTweet` 入库后 `getAllTweets` 可读取
- [ ] 相同 `tweetId` 去重生效
- [ ] `deleteTweet` 后数据消失
- [ ] `updateTweet` 部分更新正确
- [ ] `getSettings` 首次返回默认值
- [ ] `updateSettings` 持久化生效
- [ ] `xpc:meta.count` 与 `xpc:tweets` 条数同步
- [ ] 空状态不报错
- [ ] 所有集成测试通过

### 完成信号

```bash
pnpm vitest run src/__tests__/shared/storage/  # 全部通过
```

---

## G1.4 — JSON 导出

> **Given** G1.3 完成，可读取已存储推文
> **When** 智能体执行 `/goal G1.4`
> **Then** 用户可将全部推文导出为结构化 JSON 文件并触发浏览器下载

### 前置依赖

`G1.3` — 存储层 CRUD

### 必读文档

`.trae/documents/04-detailed-design.md` §4

### BDD 场景

```gherkin
Feature: JSON 导出
  作为 用户
  我想要 将已收藏推文导出为 JSON 文件
  以便 备份数据或在其他工具中使用

  Scenario: 导出多条推文为 JSON
    Given 系统中有 2 条推文
    When 系统调用 exportTweets({ format: 'json', tweets })
    Then 返回一个 Blob，MIME type 为 application/json
    And Blob 内容解析为 JSON 后含 schema="x-pocket"
    And 含 version=1
    And 含 exportedAt（ISO 8601）
    And 含 count=2
    And 含 tweets 数组，长度=2

  Scenario: 导出空集合
    Given 系统中无推文
    When 系统调用 exportTweets({ format: 'json', tweets: [] })
    Then 返回 Blob，count=0，tweets=[]

  Scenario: 触发浏览器下载
    Given 已生成 Blob
    When 系统调用 downloadBlob(blob, 'x-pocket-export.json')
    Then 浏览器触发文件下载
    And 文件名为 'x-pocket-export.json'
```

### 开发任务

| # | 任务 | 产出 |
|---|------|------|
| 1 | 编写 JSON 导出测试（RED） | `src/__tests__/shared/exporter/json.test.ts` |
| 2 | 实现 JSON 导出 | `src/shared/exporter/json.ts` |
| 3 | 实现导出统一入口 | `src/shared/exporter/index.ts`（switch format） |
| 4 | 实现下载工具 | `src/shared/utils/download.ts`（Blob + `<a download>`） |
| 5 | 编写下载工具测试 | `src/__tests__/shared/utils/download.test.ts` |
| 6 | REFACTOR | 确保 `CollectedTweet` 中 `notes` 等可选字段正确序列化 |

### 测试方法

```bash
pnpm vitest run src/__tests__/shared/exporter/
pnpm vitest run src/__tests__/shared/utils/
```

### 验收清单

- [ ] `exportJson(tweets)` 返回有效 Blob
- [ ] JSON 结构含 `schema/version/exportedAt/count/tweets`
- [ ] `downloadBlob` 触发浏览器下载（可用 jsdom 验证 DOM 操作）
- [ ] 空数组导出不报错

### 完成信号

```bash
pnpm vitest run  # 全部通过
```

---

## G1.5 — Popup 弹窗（粘贴采集 + 最近列表）

> **Given** G1.2 + G1.3 完成，解析器 + 存储就绪
> **When** 智能体执行 `/goal G1.5`
> **Then** 用户可通过弹窗粘贴 blockquote HTML → 预览 → 确认收藏

### 前置依赖

`G1.2` — 解析器, `G1.3` — 存储层

### 必读文档

`.trae/documents/08-ui-ux-spec.md` §5, `.trae/documents/02-system-architecture.md` §6.1

### BDD 场景

```gherkin
Feature: Popup 弹窗粘贴采集
  作为 用户
  我想要 在弹窗中粘贴推文嵌入代码并收藏
  以便 快速保存感兴趣的推文

  Scenario: 弹出窗口正常显示
    Given 扩展已加载
    When 用户点击工具栏扩展图标
    Then 弹窗出现
    And 宽度为 360px
    And 显示 PasteCollector 文本框
    And 显示 "打开展示页" 按钮

  Scenario: 粘贴有效 blockquote 并预览
    Given 弹窗已打开
    When 用户将 template.html 内容粘贴到文本框
    Then 文本框下方出现解析预览卡片
    And 预览卡片显示作者 "✧ 𝕀𝔸𝕄𝔸𝕀 ✧"
    And 预览卡片显示 handle "@iamai_omni"
    And 预览卡片显示正文（截断 2 行）
    And 预览卡片显示日期
    And 出现 "收藏" 按钮

  Scenario: 粘贴无效内容
    Given 弹窗已打开
    When 用户粘贴非 blockquote 文本 "<div>hello</div>"
    Then 显示红色错误提示 "无法解析，请检查是否为 twitter-tweet 格式"

  Scenario: 确认收藏
    Given 预览卡片显示中
    When 用户点击 "收藏" 按钮
    Then 预览消失
    And 文本框清空
    And 显示绿色 "✓ 已收藏"（1 秒后消失）
    And 最近列表顶部出现该推文摘要

  Scenario: 重复收藏提示
    Given 某推文已收藏
    When 用户再次粘贴同一推文并点击收藏
    Then 显示提示 "该推文已收藏过"

  Scenario: 最近列表显示最近 5 条
    Given 用户已收藏 7 条推文
    When 弹窗打开
    Then 最近列表显示最近 5 条
    And 每条显示 author + contentText（截断）

  Scenario: 打开展示页
    Given 弹窗已打开
    When 用户点击 "打开展示页" 按钮
    Then 打开新标签页，URL 为 display 页
```

### 开发任务

| # | 任务 | 产出 |
|---|------|------|
| 1 | popup 基础结构 + App.vue | `src/popup/index.html`、`main.ts`、`App.vue` |
| 2 | PasteCollector 组件 | `src/popup/components/PasteCollector.vue`（textarea + 自动解析 + 预览 + 收藏按钮） |
| 3 | RecentList 组件 | `src/popup/components/RecentList.vue`（最近 5 条摘要） |
| 4 | OpenDisplay 组件 | `src/popup/components/OpenDisplay.vue`（chrome.tabs.create 打开展示页） |
| 5 | popup Pinia store | 管理粘贴/解析/入库状态（或复用 display stores） |
| 6 | popup 样式 | CSS 变量 + 360px 布局 |
| 7 | 组件测试（渲染 + 交互） | `src/__tests__/popup/` |
| 8 | REFACTOR + 边界 | 空状态、加载状态、错误状态 |

### 测试方法

```bash
# 单元测试（组件渲染）
pnpm vitest run src/__tests__/popup/

# 手动验证
pnpm dev → Chrome 加载扩展 → 点击图标 → 粘贴 template.html
```

### 验收清单

- [ ] 弹窗 360px 宽，正常打开
- [ ] 粘贴 `template.html` → 显示解析预览
- [ ] 粘贴非法内容 → 显示红色错误提示
- [ ] 点击 "收藏" → 入库成功 → 最近列表更新
- [ ] 重复收藏 → 显示 "已收藏过"
- [ ] 点击 "打开展示页" → 新标签页打开（display 页当前可为空白占位）
- [ ] 弹窗关闭后再打开，最近列表仍然显示（数据持久化）
- [ ] 无 console 错误

### 完成信号

粘贴 `template.html` → 预览 → 收藏 → 最近列表出现该推文，全程无报错。

---

## G1.6 — Display 展示页（列表 + 搜索 + 删除）

> **Given** G1.3 + G1.4 + G1.5 完成
> **When** 智能体执行 `/goal G1.6`
> **Then** 展示页可浏览所有推文卡片、搜索过滤、删除单条、导出 JSON

### 前置依赖

`G1.3` — 存储层, `G1.4` — JSON 导出, `G1.5` — Popup

### 必读文档

`.trae/documents/08-ui-ux-spec.md` §6, `.trae/documents/04-detailed-design.md` §5-6

### BDD 场景

```gherkin
Feature: 展示页浏览与管理
  作为 用户
  我想要 在展示页中浏览、搜索、删除已收藏推文
  以便 管理我的推文收藏

  Scenario: 展示页空状态
    Given 系统中无推文
    When 用户打开展示页
    Then 显示空状态图标 + "还没有收藏推文"
    And 显示引导文字

  Scenario: 推文列表宫格展示
    Given 系统中有 3 条推文
    When 用户打开展示页
    Then 以 CSS Grid 宫格布局显示 3 张卡片
    And 每张卡片显示封面图区、正文缩略（2 行）、handle、日期
    And 无封面图的推文显示占位色块

  Scenario: 卡片点击打开详情弹窗
    Given 展示页显示推文卡片
    When 用户点击某张卡片
    Then 全屏遮罩层出现
    And 居中显示详情卡片（TweetDetail）
    And 详情显示完整正文、作者、handle、发布日期、原文链接
    And 详情底部有 "原文链接" 和 "删除" 操作按钮

  Scenario: 关闭详情弹窗
    Given 详情弹窗打开中
    When 用户点击遮罩层 / 点击 ✕ 按钮 / 按 Escape 键
    Then 弹窗关闭，回到宫格列表

  Scenario: 搜索过滤
    Given 系统中有 author 含 "𝕀𝔸𝕄𝔸𝕀" 的推文
    When 用户在搜索框输入 "𝕀𝔸𝕄𝔸𝕀"
    Then 列表仅显示匹配的推文
    And 搜索有 200ms debounce

  Scenario: 搜索无结果
    Given 系统中无匹配推文
    When 用户搜索 "不存在的词"
    Then 列表为空
    And 显示 "无匹配结果"

  Scenario: 清空搜索恢复列表
    Given 搜索框有内容，列表已过滤
    When 用户清空搜索框
    Then 列表恢复显示全部推文

  Scenario: 删除推文（确认后）
    Given 展示页显示某推文详情弹窗
    When 用户点击 "删除" → 确认弹窗出现 → 点击 "确认"
    Then 推文从列表移除
    And 详情弹窗关闭
    And 刷新页面后该推文仍不存在

  Scenario: 取消删除
    Given 删除确认弹窗打开中
    When 用户点击 "取消"
    Then 推文不被删除
    And 返回详情弹窗

  Scenario: 从展示页导出 JSON
    Given 展示页有推文
    When 用户点击 "导出 JSON"
    Then 触发浏览器下载 .json 文件
```

### 开发任务

| # | 任务 | 产出 |
|---|------|------|
| 1 | display 基础结构 | `src/display/index.html`、`main.ts`、`App.vue` |
| 2 | tweets Pinia store | `src/display/stores/tweets.ts`（load/add/remove/search/filteredTweets） |
| 3 | TweetCardLocal 组件 | `src/display/components/TweetCardLocal.vue`（作者/handle/正文/日期/封面图） |
| 4 | TweetGrid 宫格容器 | `src/display/components/TweetGrid.vue`（CSS Grid auto-fill, 最小列宽 260px） |
| 5 | TweetGridCard 卡片 | `src/display/components/TweetGridCard.vue`（封面图 + 2 行正文缩略 + 底部信息行） |
| 6 | TweetDetail 详情弹窗 | `src/display/components/TweetDetail.vue`（遮罩 + 完整信息 + 操作按钮） |
| 7 | SearchBar 搜索栏 | `src/display/components/SearchBar.vue`（debounce 200ms, 搜索 author/handle/contentText） |
| 8 | 确认删除弹窗 | `src/display/components/ConfirmDialog.vue` |
| 9 | JSON 导出按钮 | 集成 G1.4 的 exporter |
| 10 | display 全局样式 | CSS 变量 + 响应式宫格 + 空状态 |
| 11 | 组件测试 | `src/__tests__/display/` |
| 12 | REFACTOR + 边界 | 无封面图卡片、长文本截断、loading 状态 |

### 测试方法

```bash
# 单元测试
pnpm vitest run src/__tests__/display/

# 手动 E2E 验证
# 1. pnpm dev → Chrome 加载
# 2. Popup 粘贴 template.html → 收藏
# 3. 打开展示页
```

### 验收清单

- [ ] 空状态显示引导文字
- [ ] 宫格正确渲染推文卡片（封面图/正文/handle/日期）
- [ ] 点击卡片 → 详情弹窗（完整信息 + 操作按钮）
- [ ] 遮罩/✕/Escape 关闭弹窗
- [ ] 搜索过滤实时生效（输入 → debounce → 过滤）
- [ ] 搜索无结果 → 显示 "无匹配结果"
- [ ] 清空搜索 → 恢复全部
- [ ] 删除确认 → 推文移除
- [ ] 取消删除 → 推文保留
- [ ] 导出 JSON → 下载文件
- [ ] 刷新页面后数据保持
- [ ] 无 console 错误

### 完成信号

Popup 粘贴入库 → 展示页看到卡片 → 搜索过滤 → 点击卡片看详情 → 导出 JSON → 删除 → 列表为空。

---

## G1.7 — Phase 1 端到端验证

> **Given** G1.1 ~ G1.6 全部完成
> **When** 智能体执行 `/goal G1.7`
> **Then** 核心闭环全流程通过，MVP 可交付

### 前置依赖

`G1.1` ~ `G1.6` 全部完成

### 必读文档

`.trae/documents/05-test-plan.md` §4.1

### BDD 场景

```gherkin
Feature: Phase 1 端到端核心闭环
  作为 用户
  我想要 完整走通 "粘贴→存储→展示→搜索→导出→删除→卸载清除" 全流程
  以便 确认 MVP 功能可用

  Scenario: 完整核心闭环
    Given 扩展已加载到 Chrome
    When 用户依次执行以下操作：
      1. 粘贴 template.html 到弹窗 → 点"收藏"
      2. 点"打开展示页" → 看到推文卡片
      3. 搜索 "cornex" → 过滤出该推文
      4. 搜索 "不存在的词" → 空列表
      5. 清空搜索 → 恢复
      6. 点击卡片打开详情
      7. 点"导出 JSON" → 下载文件内容正确
      8. 点"删除" → 确认 → 列表为空
      9. 刷新展示页 → 仍为空
     10. 卸载扩展 → 重新加载 → 数据清除
    Then 所有步骤按预期执行
    And 全程无 console 错误
    And 无 UI 异常（闪烁/错位/溢出）
```

### 开发任务

| # | 任务 | 产出 |
|---|------|------|
| 1 | 运行全部单元测试 | `pnpm vitest run` 确认全绿 |
| 2 | 类型检查 | `pnpm vue-tsc --noEmit` 确认无错误 |
| 3 | 生产构建 | `pnpm build` 确认成功 |
| 4 | 手动端到端走查 | 按 §4.1 全部 11 步骤逐项验证 |
| 5 | 修复验证中发现的问题 | 每个问题回归 RED→GREEN→VERIFY |
| 6 | 性能验证 | 弹窗打开 < 500ms, 首屏渲染 < 1s |
| 7 | CSP 审查 | 确认 manifest 不引入 unsafe-inline/unsafe-eval |
| 8 | 安全审查 | 确认所有 v-html 经过 DOMPurify |

### 验收清单

- [ ] `pnpm vitest run` 全部通过
- [ ] `pnpm vue-tsc --noEmit` 无错误
- [ ] `pnpm build` 构建成功
- [ ] 粘贴采集 → 入库 ✓
- [ ] 展示页列表 ✓
- [ ] 搜索过滤 ✓
- [ ] 单条删除 ✓
- [ ] JSON 导出 ✓
- [ ] 卸载清除数据 ✓
- [ ] 弹窗打开 < 500ms
- [ ] 无 console 错误

### 完成信号

**Phase 1 MVP 可交付。** 用户可独立使用扩展完成推文收藏、浏览、搜索、导出、删除。

---

---

# Phase 2 — 完整采集与渲染

---

## G2.1 — x.com 右键采集

> **Given** Phase 1 完成
> **When** 智能体执行 `/goal G2.1`
> **Then** 用户在 x.com 推文上右键 → "收藏此推文到 X-Pocket" → 自动采集入库

### 前置依赖

`G1.7` — Phase 1 验证通过

### 必读文档

`.trae/documents/02-system-architecture.md` §2.1, §2.4, §3.2, §4

### BDD 场景

```gherkin
Feature: x.com 右键采集
  作为 用户
  我想要 在 x.com 上右键推文直接收藏
  以便 无需手动复制粘贴嵌入代码

  Scenario: 右键推文时间戳链接 → 采集成功
    Given 用户在 x.com 推文详情页
    When 用户在推文时间戳链接上右键 → 点击 "收藏此推文到 X-Pocket"
    Then chrome.notifications 显示 "已收藏到 X-Pocket"
    And xpc:inbox 中出现一条待解析项

  Scenario: 在推文详情页任意位置右键（pageUrl 兜底）
    Given 用户在 x.com 推文详情页（URL 含 /status/<id>）
    When 用户在非链接区域右键 → 点击 "收藏此推文到 X-Pocket"
    Then 通过 info.pageUrl 解析出推文 URL → 走 oembed 采集流程

  Scenario: oembed 调用成功
    Given background 获取到推文 URL
    When 调用 fetch('https://publish.twitter.com/oembed?url=...')
    Then 返回的 blockquote HTML 写入 xpc:inbox

  Scenario: oembed 调用失败时友好提示
    Given oembed 返回 404（推文已删除）
    When background 收到错误
    Then 通知用户 "该推文可能已被删除或设为私有"

  Scenario: 打开展示页时自动处理 inbox
    Given xpc:inbox 中有待解析项
    When 用户打开展示页
    Then tweetsStore.load() 自动解析所有 inbox 项
    And 去重后合并到 xpc:tweets
    And xpc:inbox 被清空

  Scenario: 右键菜单仅在 x.com 显示
    Given 用户在非 x.com 页面
    When 用户右键
    Then "收藏此推文到 X-Pocket" 菜单项不出现
```

### 开发任务

| # | 任务 | 产出 |
|---|------|------|
| 1 | background SW 入口 | `src/background/index.ts`（chrome.runtime.onInstalled 注册右键菜单） |
| 2 | 右键菜单注册 | `src/background/contextMenus.ts`（contexts: ['link', 'page'], documentUrlPatterns） |
| 3 | oembed 调用 | `src/background/oembed.ts`（fetch + 超时 + 错误处理） |
| 4 | inbox 存储（G1.3 已实现） | 复用 `src/shared/storage/inbox.ts` |
| 5 | content script 注入 | `src/content/index.ts`（document 级 contextmenu 事件委托） |
| 6 | tweetFinder | `src/content/tweetFinder.ts`（记录 lastTweetUrl） |
| 7 | 消息协议实现 | `src/background/messaging.ts` + `src/shared/types/messages.ts` |
| 8 | 通知集成 | `chrome.notifications.create` |
| 9 | 编写集成测试 | mock chrome API |

### 测试方法

```bash
pnpm vitest run src/__tests__/background/
pnpm vitest run src/__tests__/content/

# 手动验证：打开 x.com 任意推文 → 右键 → 收藏 → 打开展示页确认
```

### 验收清单

- [ ] x.com 页面右键菜单出现 "收藏此推文到 X-Pocket"
- [ ] 非 x.com 页面不出现
- [ ] 点在时间戳链接上 → 正确采集
- [ ] 点在空白处（详情页）→ pageUrl 兜底采集
- [ ] oembed 成功 → inbox 有数据
- [ ] oembed 失败 → 友好通知
- [ ] 打开展示页 → inbox 自动解析入库 → 新推文出现
- [ ] SW 终止后重新唤醒 → 右键菜单仍可用

### 完成信号

x.com 推文详情页右键 → 收藏 → 展示页看到推文，全程无需手动粘贴。

---

## G2.2 — Native 渲染模式

> **Given** Phase 1 完成（本地渲染已就绪）
> **When** 智能体执行 `/goal G2.2`
> **Then** 用户可切换为 X 原生卡片渲染（加载 widgets.js），失败时自动降级

### 前置依赖

`G1.6` — Display 展示页（本地渲染模式已实现）

### 必读文档

`.trae/documents/02-system-architecture.md` §8, `.trae/documents/04-detailed-design.md` §5.5

### BDD 场景

```gherkin
Feature: X 原生渲染
  作为 用户
  我想要 以 X.com 原生卡片样式查看推文
  以便 获得与 X 平台一致的视觉体验

  Scenario: 切换为 Native 渲染模式
    Given 用户在详情弹窗中
    When 用户将渲染模式下拉切换为 "X 原生渲染"
    Then 卡片加载 widgets.js
    And 推文以 X 官方样式显示

  Scenario: widgets.js 加载失败时自动降级
    Given 用户切换到 Native 模式
    When widgets.js 加载超时或失败
    Then 自动切换回本地渲染模式
    And 显示提示 "X 原生渲染不可用，已切换为本地渲染"

  Scenario: 设置中切换默认渲染模式
    Given 用户在设置页面
    When 用户更改渲染模式为 "X 原生渲染" 并保存
    Then 此后所有卡片默认以 Native 模式渲染
```

### 开发任务

| # | 任务 | 产出 |
|---|------|------|
| 1 | widgetsLoader 单例 | `src/display/utils/widgetsLoader.ts`（script 标签注入 + 加载超时 + 降级） |
| 2 | TweetCardNative 组件 | `src/display/components/TweetCardNative.vue`（onMounted 调 twttr.widgets.load） |
| 3 | TweetCard 分发组件 | `src/display/components/TweetCard.vue`（按 renderMode 分发 local/native） |
| 4 | 更新 CSP | `manifest.config.ts` 添加 extension_pages CSP 白名单 |
| 5 | 降级逻辑 | 加载超时 10s → emit fallback → 父组件切换为 local |

### 测试方法

```bash
pnpm vitest run src/__tests__/display/components/TweetCardNative.test.ts

# 手动验证：展示页详情弹窗 → 切换 native → 观察卡片样式
```

### 验收清单

- [ ] Native 模式卡片显示 X 官方样式
- [ ] 切换回 local 正常
- [ ] widgets.js 加载失败 → 自动降级 + 提示
- [ ] CSP 不报 unsafe 错误
- [ ] 离线状态下 local 模式仍可用

### 完成信号

详情弹窗内 native/local 切换自如，native 失败时丝滑降级。

---

## G2.3 — 排序 + 路由 + 设置面板

> **Given** G1.6 完成（展示页基本功能）
> **When** 智能体执行 `/goal G2.3`
> **Then** 展示页支持路由、排序与用户设置持久化

### 前置依赖

`G1.6` — Display 展示页

### BDD 场景

```gherkin
Feature: 排序、路由与设置
  作为 用户
  我想要 按不同维度排序推文并自定义偏好
  以便 按需浏览收藏内容

  Scenario: 按收藏时间/发布时间排序
    Given 展示页有推文列表
    When 用户切换排序方式为 "发布时间" → "升序"
    Then 列表按 postedAt 从旧到新排列

  Scenario: 页面路由切换
    Given 用户在展示页
    When 用户点击导航进入 "/settings"
    Then 显示设置面板

  Scenario: 设置持久化
    Given 用户在设置页修改渲染模式为 "X 原生渲染"
    When 用户关闭扩展后重新打开
    Then 设置仍为 "X 原生渲染"

  Scenario: 从展示页导航栏进入设置
    Given 展示页顶部栏有 ⚙ 设置图标
    When 用户点击 ⚙
    Then 跳转到 /settings 路由
```

### 开发任务

| # | 任务 | 产出 |
|---|------|------|
| 1 | vue-router 配置 | `src/display/router.ts`（/、/settings、/tags） |
| 2 | 首页视图拆分 | `src/display/views/HomeView.vue` |
| 3 | SortControls 组件 | `src/display/components/SortControls.vue` |
| 4 | 设置页 | `src/display/views/SettingsView.vue` + `SettingsPanel.vue` |
| 5 | settings Pinia store | `src/display/stores/settings.ts` |
| 6 | 顶部导航栏 | 含搜索、排序、设置入口 |

### 测试方法

```bash
pnpm vitest run src/__tests__/display/stores/settings.test.ts
pnpm vitest run src/__tests__/display/router.test.ts

# 手动验证：切换排序 → 列表重排；改设置 → 刷新 → 保持
```

### 验收清单

- [ ] 按 collectedAt/postedAt 排序正确
- [ ] 升降序切换正确
- [ ] / → /settings 路由切换正常
- [ ] 设置修改后持久化
- [ ] 刷新页面设置保持

### 完成信号

排序控件可用，设置修改后刷新保持。

---

## G2.4 — HTML / Markdown / CSV 导出

> **Given** G1.4 完成（JSON 导出）
> **When** 智能体执行 `/goal G2.4`
> **Then** 用户可选择 HTML / Markdown / CSV 三种新格式导出

### 前置依赖

`G1.4` — JSON 导出（export 框架已就绪）

### BDD 场景

```gherkin
Feature: 多格式导出
  作为 用户
  我想要 以 HTML/Markdown/CSV 格式导出推文
  以便 适配不同的下游使用场景

  Scenario: 导出 HTML（含原生渲染脚本）
    Given 系统中有 2 条推文
    When 用户选择 HTML 格式并勾选 "包含 X 原生渲染脚本"
    Then 下载的 .html 文件浏览器打开可显示 X 原生卡片

  Scenario: 导出 HTML（不含脚本）
    Given 用户选择 HTML 格式但不勾选 "包含脚本"
    Then 下载的 .html 仅含 blockquote HTML，无 <script> 标签

  Scenario: 导出 Markdown
    Given 系统中有推文
    When 用户选择 Markdown 格式
    Then 下载 .md 文件，每条推文一个 ## section
    And 含引用块格式正文、原文链接、标签

  Scenario: 导出 CSV
    Given 系统中有推文
    When 用户选择 CSV 格式
    Then 下载 .csv 文件，UTF-8 BOM 开头
    And 含 header 行（id/tweetId/tweetUrl/author/handle/contentText/...）
    And mediaUrls 以 | 分隔，tags 以 ; 分隔

  Scenario: 导出弹窗格式选择
    Given 用户在展示页
    When 用户点击 "导出"
    Then 弹出 ExportDialog，显示 4 种格式 radio + 范围选择 + 确认/取消按钮
```

### 开发任务

| # | 任务 | 产出 |
|---|------|------|
| 1 | HTML 导出 + 测试 | `src/shared/exporter/html.ts` |
| 2 | Markdown 导出 + 测试 | `src/shared/exporter/markdown.ts` |
| 3 | CSV 导出 + 测试 | `src/shared/exporter/csv.ts` |
| 4 | ExportDialog 组件 | `src/display/components/ExportDialog.vue`（格式 + 范围 + HTML 特殊选项） |
| 5 | 集成到 display 页 | 替换 Phase 1 的纯 JSON 导出按钮 |

### 验收清单

- [ ] HTML 导出（含脚本）浏览器打开显示原生卡片
- [ ] HTML 导出（不含脚本）不含 `<script>`
- [ ] Markdown 导出格式正确（引用块 + 链接 + 标签）
- [ ] CSV 导出 UTF-8 BOM + 正确分隔符
- [ ] ExportDialog 交互完整

### 完成信号

ExportDialog 中选择任意格式导出，下载文件格式正确。

---

## G2.5 — Phase 2 端到端验证

> **Given** G2.1 ~ G2.4 全部完成
> **When** 智能体执行 `/goal G2.5`
> **Then** Phase 2 全功能验证通过

### 前置依赖

`G2.1` ~ `G2.4` 全部完成

### 必读文档

`.trae/documents/05-test-plan.md` §4.2

### 验收清单

- [ ] `pnpm vitest run` 全部通过
- [ ] `pnpm vue-tsc --noEmit` 无错误
- [ ] `pnpm build` 构建成功
- [ ] x.com 右键采集 ✓
- [ ] oembed 失败降级通知 ✓
- [ ] Native 渲染正常 ✓
- [ ] Local/Native 切换 ✓
- [ ] 四种格式导出正确 ✓
- [ ] 排序升降序正确 ✓
- [ ] 路由切换正常 ✓
- [ ] 设置持久化 ✓

### 完成信号

**Phase 2 可交付。** 右键采集 + 原生渲染 + 多格式导出全部可用。

---

---

# Phase 3 — 标签与批量

---

## G3.1 — 标签系统

> **Given** Phase 2 完成
> **When** 智能体执行 `/goal G3.1`
> **Then** 用户可创建标签、给推文打标签、按标签过滤

### 前置依赖

`G2.5` — Phase 2 验证通过

### BDD 场景

```gherkin
Feature: 标签系统
  作为 用户
  我想要 给推文打标签并分类过滤
  以便 按主题管理大量收藏推文

  Scenario: 创建标签
    Given 用户在标签管理页
    When 用户输入标签名 "科技" + 选择颜色 → 点击创建
    Then 标签出现在标签列表中

  Scenario: 给推文打标签
    Given 详情弹窗打开
    When 用户在标签编辑区选择 "科技" 标签
    Then 卡片底部显示标签 chip

  Scenario: 按标签过滤（OR 模式）
    Given 用户选中 "科技" 和 "能源" 标签，过滤模式为 OR
    Then 列表显示包含 "科技" 或 "能源" 任一标签的推文

  Scenario: 按标签过滤（AND 模式）
    Given 用户选中 "科技" 和 "能源" 标签，过滤模式为 AND
    Then 列表仅显示同时包含两个标签的推文

  Scenario: 删除标签
    Given 标签 "科技" 存在
    When 用户删除该标签
    Then 所有推文的 tags 数组中移除该标签 ID
```

### 开发任务

| # | 任务 | 产出 |
|---|------|------|
| 1 | Tag 类型 + CRUD | `src/shared/types/tag.ts`, `src/shared/storage/tagStore.ts` |
| 2 | tags Pinia store | `src/display/stores/tags.ts` |
| 3 | TagFilter 侧边栏 | `src/display/components/TagFilter.vue` |
| 4 | TagEditor 组件 | `src/display/components/TagEditor.vue`（详情弹窗底部标签编辑） |
| 5 | 标签管理页 | `src/display/views/TagsView.vue` |
| 6 | 路由补充 | `/tags` 路由 |

### 验收清单

- [ ] 创建/删除标签正常
- [ ] 给推文打标签 / 移除标签正常
- [ ] OR 过滤正确
- [ ] AND 过滤正确
- [ ] 删除标签 → 推文 tags 同步清理
- [ ] 标签管理页 CRUD 完整

### 完成信号

创建标签 → 打标签 → 侧边栏过滤，and/or 模式正确。

---

## G3.2 — 批量操作

> **Given** G3.1 完成
> **When** 智能体执行 `/goal G3.2`
> **Then** 用户可多选推文进行批量导出和删除

### 前置依赖

`G3.1` — 标签系统（共用 selection 机制）

### BDD 场景

```gherkin
Feature: 批量操作
  作为 用户
  我想要 一次选择多条推文进行批量操作
  以便 高效管理大量收藏

  Scenario: 多选推文
    Given 列表显示 5 条推文
    When 用户点击卡片的复选框
    Then 卡片进入选中状态（边框高亮）
    And BatchToolbar 出现，显示 "已选 N 条"

  Scenario: 全选当前过滤结果
    Given 搜索过滤后有 3 条推文
    When 用户点击 BatchToolbar 的 "全选"
    Then 所有 3 条被选中

  Scenario: 批量导出选中推文
    Given 用户选中 2 条推文
    When 用户点击 "导出选中" → 选择格式 → 确认
    Then 下载的导出文件仅含选中的 2 条

  Scenario: 批量删除
    Given 用户选中 3 条推文
    When 用户点击 "删除" → 确认
    Then 3 条推文全部移除

  Scenario: 取消选择
    Given 用户选中若干推文
    When 用户点击 BatchToolbar 的 "取消" 或按 Escape
    Then 所有选中状态取消
    And BatchToolbar 消失
```

### 开发任务

| # | 任务 | 产出 |
|---|------|------|
| 1 | selection Pinia store | `src/display/stores/selection.ts` |
| 2 | BatchToolbar 组件 | `src/display/components/BatchToolbar.vue` |
| 3 | 卡片复选框 | 集成到 TweetGridCard |
| 4 | 批量导出 | 整合 ExportDialog + selection |
| 5 | 批量删除 | 确认弹窗 + 批量 remove |

### 验收清单

- [ ] 多选 / 全选 / 取消选择正常
- [ ] 批量导出仅含选中项
- [ ] 批量删除确认后全部移除
- [ ] BatchToolbar 显隐逻辑正确

### 完成信号

多选 → 批量导出 → 批量删除，全程无报错。

---

## G3.3 — 数据导入 + 暗色主题 + 通知 Badge

> **Given** G3.2 完成
> **When** 智能体执行 `/goal G3.3`
> **Then** 用户可导入 JSON 恢复数据、切换暗色主题、看到收藏数 badge

### 前置依赖

`G3.2` — 批量操作

### BDD 场景

```gherkin
Feature: 数据导入、暗色主题与通知
  作为 用户
  我想要 从 JSON 恢复数据、使用暗色主题、看到收藏数提示
  以便 完善使用体验

  Scenario: 导入 JSON 恢复数据（去重）
    Given 用户有之前导出的 x-pocket JSON 文件
    When 用户在设置页点击 "导入数据" → 选择文件
    Then 数据恢复，已存在的推文去重跳过
    And 显示导入结果 "成功导入 N 条，跳过 M 条重复"

  Scenario: 导入无效 JSON
    Given 用户选择了非 x-pocket 格式的 JSON 文件
    When 系统尝试解析
    Then 显示错误提示 "文件格式不正确"

  Scenario: 暗色主题切换
    Given 用户在设置页
    When 用户选择 "深色" 主题
    Then 页面配色切换为暗色方案
    And 设置持久化

  Scenario: 系统主题跟随
    Given 用户选择 "跟随系统" 主题
    When 系统主题切换（prefers-color-scheme 变化）
    Then 扩展页面自动跟随

  Scenario: 扩展图标 badge 显示收藏数
    Given 系统中有 N 条推文
    Then 扩展图标角标显示 N（≤ 999 时显示数字，> 999 显示 "999+"）

  Scenario: 收藏成功通知
    Given 用户完成一次收藏
    Then 右上角出现通知 "已收藏到 X-Pocket"
```

### 开发任务

| # | 任务 | 产出 |
|---|------|------|
| 1 | JSON 导入功能 | `src/shared/importer/json.ts`（文件读取 → 解析 → 去重合并） |
| 2 | 暗色主题 CSS | `[data-theme="dark"]` CSS 变量覆盖 |
| 3 | 主题切换逻辑 | Pinia store + `@vueuse/core` useMediaQuery |
| 4 | 通知系统 | `chrome.notifications` |
| 5 | Badge 更新 | `chrome.action.setBadgeText` + `setBadgeBackgroundColor` |
| 6 | 设置页补充 | 导入按钮、主题 radio、清除数据按钮 |

### 验收清单

- [ ] JSON 导入去重正确
- [ ] 无效 JSON 提示错误
- [ ] 暗色主题视觉正确
- [ ] 系统主题跟随生效
- [ ] Badge 显示正确数字
- [ ] 收藏成功有通知

### 完成信号

导入/主题/badge 全部可用。

---

## G3.4 — Phase 3 端到端验证

> **Given** G3.1 ~ G3.3 全部完成
> **When** 智能体执行 `/goal G3.4`
> **Then** Phase 3 全功能验证通过，完整版可交付

### 验收清单

- [ ] `pnpm vitest run` 全部通过
- [ ] `pnpm vue-tsc --noEmit` 无错误
- [ ] `pnpm build` 构建成功
- [ ] 标签 CRUD + 过滤 ✓
- [ ] 批量多选/导出/删除 ✓
- [ ] 数据导入去重 ✓
- [ ] 暗色主题切换 ✓
- [ ] 通知 + badge ✓
- [ ] 无 console 错误

### 完成信号

**X-Pocket 完整版可交付。** 全部 3 个 Phase 功能可用，性能达标，安全审查通过。

---

---

## 附录 A：目标状态标记

在 `/goal` 命令使用过程中，目标有以下状态：

| 状态 | 含义 |
|------|------|
| `[ ]` | 未开始 |
| `[~]` | 进行中 |
| `[✓]` | 已完成 |
| `[x]` | 已跳过（因依赖失败） |

---

## 附录 B：跨目标通用规则

```
Scenario: 每个目标必须独立可验证
  Given 智能体完成了目标 Gx.y
  When 智能体运行该目标的验收清单
  Then 所有检查项必须通过
  And 不得依赖后续目标的功能

Scenario: 目标失败时禁止前进
  Given 目标 Gx.y 的验收清单中有未通过项
  When 智能体尝试开始 Gx.y+1
  Then 这是违规行为，必须回到 Gx.y 修复

Scenario: 每个目标结束必须运行全量回归
  Given 目标 Gx.y 已标记完成
  When 智能体向用户报告
  Then 必须先运行 pnpm vitest run 确认无回归
  And 必须先运行 pnpm vue-tsc --noEmit 确认无类型错误
```

---

## 附录 C：BDD 场景编写规范

```gherkin
# 正确示例：具体、可验证
Scenario: 解析标准中文推文嵌入码
  Given 用户从 X.com 复制了一段中文推文的 blockquote HTML
  When 系统调用 parseBlockquote(html)
  Then 返回 ParsedTweet 对象
  And tweetId = "2073779604264047025"
  And contentText 包含 "cornex楚能"

# 错误示例：模糊、不可验证
Scenario: 解析功能正常  ← 太模糊
  Given 一些输入
  When 系统处理
  Then 结果正确  ← 无法验证
```

---

## 附录 D：快速命令参考

```bash
/goal G1.1      # 执行项目脚手架搭建
/goal G1.2      # 执行类型定义 + 解析器
/goal status    # 查看所有目标完成状态
/goal next      # 自动定位到下一个未完成目标
/goal verify    # 重新运行当前目标的验收清单
/goal list      # 列出所有目标及状态
```
