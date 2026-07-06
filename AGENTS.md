# X-Pocket — AGENTS.md

> ⚠️ **编码前必读（按顺序）**：
> 1. [`TDD_WORKFLOW.md`](./TDD_WORKFLOW.md) — 目标驱动开发工作流，使用 `/goal` 命令逐目标执行
> 2. [`CONVENTIONS.md`](./CONVENTIONS.md) — 编码约定（Vue/TS/CSS/安全/错误处理）
> 3. [`TEST_PATTERNS.md`](./TEST_PATTERNS.md) — 测试模式与 Mock 指南

## Project Purpose

X-Pocket is a Chrome Manifest V3 browser extension for collecting, browsing, searching, and exporting X.com (Twitter) tweet embed codes. All data is stored locally in `chrome.storage.local` — no cloud sync, no telemetry.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Vue 3.5+ (Composition API, `<script setup>`) |
| Language | TypeScript 5.6+, strict mode, no `any` |
| State | Pinia 2.2+ |
| Routing | vue-router 4.4+ (display page only) |
| Build | Vite 7 + `@crxjs/vite-plugin` 2.4 (MV3 HMR) |
| Sanitization | DOMPurify 3 (all user-pasted/v-html content) |
| Utilities | `@vueuse/core` 11 |
| Package manager | pnpm |

## Features

| Phase | Features |
|-------|----------|
| ✅ Phase 1 | Paste collection, grid/list display, search, delete, JSON export |
| ✅ Phase 2 | Right-click collection, native rendering (local widgets.js), sort, HTML/MD/CSV/Obsidian export, settings |
| ✅ Phase 3 | Tags, batch select/delete/export, import, dark theme, ❤️ like-to-collect, scroll-based pagination |

### Native Rendering

widgets.js and its 7 chunks are bundled in `public/widgets.js` + `public/js/`. The `i.p` path in widgets.js is patched from CDN to `/` so all resources load from the extension root (CSP-safe). Run `pnpm fetch-widgets` to update from CDN (requires proxy on port 7890).

## Commands

```bash
pnpm dev              # Dev server with CRXJS HMR
pnpm build            # Type-check (vue-tsc --noEmit) + production build
pnpm test             # Run all 112 unit/integration tests
pnpm test -- --watch  # Watch mode
pnpm fetch-widgets    # Download latest widgets.js + chunks from CDN (needs proxy)
```

After `pnpm dev`, load the `dist/` directory as an unpacked extension at `chrome://extensions` (Developer mode ON).

## Directory Structure (Planned)

```
src/
├── background/          # Service Worker (MV3, no DOM, event-driven)
│   ├── index.ts         # Entry: contextMenus, oembed, inbox, messaging
│   ├── contextMenus.ts  # Right-click menu registration (Phase 2)
│   ├── oembed.ts        # publish.twitter.com/oembed fetcher (Phase 2)
│   └── messaging.ts     # Message routing
├── content/             # Content script injected into x.com (Phase 2)
│   ├── index.ts
│   └── tweetFinder.ts   # Records tweet URL on contextmenu event
├── popup/               # Extension popup (360×500px, lives when focused)
│   ├── index.html / main.ts / App.vue
│   └── components/
│       ├── PasteCollector.vue   # Paste blockquote → parse → save
│       ├── RecentList.vue       # Last 5 tweets
│       └── OpenDisplay.vue      # "Open display page" button
├── display/             # Full-page extension view (opened via chrome.tabs.create)
│   ├── index.html / main.ts / App.vue / router.ts
│   ├── stores/{tweets,tags,selection,settings}.ts
│   ├── components/      # Cards, lists, search, export dialog, etc.
│   └── utils/widgetsLoader.ts
└── shared/              # Shared across all contexts (popup/display/background/content)
    ├── types/{tweet,tag,settings,storage,messages}.ts
    ├── storage/{keys,tweetStore,tagStore,settingsStore,inbox,migrate}.ts
    ├── parser/{blockquoteParser,urlParser,dateParser}.ts
    ├── exporter/{index,json,html,markdown,csv}.ts
    └── utils/{id,sanitize,download,date}.ts
```

## chrome.storage.local Key Schema

| Key | Value | Notes |
|-----|-------|-------|
| `xpc:meta` | `{ version, createdAt, count }` | Schema version for migrations |
| `xpc:tweets` | `Record<id, CollectedTweet>` | Single key, full read/write (OK for < 5000 tweets) |
| `xpc:tags` | `Record<id, Tag>` | Tag definitions |
| `xpc:settings` | `Settings` | User preferences |
| `xpc:inbox` | `InboxItem[]` | Queue: raw blockquote HTML from background → parsed by popup/display |

