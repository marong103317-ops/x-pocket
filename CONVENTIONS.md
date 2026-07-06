# X-Pocket 编码约定

> 本文档定义 X-Pocket 项目中所有代码的统一风格和约定。
> 任何 `.vue` / `.ts` / `.css` 文件必须遵守本文档，确保代码风格一致。

---

## 1. Vue SFC 模板

### 1.1 标准结构

```vue
<script setup lang="ts">
// 1. imports（按顺序分组）
import { ref, computed, onMounted } from 'vue'

import { useTweetsStore } from '@/display/stores/tweets'

import TweetCardLocal from './TweetCardLocal.vue'

// 2. props
const props = defineProps<{
  tweet: CollectedTweet
  compact?: boolean
}>()

// 3. emits
const emit = defineEmits<{
  click: [id: string]
  delete: [id: string]
}>()

// 4. composables / stores
const router = useRouter()
const tweetsStore = useTweetsStore()

// 5. local state
const isExpanded = ref(false)

// 6. computed
const displayDate = computed(() => formatDate(props.tweet.postedAt))

// 7. methods
function handleClick() {
  emit('click', props.tweet.id)
}

// 8. lifecycle
onMounted(() => {
  // ...
})
</script>

<template>
  <div class="component-name" @click="handleClick">
    <!-- template 内容 -->
  </div>
</template>

<style scoped>
.component-name {
  /* 样式 */
}
</style>
```

### 1.2 禁止事项

- ❌ Options API（`export default { data(), methods: {} }`）
- ❌ `<script>` + `<script setup>` 混用（同文件两个 script 块）
- ❌ 在 `<script setup>` 中使用 `defineComponent`
- ❌ 直接修改 props（用 `emit` 通知父组件）

---

## 2. TypeScript 约定

### 2.1 类型导入

```typescript
// ✅ 使用 import type 导入仅用于类型的声明
import type { CollectedTweet, ParsedTweet } from '@/shared/types/tweet'
import { parseBlockquote } from '@/shared/parser/blockquoteParser'

// ❌ 混在一起
import { type CollectedTweet, parseBlockquote } from '...'
```

### 2.2 禁止 any

```typescript
// ❌ 禁止
function process(data: any): any { ... }

// ✅ 用 unknown + 类型守卫
function process(data: unknown): ProcessResult {
  if (!isCollectedTweet(data)) {
    throw new Error('Invalid data')
  }
  // data 此时被收窄为 CollectedTweet
  return { ... }
}

// ✅ 用泛型
function getStoreData<T>(key: string): T | undefined { ... }
```

### 2.3 禁止 as 强制转换

```typescript
// ❌ 禁止
const tweet = data as CollectedTweet
const el = document.getElementById('foo') as HTMLDivElement

// ✅ 类型守卫
function isCollectedTweet(obj: unknown): obj is CollectedTweet {
  return typeof obj === 'object' && obj !== null && 'tweetId' in obj
}

// ✅ 泛型约束 or null check
const el = document.getElementById('foo')
if (el instanceof HTMLDivElement) {
  el.textContent = 'hello'
}
```

### 2.4 显式返回类型

```typescript
// ✅ 函数必须有显式返回类型
export function parseBlockquote(html: string): ParsedTweet | null { ... }
export async function getAllTweets(): Promise<CollectedTweet[]> { ... }

// ❌ 依赖类型推断（仅简单箭头函数可例外）
export function parseBlockquote(html: string) { ... } // 缺少返回类型
```

### 2.5 exhaustiveness check

```typescript
// ✅ switch 必须覆盖所有分支
function getExportMime(format: ExportFormat): string {
  switch (format) {
    case 'json':     return 'application/json'
    case 'html':     return 'text/html'
    case 'markdown': return 'text/markdown'
    case 'csv':      return 'text/csv'
    default: {
      const _exhaustive: never = format
      throw new Error(`Unhandled format: ${format}`)
    }
  }
}
```

---

## 3. 导入排序

```typescript
// 第 1 组：Vue 生态
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDebounceFn } from '@vueuse/core'

// 第 2 组：第三方库
import DOMPurify from 'dompurify'

// 第 3 组：@/shared
import type { CollectedTweet } from '@/shared/types/tweet'
import { parseBlockquote } from '@/shared/parser/blockquoteParser'
import { sanitizeHtml } from '@/shared/utils/sanitize'

// 第 4 组：@/同上下文（popup 内 / display 内）
import { useTweetsStore } from '@/display/stores/tweets'
import TweetCard from '@/display/components/TweetCard.vue'

// 第 5 组：相对路径组件
import ConfirmDialog from './ConfirmDialog.vue'
```

---

## 4. 命名规范

### 4.1 文件

