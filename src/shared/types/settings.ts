/** User settings */
export interface Settings {
  renderMode: 'local' | 'native'
  theme: 'light' | 'dark' | 'system'
  defaultSort: 'collectedAt' | 'postedAt'
  defaultSortDir: 'asc' | 'desc'
  tagFilterMode: 'and' | 'or'
  displayMode: 'grid' | 'list'
}
