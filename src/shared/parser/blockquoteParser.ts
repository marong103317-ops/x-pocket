// Blockquote parser: extracts structured tweet data from oembed blockquote HTML
import DOMPurify from 'dompurify'
import { normalizeTweetUrl } from './urlParser'
import { parseTweetDate } from './dateParser'
import type { ParsedTweet } from '@/shared/types/tweet'

export function parseBlockquote(html: string): ParsedTweet | null {
  if (!html || !html.trim()) return null

  // 1. Parse HTML
  const doc = new DOMParser().parseFromString(html, 'text/html')

  // 2. Locate blockquote
  const bq = doc.querySelector('blockquote.twitter-tweet')
  if (!bq) return null

  // 3. Extract <p> content
  const p = bq.querySelector('p')
  const contentHtml = p?.innerHTML ?? ''
  const contentText = p?.textContent?.trim() ?? ''
  const lang = p?.getAttribute('lang') ?? ''

  // 4. Extract all links
  const links = Array.from(bq.querySelectorAll('a'))

  // 5. Tweet link (contains /status/<number>)
  const tweetLink = links.find(
    a => /\/status\/\d+/.test(a.getAttribute('href') ?? '')
  )
  const tweetUrl = normalizeTweetUrl(tweetLink?.getAttribute('href') ?? '')
  const tweetId = tweetUrl.match(/\/status\/(\d+)/)?.[1] ?? ''
  const handle = tweetUrl.match(/(?:x|twitter)\.com\/([^/]+)\/status/)?.[1] ?? ''

  // 6. Author (oembed format: — Author Name (@handle))
  const fullText = bq.textContent ?? ''
  const authorMatch = fullText.match(/—\s+(.+?)\s+\(@([^)]+)\)/)
  const author = authorMatch?.[1]?.trim() ?? ''
  const handleFromText = authorMatch?.[2]?.trim() ?? handle

  // 7. Date (last <a> text)
  const dateText = links[links.length - 1]?.textContent?.trim() ?? ''
  const postedAt = parseTweetDate(dateText) || new Date().toISOString()

  // 8. Media extraction
  const mediaUrls: string[] = []
  const imageUrls: string[] = []
  for (const a of links) {
    const href = a.getAttribute('href') ?? ''
    const text = a.textContent?.trim() ?? ''
    // Extract pic.twitter.com URL from link text
    const picMatch = text.match(/pic\.twitter\.com\/(\w+)/)
    if (picMatch) {
      const picUrl = `https://pic.twitter.com/${picMatch[1]}`
      mediaUrls.push(picUrl)
      imageUrls.push(picUrl)
    } else if (/pic\.twitter\.com/.test(href)) {
      mediaUrls.push(href)
      imageUrls.push(href)
    }
  }
  // pbs.twimg.com direct images (from DOM, when available)
  bq.querySelectorAll('img').forEach(img => {
    const src = img.getAttribute('src') ?? ''
    if (/pbs\.twimg\.com/.test(src)) {
      mediaUrls.push(src)
      imageUrls.push(src)
    }
  })

  // 9. Clean blockquote HTML (remove embedded <script>)
  const bqClone = bq.cloneNode(true) as Element
  bqClone.querySelectorAll('script').forEach(s => s.remove())
  const blockquoteHtml = bqClone.outerHTML

  // 10. Sanitize content HTML
  const sanitizedContentHtml = DOMPurify.sanitize(contentHtml, {
    ALLOWED_TAGS: ['a', 'br'],
  })

  return {
    tweetId,
    tweetUrl,
    author,
    handle: handleFromText,
    authorUrl: `https://x.com/${handleFromText}`,
    contentHtml: sanitizedContentHtml,
    contentText,
    lang,
    postedAt,
    mediaUrls,
    coverUrl: imageUrls[0] ?? '',
    blockquoteHtml,
  }
}