**Key patterns**: Read-once at startup → Pinia store in memory → write-back full replacement. Dedup by `tweetId` (business unique key).

## Critical Architecture Rules

### 1. Service Worker Has No DOM
`DOMParser` is NOT available in the background service worker. The SW must NOT parse blockquote HTML. Instead:
- Raw blockquote HTML goes into `xpc:inbox` (queue)
- Parsing happens in popup or display page (which have full DOM)
- All parse logic lives in `shared/parser/` and is reused across contexts

### 2. SW Lifecycle
MV3 service worker terminates after 30s idle. Do NOT store state in memory variables in `src/background/`. Always persist to `chrome.storage` before any async boundary.

### 3. CSP for Native Rendering
To load `https://platform.x.com/widgets.js` for native tweet rendering, the manifest CSP must whitelist it:
```json
"content_security_policy": {
  "extension_pages": "script-src 'self' https://platform.x.com https://platform.twitter.com; object-src 'self'"
}
```
Default render mode is `local` (no remote script). Native rendering is an optional enhancement with automatic fallback.

### 4. XSS Prevention
- ALL user-pasted HTML must go through `DOMPurify.sanitize()` before storage or rendering
- `v-html` content MUST be sanitized first
- No `innerHTML` assignment without sanitization
- No `eval`, no `new Function`

### 5. Export Uses Blob + `<a download>`
Exports use `URL.createObjectURL` + programmatic `<a>` click — no `downloads` permission needed for display page.

### 6. No External Requests Beyond Declared Hosts
The extension only contacts:
- `https://publish.twitter.com/oembed` (fetch embed codes)
- `https://platform.x.com` / `https://platform.twitter.com` (widgets.js)
- `https://x.com/*` / `https://twitter.com/*` (content script scope)

All host permissions are declared in the manifest.

## Coding Conventions

- **Components**: PascalCase (`TweetCard.vue`), files use kebab-case in imports
- **Functions**: camelCase
- **Types**: PascalCase, all in `shared/types/`
- **CSS**: Shared variables in `:root` (see `preview.html` for reference), scoped styles in components
- **Naming**: Chrome storage keys prefixed `xpc:` to avoid collisions
- **Error messages**: Chinese (目标用户中文)

## Documentation References

**Coding guides (read before writing any code)**:

| File | Purpose |
|------|---------|
| [`TDD_WORKFLOW.md`](./TDD_WORKFLOW.md) | Goal-driven development workflow, BDD scenarios, `/goal` command usage |
| [`CONVENTIONS.md`](./CONVENTIONS.md) | Vue SFC template, TS rules, error handling, CSS, naming, security |
| [`TEST_PATTERNS.md`](./TEST_PATTERNS.md) | Mock implementations (chrome.*), fixtures, component test patterns |

**Design documents** (`.trae/documents/`):

| Area | Document |
|------|----------|
| Product requirements & user stories | `01-prd.md` |
| Architecture & data flow | `02-system-architecture.md` |
| Tech stack & dependency rationale | `03-tech-stack.md` |
| Detailed design (types, parser, CRUD, components) | `04-detailed-design.md` |
| Test plan & acceptance criteria | `05-test-plan.md` |
| Roadmap & milestones | `06-roadmap.md` |
| Risk management | `07-risk-management.md` |
| UI/UX spec & CSS variables | `08-ui-ux-spec.md` |
| Overall implementation plan | `x-pocket-chrome-extension-plan.md` |

## Known Gotchas

- **10MB storage quota**: Default `chrome.storage.local` limit (~3000 tweets). Monitor `getBytesInUse`, warn at 8MB.
- **x.com is a SPA**: Content script injects once at `document_start`. Use document-level `contextmenu` event delegation and `article[data-testid="tweet"]` selectors.
- **Right-click URL retrieval**: Three-tier fallback — `info.linkUrl` → `info.pageUrl` → content script `lastTweetUrl`.
- **Like-button collection**: Uses capture-phase click listener on `[data-testid="like"]`/`[data-testid="unlike"]` + `article[data-testid="tweet"]` container.
- **Unlike removal**: Detects `[data-testid="unlike"]` clicks → sends `UNCOLLECT_TWEET` message → background deletes by `tweetUrl` match.
- **Content script injection**: Static manifest `content_scripts` (primary) + dynamic `registerContentScripts` (fallback). Guard `__x_pocket_injected` prevents double execution.
- **Twitter→X domain**: URL normalization converts `twitter.com` → `x.com` and strips query params.
- **Uninstall clears all data**: By design — `chrome.storage.local` is wiped on removal.
