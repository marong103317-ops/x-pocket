// Date parser: converts tweet date text to ISO 8601 string
// Returns empty string on failure — caller should handle default value
export function parseTweetDate(text: string): string {
  const t = text.trim()
  if (!t) return ''

  // English format: "July 5, 2026"
  const d = new Date(t)
  if (!isNaN(d.getTime())) return d.toISOString()

  // Chinese format: "2026年7月5日"
  const cn = t.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/)
  if (cn) return new Date(+cn[1], +cn[2] - 1, +cn[3]).toISOString()

  // Failure: could not parse date
  return ''
}
