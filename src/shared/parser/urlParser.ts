// URL normalization: converts twitter.com → x.com, strips query params
export function normalizeTweetUrl(raw: string): string {
  // Handle relative paths
  if (raw.startsWith('/')) {
    return `https://x.com${raw.match(/^(\/[^/]+\/status\/\d+)/)?.[1] ?? raw}`
  }

  // Only parse as URL if it looks like one
  if (!raw.startsWith('http://') && !raw.startsWith('https://')) {
    return raw
  }

  try {
    const u = new URL(raw)
    // twitter.com → x.com
    const host = u.hostname.replace('twitter.com', 'x.com')
    // Keep /handle/status/id, remove query params
    const m = u.pathname.match(/^(\/[^/]+\/status\/\d+)/)
    return m ? `https://${host}${m[1]}` : u.toString()
  } catch {
    return raw
  }
}
