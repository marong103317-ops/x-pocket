// HTML export: generates a standalone HTML page with tweets
import type { CollectedTweet } from '@/shared/types/tweet'

export function exportHtml(
  tweets: CollectedTweet[],
  includeScript: boolean
): Blob {
  const cards = tweets.map((t) => t.blockquoteHtml).join('\n')
  const script = includeScript
    ? '<script async src="https://platform.x.com/widgets.js" charset="utf-8"></script>'
    : ''

  const html = `<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Pocket for X 导出 (${tweets.length} 条)</title>
  <style>
    body{font-family:system-ui,sans-serif;max-width:680px;margin:0 auto;padding:16px;background:#fff;color:#0f1419}
    h1{font-size:1.25rem;border-bottom:1px solid #cfd9de;padding-bottom:8px}
    .tweets{display:flex;flex-direction:column;gap:16px;margin-top:16px}
    blockquote.twitter-tweet{margin:0}
  </style>
</head>
<body>
  <h1>Pocket for X 收藏导出（${tweets.length} 条）</h1>
  <div class="tweets">${cards}</div>
  ${script}
</body>
</html>`

  return new Blob([html], { type: 'text/html;charset=utf-8' })
}