| 类型 | 规范 | 示例 |
|------|------|------|
| Vue 组件 | PascalCase | `TweetCardLocal.vue` |
| TypeScript 模块 | kebab-case | `blockquote-parser.ts` |
| 类型文件 | kebab-case（文件名） | `tweet.ts`, `storage.ts` |
| Store | camelCase | `tweets.ts`, `settings.ts` |
| 测试文件 | `<原名>.test.ts` | `blockquoteParser.test.ts` |
| 目录 | kebab-case | `shared/storage/`, `display/components/` |

### 4.2 代码内命名

```typescript
// 组件：PascalCase
import TweetCardLocal from './TweetCardLocal.vue'

// 函数：camelCase
function parseBlockquote(html: string): ParsedTweet | null { ... }
function normalizeTweetUrl(raw: string): string { ... }

// 变量：camelCase
const collectedTweets = ref<CollectedTweet[]>([])
const isLoading = ref(false)

// 常量：UPPER_SNAKE_CASE（仅顶层 const）
const STORAGE_KEYS = { ... } as const
const MAX_PREVIEW_LENGTH = 100

// 类型/接口：PascalCase
interface CollectedTweet { ... }
type ExportFormat = 'json' | 'html' | 'markdown' | 'csv'

// Pinia store：useXxxStore
const tweetsStore = useTweetsStore()
const settingsStore = useSettingsStore()

// 事件 handler：handleXxx
function handleDelete(id: string) { ... }
function handleSearchInput(value: string) { ... }

// Boolean：is/has/should 前缀
const isExpanded = ref(false)
const hasCoverImage = computed(() => !!tweet.coverUrl)
```

---

## 5. 错误处理模式

### 5.1 三种返回值模式

```typescript
// 模式 A：null 返回值（解析器类，无歧义失败）
// 适用：输入可能不合法，失败是预期内的
export function parseBlockquote(html: string): ParsedTweet | null {
  if (!html) return null
  const bq = doc.querySelector('blockquote.twitter-tweet')
  if (!bq) return null
  return { ... }
}

// 模式 B：Result 对象（存储操作类，失败原因重要）
// 适用：调用方需要知道失败原因
export async function addTweet(tweet: CollectedTweet): Promise<AddResult> {
  // ...
  return { success: true }
  // or
  return { success: false, duplicate: true }
  // or
  return { success: false, error: 'STORAGE_QUOTA_WARNING' }
}

// 模式 C：throw（编程错误/不该发生的情况）
// 适用：逻辑错误，表示代码 bug 而非用户操作问题
export function assertNotNull<T>(value: T | null, message: string): T {
  if (value === null) throw new Error(`Assertion failed: ${message}`)
  return value
}
```

### 5.2 用户可见错误

```typescript
// ✅ 中文、友好、不暴露技术细节
showError('无法解析，请检查是否为 twitter-tweet 格式')
showError('该推文已收藏过')
showError('存储空间不足，请导出后清理旧推文')

// ❌ 技术错误信息暴露给用户
showError('TypeError: Cannot read properties of null')
showError('chrome.storage.local.set failed with QUOTA_BYTES exceeded')
```

---

## 6. CSS 约定

### 6.1 变量优先

```css
/* ✅ 使用 CSS 变量 */
.my-card {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  padding: var(--space-4);
  border-radius: var(--radius-md);
}

/* ❌ 硬编码颜色值 */
.my-card {
  background: #ffffff;
  border: 1px solid #cfd9de;
  color: #0f1419;
}
```

### 6.2 变量定义位置

所有共享变量定义在 `preview.html`（参考文件）或全局 CSS 入口中：

```css
:root {
  --color-primary: #1d9bf0;
  --color-bg: #ffffff;
  --color-text: #0f1419;
  /* ... 见 08-ui-ux-spec.md §2 */
}

[data-theme="dark"] {
  --color-bg: #15202b;
  --color-text: #e7e9ea;
  /* ... */
}
```

### 6.3 Scoped 样式

```vue
<!-- ✅ 组件样式必须 scoped -->
<style scoped>
.card { ... }
</style>

<!-- ❌ 非 scoped 样式仅在全局入口文件中 -->
<style>
/* 仅 App.vue 或全局 CSS 文件可用 */
</style>
```

### 6.4 响应式断点（Display 页）

```css
.tweet-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  max-width: 1200px;
  margin: 0 auto;
}
```

---

## 7. 用户可见文案

### 7.1 语言

所有用户可见文本使用**简体中文**。

### 7.2 术语统一

| 术语 | 统一写法 | 禁止 |
|------|----------|------|
| 推文 | "推文" | "tweet"、"微博" |
| 收藏 | "收藏" | "保存"、"收录" |
| 导出 | "导出" | "下载"（导出场景） |
| 标签 | "标签" | "tag"、"分类" |
| 渲染 | "渲染" | "render" |
| 嵌入代码 | "嵌入代码" | "embed code" |

### 7.3 错误提示模板

