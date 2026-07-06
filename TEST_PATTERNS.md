# X-Pocket 测试模式与 Mock 指南

> 本文档定义 X-Pocket 项目中所有测试的统一模式和 mock 基础设施。
> 每个目标在编写测试时必须遵循本文档的模式，确保测试风格一致。

---

## 1. 目录结构

```
src/
├── __tests__/
│   ├── __fixtures__/           # 共享测试数据
│   │   ├── template.html        # 标准推文 blockquote 输入
│   │   ├── tweets.ts            # 预构造的 CollectedTweet 数组
│   │   └── english-tweet.html   # 英文推文 blockquote
│   ├── __mocks__/               # 共享 mock 实现
│   │   ├── chrome-storage.ts    # chrome.storage.local mock
│   │   ├── chrome-tabs.ts       # chrome.tabs mock
│   │   ├── chrome-runtime.ts    # chrome.runtime mock
│   │   ├── chrome-context-menus.ts
│   │   └── chrome-notifications.ts
│   ├── shared/
│   │   ├── parser/
│   │   │   ├── blockquoteParser.test.ts
│   │   │   ├── urlParser.test.ts
│   │   │   └── dateParser.test.ts
│   │   ├── storage/
│   │   │   ├── tweetStore.test.ts
│   │   │   ├── settingsStore.test.ts
│   │   │   └── inbox.test.ts
│   │   ├── exporter/
│   │   │   ├── json.test.ts
│   │   │   ├── html.test.ts
│   │   │   ├── markdown.test.ts
│   │   │   └── csv.test.ts
│   │   └── utils/
│   │       ├── download.test.ts
│   │       └── sanitize.test.ts
│   ├── popup/
│   │   └── components/
│   │       ├── PasteCollector.test.ts
│   │       └── RecentList.test.ts
│   ├── display/
│   │   ├── stores/
│   │   │   ├── tweets.test.ts
│   │   │   └── settings.test.ts
│   │   └── components/
│   │       ├── TweetCardLocal.test.ts
│   │       ├── TweetGrid.test.ts
│   │       ├── SearchBar.test.ts
│   │       └── TweetDetail.test.ts
│   ├── background/
│   │   ├── contextMenus.test.ts
│   │   └── oembed.test.ts
│   └── content/
│       └── tweetFinder.test.ts
├── background/
├── content/
├── popup/
├── display/
└── shared/
```

---

## 2. chrome.storage.local Mock

这是本项目最核心的 mock，所有存储层测试都依赖它。

### 2.1 Mock 实现

```typescript
// src/__tests__/__mocks__/chrome-storage.ts
import { vi } from 'vitest'

/**
 * 创建 chrome.storage.local 的内存模拟。
 * 每次调用 createStorageMock() 返回一个独立的新实例。
 */
export function createStorageMock() {
  const store = new Map<string, unknown>()

  return {
    get: vi.fn(
      (keys: string | string[] | null): Promise<Record<string, unknown>> => {
        if (keys === null || keys === undefined) {
          // 读取全部
          const result: Record<string, unknown> = {}
          store.forEach((v, k) => { result[k] = v })
          return Promise.resolve(result)
        }
        if (typeof keys === 'string') {
          return Promise.resolve({ [keys]: store.get(keys) })
        }
        // 数组 key
        const result: Record<string, unknown> = {}
        for (const k of keys) {
          result[k] = store.get(k)
        }
        return Promise.resolve(result)
      }
    ),

    set: vi.fn(
      (items: Record<string, unknown>): Promise<void> => {
        for (const [k, v] of Object.entries(items)) {
          store.set(k, v)
        }
        return Promise.resolve()
      }
    ),

    remove: vi.fn(
      (keys: string | string[]): Promise<void> => {
        const keyList = typeof keys === 'string' ? [keys] : keys
        for (const k of keyList) {
          store.delete(k)
        }
        return Promise.resolve()
      }
    ),

    clear: vi.fn((): Promise<void> => {
      store.clear()
      return Promise.resolve()
    }),

    getBytesInUse: vi.fn(
      (_keys?: string | string[]): Promise<number> => {
        // 简单估计：每个字符 2 字节
        let total = 0
        store.forEach((v) => {
          total += JSON.stringify(v).length * 2
        })
        return Promise.resolve(total)
      }
    ),

    // 暴露内部 store 便于测试断言
    _dump: () => new Map(store),
    _reset: () => store.clear(),
  }
}
```

