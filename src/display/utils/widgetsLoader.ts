// widgets.js loader — uses local bundled copy with all chunks
// After i.p="/" patch, everything loads from extension root → CSP-safe

let scriptPromise: Promise<void> | null = null
let twttrReady = false

export function loadWidgetsJs(): Promise<void> {
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise<void>((resolve, reject) => {
    const w = window as unknown as { twttr?: { widgets?: unknown } }
    if (w.twttr?.widgets) {
      twttrReady = true
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = '/widgets.js'
    script.async = true
    script.charset = 'utf-8'

    const timeout = setTimeout(() => {
      script.remove()
      scriptPromise = null
      reject(new Error('widgets.js load timeout'))
    }, 10_000)

    script.onload = () => {
      clearTimeout(timeout)
      twttrReady = true
      resolve()
    }

    script.onerror = () => {
      clearTimeout(timeout)
      script.remove()
      scriptPromise = null
      reject(new Error('Failed to load widgets.js'))
    }

    document.head.appendChild(script)
  })

  return scriptPromise
}

export async function renderTweet(container: HTMLElement): Promise<void> {
  await loadWidgetsJs()
  const twttr = (window as unknown as { twttr?: { widgets?: { load: (el?: HTMLElement) => Promise<void> } } }).twttr
  if (!twttr?.widgets) throw new Error('widgets.js not loaded')
  await twttr.widgets.load(container)
}
