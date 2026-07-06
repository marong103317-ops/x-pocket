// Unified export entry point
import type { CollectedTweet } from '@/shared/types/tweet'
import { exportJson } from './json'
import { exportHtml } from './html'
import { exportMarkdown } from './markdown'
import { exportCsv } from './csv'
import { exportObsidian } from './obsidian'

export interface ExportOptions {
  format: 'json' | 'html' | 'markdown' | 'csv' | 'obsidian'
  tweets: CollectedTweet[]
  includeNativeScript?: boolean
}

export function exportTweets(opts: ExportOptions): Blob {
  switch (opts.format) {
    case 'json':
      return exportJson(opts.tweets)
    case 'html':
      return exportHtml(opts.tweets, opts.includeNativeScript ?? true)
    case 'markdown':
      return exportMarkdown(opts.tweets)
    case 'csv':
      return exportCsv(opts.tweets)
    case 'obsidian':
      return exportObsidian(opts.tweets)
    default:
      return exportJson(opts.tweets)
  }
}
