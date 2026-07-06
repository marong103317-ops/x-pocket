// oembed API: fetches blockquote HTML from publish.twitter.com
const OEMBED_URL = 'https://publish.twitter.com/oembed'

export interface OembedResult {
  html: string
  url: string
}

export async function fetchOembed(tweetUrl: string): Promise<OembedResult | null> {
  const url = new URL(OEMBED_URL)
  url.searchParams.set('url', tweetUrl)
  url.searchParams.set('omit_script', 'true')
  url.searchParams.set('lang', 'en')
  url.searchParams.set('dnt', 'true')

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10_000)

    const response = await fetch(url.toString(), {
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!response.ok) {
      console.warn(`[X-Pocket] oembed request failed: ${response.status}`)
      return null
    }

    const data = await response.json() as OembedResult
    return data
  } catch (err) {
    console.warn('[X-Pocket] oembed fetch error:', err)
    return null
  }
}