### 2.2 挂载到全局

```typescript
// src/__tests__/setup.ts  （vitest.config.ts 中配置 setupFiles）
import { createStorageMock } from './__mocks__/chrome-storage'

// 全局挂载 chrome.storage.local
const storageMock = createStorageMock()

Object.defineProperty(globalThis, 'chrome', {
  value: {
    storage: {
      local: storageMock,
    },
  },
  writable: true,
  configurable: true,
})
```

### 2.3 在测试中使用

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { addTweet, getAllTweets } from '@/shared/storage/tweetStore'
import type { CollectedTweet } from '@/shared/types/tweet'

describe('tweetStore', () => {
  beforeEach(() => {
    // 每个测试前清空 storage
    ;(chrome.storage.local as ReturnType<typeof createStorageMock>)._reset()
  })

  it('应该新增推文', async () => {
    const tweet = makeTweet({ tweetId: '123' })

    const result = await addTweet(tweet)

    expect(result.success).toBe(true)
    const tweets = await getAllTweets()
    expect(tweets).toHaveLength(1)
    expect(tweets[0].tweetId).toBe('123')
  })

  it('应该去重（相同 tweetId）', async () => {
    await addTweet(makeTweet({ tweetId: '123' }))
    const result = await addTweet(makeTweet({ tweetId: '123' }))

    expect(result.success).toBe(false)
    expect(result.duplicate).toBe(true)
    const tweets = await getAllTweets()
    expect(tweets).toHaveLength(1)
  })
})
```

---

## 3. 其他 chrome.* API Mock

### 3.1 chrome.tabs

```typescript
// src/__tests__/__mocks__/chrome-tabs.ts
import { vi } from 'vitest'

export function createTabsMock() {
  return {
    create: vi.fn(
      (_options: { url: string }): Promise<chrome.tabs.Tab> => {
        return Promise.resolve({
          id: 1,
          windowId: 1,
          url: _options.url,
        } as chrome.tabs.Tab)
      }
    ),
    query: vi.fn(() => Promise.resolve([])),
    sendMessage: vi.fn(() => Promise.resolve()),
  }
}
```

### 3.2 chrome.runtime

```typescript
// src/__tests__/__mocks__/chrome-runtime.ts
import { vi } from 'vitest'

export function createRuntimeMock() {
  return {
    sendMessage: vi.fn(() => Promise.resolve()),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    onInstalled: {
      addListener: vi.fn(),
    },
    getURL: vi.fn((path: string) => `chrome-extension://mock-id/${path}`),
  }
}
```

### 3.3 chrome.contextMenus

```typescript
// src/__tests__/__mocks__/chrome-context-menus.ts
import { vi } from 'vitest'

