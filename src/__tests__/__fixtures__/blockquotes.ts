// Blockquote HTML fixtures for parser tests

/** Standard Chinese tweet (from template.html) */
export const CHINESE_TWEET_HTML = `
<blockquote class="twitter-tweet"><p lang="zh" dir="ltr">我打赌全网应该没几个人知道cornex楚能，这家比宁德时代还牛逼的全球最大储能电池工厂，正在以发疯的速度扩建，思格新能也是它们的客户。 <a href="https://t.co/oRDjWucQBx">pic.twitter.com/oRDjWucQBx</a></p>&mdash; ✧ 𝕀𝔸𝕄𝔸𝕀 ✧ (@iamai_omni) <a href="https://x.com/iamai_omni/status/2073779604264047025?ref_src=twsrc%5Etfw">July 5, 2026</a></blockquote> <script async src="https://platform.x.com/widgets.js" charset="utf-8"></script>
`

/** Standard English tweet */
export const ENGLISH_TWEET_HTML = `
<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Excited to announce our latest breakthrough in battery technology. <a href="https://t.co/abc123">pic.twitter.com/abc123</a></p>&mdash; Elon Musk (@elonmusk) <a href="https://x.com/elonmusk/status/1234567890">July 4, 2026</a></blockquote> <script async src="https://platform.x.com/widgets.js" charset="utf-8"></script>
`

/** Non-blockquote HTML (for testing invalid input) */
export const NON_BLOCKQUOTE_HTML = '<div><p>Just a regular paragraph.</p></div>'

/** Blockquote with XSS attack payload */
export const XSS_TWEET_HTML = `
<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Test <img src=x onerror=alert(1)> content</p>&mdash; Hacker (@hacker) <a href="https://x.com/hacker/status/99999">July 1, 2026</a></blockquote>
`

/** Empty string */
export const EMPTY_HTML = ''
