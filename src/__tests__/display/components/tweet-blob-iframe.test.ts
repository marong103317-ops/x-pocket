// TDD tests for blob iframe rendering
import { describe, it, expect } from 'vitest'

function buildTweetPage(blockquoteHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{margin:0;padding:16px;display:flex;justify-content:center;background:#fff;
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
  .container{max-width:550px;width:100%}
</style>
</head>
<body>
  <div class="container">${blockquoteHtml}</div>
  <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
</body>
</html>`
}

describe('buildTweetPage', () => {
  it('应该生成包含 blockquote 的完整 HTML', () => {
    const bq = '<blockquote class="twitter-tweet"><p>test</p>&mdash; A (@b) <a href="https://x.com/b/status/1">date</a></blockquote>'
    const html = buildTweetPage(bq)

    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('<blockquote class="twitter-tweet">')
    expect(html).toContain('test')
  })

  it('应该包含 widgets.js CDN 脚本', () => {
    const html = buildTweetPage('<blockquote>t</blockquote>')

    expect(html).toContain('platform.twitter.com/widgets.js')
    expect(html).toContain('async')
  })

  it('应该包含基础样式', () => {
    const html = buildTweetPage('<blockquote>t</blockquote>')

    expect(html).toContain('<style>')
    expect(html).toContain('body')
  })

  it('iframe 页面不应依赖 chrome.* API', () => {
    const html = buildTweetPage('<blockquote>t</blockquote>')

    expect(html).not.toContain('chrome.')
    expect(html).not.toContain('chrome-extension')
  })
})