export function createContextMenusMock() {
  const handlers: Array<(info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => void> = []

  return {
    create: vi.fn((_props: chrome.contextMenus.CreateProperties) => 'menu-id'),
    removeAll: vi.fn(() => Promise.resolve()),
    onClicked: {
      addListener: vi.fn(
        (cb: (info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => void) => {
          handlers.push(cb)
        }
      ),
      // 测试辅助：模拟右键点击
      _trigger: (info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => {
        handlers.forEach(h => h(info, tab))
      },
    },
  }
}
```

### 3.4 chrome.notifications

```typescript
// src/__tests__/__mocks__/chrome-notifications.ts
import { vi } from 'vitest'

export function createNotificationsMock() {
  return {
    create: vi.fn(
      (_id: string, _options: chrome.notifications.NotificationOptions): Promise<string> => {
        return Promise.resolve('notification-id')
      }
    ),
    clear: vi.fn(() => Promise.resolve(true)),
  }
}
```

---

## 4. 测试 Fixture 工厂

### 4.1 推文工厂函数

```typescript
// src/__tests__/__fixtures__/tweets.ts
import type { CollectedTweet, ParsedTweet } from '@/shared/types/tweet'

/**
 * 创建最小有效推文对象。调用方可以传入部分字段覆盖默认值。
 */
export function makeTweet(overrides: Partial<CollectedTweet> = {}): CollectedTweet {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    tweetId: overrides.tweetId ?? '2073779604264047025',
    tweetUrl: overrides.tweetUrl ?? 'https://x.com/iamai_omni/status/2073779604264047025',
    author: overrides.author ?? '✧ 𝕀𝔸𝕄𝔸𝕀 ✧',
    handle: overrides.handle ?? 'iamai_omni',
    authorUrl: overrides.authorUrl ?? 'https://x.com/iamai_omni',
    contentHtml: overrides.contentHtml ?? '我打赌全网应该没几个人知道cornex楚能',
    contentText: overrides.contentText ?? '我打赌全网应该没几个人知道cornex楚能',
    lang: overrides.lang ?? 'zh',
    postedAt: overrides.postedAt ?? '2026-07-05T00:00:00.000Z',
    mediaUrls: overrides.mediaUrls ?? [],
    coverUrl: overrides.coverUrl ?? '',
    blockquoteHtml: overrides.blockquoteHtml ?? '<blockquote class="twitter-tweet">...</blockquote>',
    tags: overrides.tags ?? [],
    collectedAt: overrides.collectedAt ?? '2026-07-06T12:00:00.000Z',
    source: overrides.source ?? 'manual',
    notes: overrides.notes,
  }
}

/**
 * 创建 N 条不同 tweetId 的推文，用于列表/搜索/导出测试。
 */
export function makeTweets(count: number): CollectedTweet[] {
  return Array.from({ length: count }, (_, i) =>
    makeTweet({
      id: crypto.randomUUID(),
      tweetId: `tweet-${i}`,
      tweetUrl: `https://x.com/user/status/${i}`,
      contentText: `这是第 ${i} 条推文的内容`,
      author: `作者${i}`,
      handle: `user${i}`,
      collectedAt: new Date(Date.now() - i * 60_000).toISOString(),
    })
  )
}
```

### 4.2 blockquote HTML fixture

```typescript
// src/__tests__/__fixtures__/blockquotes.ts

/** 标准中文推文（来自 template.html） */
export const CHINESE_TWEET_HTML = `
<blockquote class="twitter-tweet"><p lang="zh" dir="ltr">我打赌全网应该没几个人知道cornex楚能，这家比宁德时代还牛逼的全球最大储能电池工厂，正在以发疯的速度扩建，思格新能也是它们的客户。 <a href="https://t.co/oRDjWucQBx">pic.twitter.com/oRDjWucQBx</a></p>&mdash; ✧ 𝕀𝔸𝕄𝔸𝕀 ✧ (@iamai_omni) <a href="https://x.com/iamai_omni/status/2073779604264047025?ref_src=twsrc%5Etfw">July 5, 2026</a></blockquote> <script async src="https://platform.x.com/widgets.js" charset="utf-8"></script>
`

/** 标准英文推文 */
export const ENGLISH_TWEET_HTML = `
<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Excited to announce our latest breakthrough in battery technology. <a href="https://t.co/abc123">pic.twitter.com/abc123</a></p>&mdash; Elon Musk (@elonmusk) <a href="https://x.com/elonmusk/status/1234567890">July 4, 2026</a></blockquote> <script async src="https://platform.x.com/widgets.js" charset="utf-8"></script>
`

/** 不含 blockquote 的普通 HTML（用于测试非法输入） */
export const NON_BLOCKQUOTE_HTML = '<div><p>Just a regular paragraph.</p></div>'

/** 含 XSS 攻击载荷的 blockquote */
export const XSS_TWEET_HTML = `
<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Test <img src=x onerror=alert(1)> content</p>&mdash; Hacker (@hacker) <a href="https://x.com/hacker/status/99999">July 1, 2026</a></blockquote>
`

/** 空字符串 */
export const EMPTY_HTML = ''
```

---

## 5. Vue 组件测试模式

### 5.1 安装组件测试依赖

```bash
pnpm add -D @vue/test-utils @testing-library/vue jsdom
```

### 5.2 测试模式：纯展示组件

```typescript
// src/__tests__/display/components/TweetCardLocal.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TweetCardLocal from '@/display/components/TweetCardLocal.vue'
import { makeTweet } from '@/__tests__/__fixtures__/tweets'

describe('TweetCardLocal', () => {
  it('应该渲染作者名', () => {
    const tweet = makeTweet({ author: '测试作者' })

    const wrapper = mount(TweetCardLocal, {
      props: { tweet },
    })

    expect(wrapper.text()).toContain('测试作者')
  })

  it('应该渲染 handle', () => {
    const tweet = makeTweet({ handle: 'test_user' })

    const wrapper = mount(TweetCardLocal, {
      props: { tweet },
    })

    expect(wrapper.text()).toContain('@test_user')
  })

  it('应该渲染正文（截断 2 行）', () => {
    const tweet = makeTweet({
      contentText: '这是一段很长的正文内容，用于测试截断逻辑',
    })

    const wrapper = mount(TweetCardLocal, {
      props: { tweet },
    })

    const body = wrapper.find('.tweet-body')
    expect(body.exists()).toBe(true)
    expect(body.text()).toContain('这是一段很长的正文内容')
  })

  it('无封面图时应显示占位区域', () => {
    const tweet = makeTweet({ coverUrl: '' })

    const wrapper = mount(TweetCardLocal, {
      props: { tweet },
    })

    const placeholder = wrapper.find('.cover-placeholder')
    expect(placeholder.exists()).toBe(true)
  })
})
```

### 5.3 测试模式：含 Pinia store 的组件

```typescript
// src/__tests__/display/components/TweetGrid.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import TweetGrid from '@/display/components/TweetGrid.vue'
import { useTweetsStore } from '@/display/stores/tweets'
import { makeTweets } from '@/__tests__/__fixtures__/tweets'

describe('TweetGrid', () => {
  beforeEach(() => {
    // 每个测试创建全新的 Pinia 实例
    setActivePinia(createPinia())
  })

  it('空状态时显示引导文字', () => {
    const wrapper = mount(TweetGrid)

    expect(wrapper.text()).toContain('还没有收藏推文')
  })

  it('有推文时渲染对应数量的卡片', () => {
    const store = useTweetsStore()
    // 直接将数据注入 store（跳过 storage 读写）
    const tweets = makeTweets(3)
    tweets.forEach(t => {
      store.tweets[t.id] = t
    })

    const wrapper = mount(TweetGrid)

    const cards = wrapper.findAllComponents({ name: 'TweetGridCard' })
    expect(cards).toHaveLength(3)
  })
})
```

---

## 6. DOMParser / DOMPurify 在 jsdom 中的配置

`DOMParser` 在 jsdom 中原生可用。`DOMPurify` 在 jsdom 中默认行为与浏览器一致。

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['src/__tests__/setup.ts'],
    include: ['src/__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/shared/**', 'src/display/stores/**'],
    },
  },
})
```

### 6.1 解析器测试模式

```typescript
import { describe, it, expect } from 'vitest'
import { parseBlockquote } from '@/shared/parser/blockquoteParser'
import { CHINESE_TWEET_HTML, NON_BLOCKQUOTE_HTML, XSS_TWEET_HTML, EMPTY_HTML } from '@/__tests__/__fixtures__/blockquotes'

describe('parseBlockquote', () => {
  it('标准中文推文 → 返回结构化数据', () => {
    const result = parseBlockquote(CHINESE_TWEET_HTML)

    expect(result).not.toBeNull()
    expect(result!.tweetId).toBe('2073779604264047025')
    expect(result!.author).toBe('✧ 𝕀𝔸𝕄𝔸𝕀 ✧')
    expect(result!.handle).toBe('iamai_omni')
    expect(result!.lang).toBe('zh')
    expect(result!.contentText).toContain('cornex楚能')
    expect(result!.mediaUrls).toHaveLength(1)
    // blockquoteHtml 不含 script
    expect(result!.blockquoteHtml).not.toContain('<script')
    // contentHtml 经过消毒
    expect(result!.contentHtml).not.toContain('<script')
  })

  it('非 blockquote HTML → 返回 null', () => {
    expect(parseBlockquote(NON_BLOCKQUOTE_HTML)).toBeNull()
  })

  it('空字符串 → 返回 null', () => {
    expect(parseBlockquote(EMPTY_HTML)).toBeNull()
  })

  it('XSS 攻击载荷 → 消毒后不含 onerror', () => {
    const result = parseBlockquote(XSS_TWEET_HTML)
    expect(result).not.toBeNull()
    expect(result!.contentHtml).not.toContain('onerror')
    expect(result!.blockquoteHtml).not.toContain('onerror')
  })
})
```

---

## 7. 导出器测试模式

```typescript
import { describe, it, expect } from 'vitest'
import { exportTweets } from '@/shared/exporter'
import { makeTweets } from '@/__tests__/__fixtures__/tweets'

describe('exportTweets - JSON', () => {
  it('应该导出正确的 JSON 结构', async () => {
    const tweets = makeTweets(2)

    const blob = exportTweets({ format: 'json', tweets })
    const text = await blob.text()
    const parsed = JSON.parse(text)

    expect(parsed.schema).toBe('x-pocket')
    expect(parsed.version).toBe(1)
    expect(parsed.count).toBe(2)
    expect(parsed.tweets).toHaveLength(2)
    expect(parsed.exportedAt).toBeDefined()
  })

  it('空数组导出不报错', async () => {
    const blob = exportTweets({ format: 'json', tweets: [] })
    const parsed = JSON.parse(await blob.text())

    expect(parsed.count).toBe(0)
    expect(parsed.tweets).toHaveLength(0)
  })
})

describe('exportTweets - CSV', () => {
  it('应该以 UTF-8 BOM 开头', async () => {
    const tweets = makeTweets(1)

    const blob = exportTweets({ format: 'csv', tweets })
    const text = await blob.text()

    expect(text.charCodeAt(0)).toBe(0xFEFF) // BOM
  })

  it('应该包含 header 行', async () => {
    const tweets = makeTweets(1)

    const blob = exportTweets({ format: 'csv', tweets })
    const lines = (await blob.text()).split('\r\n')

    expect(lines[0]).toContain('id')
    expect(lines[0]).toContain('tweetId')
    expect(lines[0]).toContain('author')
  })
})

describe('exportTweets - Markdown', () => {
  it('每条推文应为 ## section', async () => {
    const tweets = makeTweets(2)

    const blob = exportTweets({ format: 'markdown', tweets })
    const text = await blob.text()

    const sections = text.match(/## \d+\./g)
    expect(sections).toHaveLength(2)
  })
})
```

---

## 8. 测试命名约定

```typescript
// ✅ 正确：中文描述 + 清晰的 Given-When-Then 隐含结构
it('应该在输入非 blockquote 内容时返回 null', () => { ... })
it('应该对 XSS 攻击载荷进行消毒', () => { ... })
it('应该在相同 tweetId 重复入库时返回 duplicate', () => { ... })

// ❌ 错误：英文 / 含义不明
it('should work', () => { ... })
it('test parse', () => { ... })
it('edge case 1', () => { ... })
```

---

## 9. 常见陷阱

### 9.1 异步 chrome API 忘记 await

```typescript
// ❌ 错误：chrome.storage 返回 Promise，必须 await
it('bug: 忘记 await', () => {
  addTweet(tweet)
  const tweets = getAllTweets() // ← Promise，不是数组
  expect(tweets).toHaveLength(1) // ← 永远失败
})

// ✅ 正确
it('正确: 使用 await', async () => {
  await addTweet(tweet)
  const tweets = await getAllTweets()
  expect(tweets).toHaveLength(1)
})
```

### 9.2 Pinia store 污染

```typescript
// ❌ 错误：多个测试共享同一个 Pinia 实例 → 状态污染
describe('tweetsStore', () => {
  // 缺少 beforeEach reset

  it('test A', () => { ... })
  it('test B', () => { ... }) // ← 可能受 test A 影响
})

// ✅ 正确：每个测试独立 Pinia
describe('tweetsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('test A', () => { ... })
  it('test B', () => { ... })
})
```

### 9.3 DOMParser 在非 jsdom 环境不可用

```typescript
// vitest.config.ts 必须设置
test: {
  environment: 'jsdom',  // ← 必须！否则 DOMParser undefined
}
```

---

## 10. 运行测试命令速查

```bash
pnpm vitest                          # 运行所有测试（watch 模式）
pnpm vitest run                      # 运行所有测试（单次）
pnpm vitest run --coverage           # 含覆盖率报告
pnpm vitest run src/__tests__/shared/parser/   # 仅运行解析器测试
pnpm vitest run -t "XSS"             # 仅运行名称含 "XSS" 的测试
pnpm vitest run --reporter=verbose   # 详细输出
```