```
"无法解析，请检查是否为 twitter-tweet 格式"
"该推文已收藏过"
"存储空间不足（已使用 {used}MB / 10MB），请导出后清理旧推文"
"该推文可能已被删除或设为私有"
"X 原生渲染不可用，已切换为本地渲染"
"成功导入 {count} 条，跳过 {skipped} 条重复"
"文件格式不正确，请选择 X-Pocket 导出的 JSON 文件"
```

### 7.4 占位符文本

```
"粘贴推文嵌入代码..."
"搜索作者、handle 或正文内容..."
"输入标签名..."
```

---

## 8. chrome.storage 规范

### 8.1 Key 命名

```typescript
// ✅ 所有 storage key 必须使用 xpc: 前缀，定义在 keys.ts
export const STORAGE_KEYS = {
  META: 'xpc:meta',
  TWEETS: 'xpc:tweets',
  TAGS: 'xpc:tags',
  SETTINGS: 'xpc:settings',
  INBOX: 'xpc:inbox',
} as const

// ❌ 禁止在其他文件中硬编码 key 字符串
await chrome.storage.local.get('xpc:tweets') // ← 应用 STORAGE_KEYS.TWEETS
```

### 8.2 读写模式

```typescript
// ✅ 读：启动时一次全量 → Pinia store → 内存操作
async function load(): Promise<void> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.TWEETS)
  tweets.value = result[STORAGE_KEYS.TWEETS] ?? {}
  await processInbox()
}

// ✅ 写：修改 Pinia store → 全量写回
async function add(parsed: ParsedTweet): Promise<void> {
  const tweet = buildTweet(parsed)
  tweets.value[tweet.id] = tweet
  await chrome.storage.local.set({
    [STORAGE_KEYS.TWEETS]: { ...tweets.value }
  })
}

// ❌ 禁止：逐条 set 单个 key
await chrome.storage.local.set({ [`xpc:tweets:${id}`]: tweet })
```

---

## 9. 安全规范

### 9.1 HTML 消毒

```typescript
// ✅ 所有用户输入或外部 HTML 必须经过 DOMPurify
import { sanitizeHtml } from '@/shared/utils/sanitize'

// 存储前消毒
const safeHtml = sanitizeHtml(rawHtml)

// v-html 前消毒
<div v-html="sanitizeHtml(contentHtml)" />

// ❌ 禁止直接使用未消毒的 HTML
<div v-html="rawHtml" />         // ← 禁止
element.innerHTML = rawHtml       // ← 禁止
```

### 9.2 外部请求

```typescript
// ✅ 外部请求仅限 manifest 中已声明的域名
fetch('https://publish.twitter.com/oembed?url=...')  // ✅ host_permissions 中声明

// ❌ 禁止请求未声明域名
fetch('https://api.unknown-service.com/...')  // ← 禁止
```

### 9.3 敏感信息

```typescript
// ❌ 禁止在 chrome.storage 中存储
// - API 密钥
// - 用户密码/token
// - 个人身份信息（PII）

// ✅ chrome.storage 仅存储推文数据（都是公开信息）和用户设置
```

---

## 10. 性能约定

### 10.1 Debounce

```typescript
// ✅ 搜索输入必须 debounce（200ms）
import { useDebounceFn } from '@vueuse/core'

const search = ref('')
const debouncedSearch = useDebounceFn((value: string) => {
  tweetsStore.search = value
}, 200)
```

### 10.2 计算属性 vs 方法

```vue
<script setup lang="ts">
// ✅ 纯计算 → computed（有缓存）
const filteredTweets = computed(() => {
  return Object.values(tweets.value).filter(...)
})

// ✅ 有副作用 → method
function handleExport() {
  const blob = exportTweets({ ... })
  downloadBlob(blob, 'export.json')
}
</script>
```

---

## 11. Git 提交信息（中文）

```
feat(parser): 实现 blockquote HTML 解析器
fix(storage): 修复相同 tweetId 去重逻辑
refactor(display): 提取 TweetGrid 为独立组件
test(exporter): 补充 CSV BOM 测试用例
chore: 配置 vitest + jsdom 测试环境
docs: 补充 AGENTS.md 安全规范章节
```

---

## 12. 禁止事项总览

| 类别 | 禁止 | 替代方案 |
|------|------|----------|
| TS | `any` | `unknown` + 类型守卫 |
| TS | `as` 强制转换 | 类型守卫 / null check |
| TS | `@ts-ignore` | 修复类型错误 |
| CSS | 硬编码颜色值 | CSS 变量 |
| CSS | 非 scoped 样式（组件内） | `<style scoped>` |
| HTML | 未消毒的 `v-html` | `sanitizeHtml()` |
| HTML | 直接 `innerHTML` | `sanitizeHtml()` + `textContent` |
| Storage | 硬编码 key 字符串 | `STORAGE_KEYS` 常量 |
| Storage | 逐条 set | 全量读写 |
| Network | 请求未声明域名 | 仅已声明的 host_permissions |
| UI | 英文文案 | 简体中文 |
| SW | DOMParser | inbox 队列 + display 解析 |
