/** Message types for runtime communication */
export type RuntimeMessage =
  | { type: 'FIND_TWEET_URL' }
  | { type: 'DOM_FALLBACK'; tweetUrl: string }
  | { type: 'GET_TWEET_COUNT' }
  | { type: 'OPEN_DISPLAY' }
  | { type: 'NOTIFY'; message: string }
  | { type: 'COLLECT_TWEET_BY_URL'; tweetUrl: string }
  | { type: 'UNCOLLECT_TWEET'; tweetUrl: string }

/** Response types */
export interface MessageResponse<T = void> {
  success: boolean
  data?: T
  error?: string
}
