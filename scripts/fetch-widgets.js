#!/usr/bin/env node
/**
 * Fetch the latest widgets.js from Twitter/X CDN.
 * Run: node scripts/fetch-widgets.js
 * 
 * Downloads the script to public/widgets.js and records the ETag
 * for future version comparison.
 */
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const WIDGETS_PATH = resolve(__dirname, '..', 'public', 'widgets.js')
const ETAG_PATH = resolve(__dirname, '..', 'public', 'widgets.etag')
const CDN_URLS = [
  'https://platform.twitter.com/widgets.js',
  'https://platform.x.com/widgets.js',
]

async function fetchWidgets() {
  let lastError = null

  for (const url of CDN_URLS) {
    try {
      console.log(`Trying ${url} ...`)
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
        signal: AbortSignal.timeout(15_000),
      })

      if (!res.ok) {
        console.log(`  HTTP ${res.status}, trying next...`)
        continue
      }

      const text = await res.text()
      const etag = res.headers.get('etag') || res.headers.get('last-modified') || ''

      writeFileSync(WIDGETS_PATH, text)
      if (etag) writeFileSync(ETAG_PATH, etag)
      console.log(`  ✓ Downloaded ${text.length.toLocaleString()} bytes`)
      console.log(`  ✓ ETag: ${etag || '(none)'}`)
      return
    } catch (e) {
      lastError = e
      console.log(`  ✗ ${(e as Error).message}`)
    }
  }

  console.error('\nUnable to download widgets.js from any CDN.')
  console.error('Please manually download from https://platform.x.com/widgets.js')
  console.error(`and save to: ${WIDGETS_PATH}`)
  process.exit(1)
}

// Check current version
if (existsSync(ETAG_PATH)) {
  const currentEtag = readFileSync(ETAG_PATH, 'utf-8').trim()
  console.log(`Current local version ETag: ${currentEtag}`)
}

fetchWidgets()
