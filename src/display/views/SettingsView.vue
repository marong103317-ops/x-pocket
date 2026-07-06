<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '@/display/stores/settings'
import { useTweetsStore } from '@/display/stores/tweets'
import { exportTweets } from '@/shared/exporter'
import { downloadBlob } from '@/shared/utils/download'
import { importFromJson } from '@/shared/importer/json'
import { getAllTweets, addTweet, deleteTweet } from '@/shared/storage/tweetStore'
import type { CollectedTweet } from '@/shared/types/tweet'
import { SeedDataService } from '@/shared/services/seedDataService'
import { seedAuthors, seedContents } from '@/shared/data/seedData'

const router = useRouter()
const settingsStore = useSettingsStore()
const tweetsStore = useTweetsStore()

const renderMode = ref(settingsStore.settings.renderMode)
const theme = ref(settingsStore.settings.theme)
const sortKey = ref(settingsStore.settings.defaultSort)
const sortDir = ref(settingsStore.settings.defaultSortDir)

const importMsg = ref('')
const importError = ref('')

async function saveSettings() {
  await settingsStore.update({
    renderMode: renderMode.value,
    theme: theme.value,
    defaultSort: sortKey.value,
    defaultSortDir: sortDir.value,
  })
  tweetsStore.sortKey = sortKey.value
  tweetsStore.sortDir = sortDir.value

  // Apply theme
  document.documentElement.setAttribute('data-theme', theme.value)
}

// Apply theme on load
watch(theme, (val) => {
  document.documentElement.setAttribute('data-theme', val)
}, { immediate: true })

function handleExport() {
  const tweets = tweetsStore.filteredTweets
  const blob = exportTweets({ format: 'json', tweets })
  const filename = `x-pocket-export-${new Date().toISOString().slice(0, 10)}.json`
  downloadBlob(blob, filename)
}

async function handleImport(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  importMsg.value = ''
  importError.value = ''

  const result = await importFromJson(file)
  if (result.error) {
    importError.value = result.error
  } else {
    importMsg.value = `成功导入 ${result.imported} 条，跳过 ${result.skipped} 条重复`
    await tweetsStore.load()
  }
  input.value = ''
}

const seedMsg = ref('')
const clearConfirm = ref(false)

async function seedTestData() {
  seedMsg.value = '生成中...'
  const authors = [
    { name: '张三', handle: 'zhangsan' },
    { name: '李四', handle: 'lisi' },
    { name: '王五', handle: 'wangwu' },
    { name: '赵六', handle: 'zhaoliu' },
    { name: '孙七', handle: 'sunqi' },
    { name: '周八', handle: 'zhouba' },
    { name: '吴九', handle: 'wujiu' },
    { name: '郑十', handle: 'zhengshi' },
  ]
  const contents = [
    '今天天气真不错，适合出门散步。春天的气息越来越浓了。',
    '刚看完一部非常好的电影，推荐给大家！剧情紧凑，演员表演到位。',
    '分享一篇关于AI技术发展的文章，非常有启发性。大模型正在改变世界。',
    '周末做饭的快乐，谁能懂？今天尝试了一道新菜，味道还不错。',
    '对于这个产品设计，我有一些想法。用户体验需要更多的关注。',
    '刚刚读完这本书，值得反复阅读。每一章都有新的收获。',
    '今天去了一家新开的咖啡店，环境很好，咖啡也很香。',
    '分享一些学习笔记，希望对大家有帮助。坚持每天进步一点点。',
    '最近在研究前端框架的新特性，vue3的composition API确实好用。',
    '拍了些照片，分享一下。摄影真的是一件让人快乐的事情。',
    '对于这个社会现象，我想说几句。我们应该多一些包容和理解。',
    '刚跑完5公里，感觉整个人都精神了。运动真的能改变生活。',
    '推荐一个效率工具，用了之后生产力提升了很多。非常实用。',
    '今天参加了行业会议，收获很大。和同行交流总能碰撞出新想法。',
    '分享一下最近的代码心得，关于TypeScript类型体操的一些技巧。',
    '听到一首好听的歌，单曲循环了一整天。音乐是最好的陪伴。',
    '对于未来的规划，我有了一些新的想法。路还很长，慢慢来。',
    '推荐一个很不错的设计资源网站，里面的素材质量都很高。',
    '刚做完一个项目复盘，总结了一些经验教训。失败是成功之母。',
    '今天和朋友们聚了聚，聊了很多。好的关系需要用心经营。',
    '分享一些关于创业的思考。创业不是一条容易的路，但充满意义。',
    '看到一则新闻，觉得很有必要和大家讨论一下。你怎么看？',
    '最近在学习一门新技术，感觉打开了新世界的大门。学无止境。',
    '推荐几本我最近在读的书，涵盖了技术、哲学和管理领域。',
    '今天做了个有趣的实验，结果出乎意料。科学探索真有意思。',
    '周末去爬山了，山顶的风景真的很美。多运动对身体好。',
    '分享一款好用的Chrome插件，大幅提升工作效率。强烈推荐。',
    '读了一篇关于区块链未来的文章，有很多启发。技术改变世界。',
    '今天尝试了冥想，感觉内心平静了很多。推荐大家都试试。',
    '刚看完一个TED演讲，讲的是如何克服拖延症。干货满满。',
    '分享一些关于投资理财的心得。不要把鸡蛋放在同一个篮子里。',
    '最近在学习日语，发现语言学习真的需要每天坚持。頑張ります。',
    '今天和同事讨论了一个技术方案，碰撞出了很多新的想法。',
    '推荐一部Netflix的新剧，剧情反转再反转，看得停不下来。',
    '分享一些摄影技巧。光线是摄影的灵魂，构图是骨架。',
    '参加了朋友的婚礼，感动得热泪盈眶。祝福他们幸福美满。',
    '刚完成了一个开源项目的第一版，虽然简单但很有成就感。',
    '今天去了一家很有特色的面馆，排队半小时但值得。',
    '读了一篇关于量子计算的科普文章，虽然很多没看懂但很有趣。',
    '分享一个CSS技巧，几行代码就能实现很炫的动画效果。',
    '最近在培养早起的习惯，坚持了21天感觉整个人都不一样了。',
    '看到一个很棒的UI设计案例，配色和排版都值得学习。',
    '今天跑步突破了个人记录，5公里用时22分钟。继续加油。',
    '分享一些关于远程工作的经验，自律和沟通是最重要的。',
    '推荐几首适合工作时听的纯音乐，无歌词更有助于专注。',
    '最近在研究微服务架构，有很多坑但也有很大的价值。',
    '今天自己做了一顿大餐，虽然卖相一般但味道还不错。',
    '分享一些简历优化的经验，希望能帮助正在找工作的朋友。',
    '周末去逛了博物馆，看到了很多珍贵的历史文物。受益匪浅。',
  ]

  let count = 0
  for (let i = 0; i < 50; i++) {
    const author = authors[i % authors.length]
    const daysAgoPosted = Math.floor(Math.random() * 30)
    const daysAgoCollected = Math.floor(Math.random() * daysAgoPosted + 1)
    const tweet: CollectedTweet = {
      id: generateId(),
      tweetId: `seed-${i}`,
      tweetUrl: `https://x.com/${author.handle}/status/seed${i}`,
      author: author.name,
      handle: author.handle,
      authorUrl: `https://x.com/${author.handle}`,
      contentHtml: `<p>${contents[i]}</p>`,
      contentText: contents[i],
      lang: 'zh',
      postedAt: new Date(Date.now() - daysAgoPosted * 86400000).toISOString(),
      mediaUrls: [],
      coverUrl: '',
      blockquoteHtml: `<blockquote class="twitter-tweet"><p>${contents[i]}</p>&mdash; ${author.name} (@${author.handle}) <a href="https://x.com/${author.handle}/status/seed${i}">${new Date(Date.now() - daysAgoPosted * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</a></blockquote>`,
      tags: [],
      collectedAt: new Date(Date.now() - daysAgoCollected * 86400000).toISOString(),
      source: 'manual',
    }
    const result = await addTweet(tweet)
    if (result.success) count++
  }
  seedMsg.value = `已生成 ${count} 条测试数据`
  await tweetsStore.load()
}

function goBack() {
  router.push('/')
}

async function clearAllTweets() {
  const existing = await getAllTweets()
  for (const t of existing) {
    await deleteTweet(t.id)
  }
  clearConfirm.value = false
  await tweetsStore.load()
  seedMsg.value = '已清空全部推文'
}
</script>

<template>
  <div class="settings-view">
    <header class="settings-header">
      <button class="back-btn" @click="goBack">← 返回</button>
      <h1>设置</h1>
    </header>

    <div class="settings-section">
      <h3>渲染模式</h3>
      <label class="radio-label">
        <input v-model="renderMode" type="radio" value="local" @change="saveSettings" />
        本地渲染（离线可用）
      </label>
      <label class="radio-label">
        <input v-model="renderMode" type="radio" value="native" @change="saveSettings" />
        X 原生渲染（需联网）
      </label>
    </div>

    <div class="settings-section">
      <h3>主题</h3>
      <label class="radio-label">
        <input v-model="theme" type="radio" value="light" @change="saveSettings" />
        浅色
      </label>
      <label class="radio-label">
        <input v-model="theme" type="radio" value="dark" @change="saveSettings" />
        深色
      </label>
      <label class="radio-label">
        <input v-model="theme" type="radio" value="system" @change="saveSettings" />
        跟随系统
      </label>
    </div>

    <div class="settings-section">
      <h3>默认排序</h3>
      <select v-model="sortKey" class="select-input" @change="saveSettings">
        <option value="collectedAt">收藏时间</option>
        <option value="postedAt">发布时间</option>
      </select>
      <select v-model="sortDir" class="select-input" @change="saveSettings">
        <option value="desc">降序</option>
        <option value="asc">升序</option>
      </select>
    </div>

    <div class="settings-section">
      <h3>数据管理</h3>
      <button class="action-btn" @click="handleExport">导出全部 JSON</button>
      <p class="section-desc">导出全部 {{ tweetsStore.tweetCount }} 条推文</p>

      <div class="import-area">
        <label class="action-btn import-label">
          导入数据
          <input type="file" accept=".json" class="file-input" @change="handleImport" />
        </label>
        <p v-if="importMsg" class="import-success">{{ importMsg }}</p>
        <p v-if="importError" class="import-error">{{ importError }}</p>
      </div>

      <button class="seed-btn" :disabled="seedMsg === '生成中...'" @click="seedTestData">
        🧪 生成测试数据（50条）
      </button>
      <p v-if="seedMsg" class="seed-msg">{{ seedMsg }}</p>

      <div class="danger-zone">
        <button v-if="!clearConfirm" class="clear-btn" @click="clearConfirm = true">
          🗑 清空全部推文
        </button>
        <div v-else class="clear-confirm">
          <span class="clear-warn">确定清空全部 {{ tweetsStore.tweetCount }} 条推文？不可恢复。</span>
          <button class="clear-yes" @click="clearAllTweets">确认清空</button>
          <button class="clear-no" @click="clearConfirm = false">取消</button>
        </div>
      </div>
    </div>
    <div class="settings-section sponsor-section">
      <h3>☕ 赞助</h3>
      <p class="sponsor-desc">如果 X-Pocket 对你有帮助，欢迎请我喝杯咖啡</p>
      <div class="sponsor-codes">
        <div class="sponsor-item">
          <img src="/sponsor/alipay.jpg" alt="支付宝" class="sponsor-img" />
          <span>支付宝</span>
        </div>
        <div class="sponsor-item">
          <img src="/sponsor/wechat.jpg" alt="微信支付" class="sponsor-img" />
          <span>微信支付</span>
        </div>
      </div>
      <p class="sponsor-tip">感谢支持 ❤️</p>
    </div>
  </div>
</template>

<style scoped>
.settings-view { max-width: 600px; margin: 0 auto; padding: 24px 16px; }
.settings-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.settings-header h1 { font-size: 18px; margin: 0; }
.back-btn { background: none; border: none; font-size: 16px; color: var(--color-primary); cursor: pointer; padding: 4px 0; }
.settings-section { margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid var(--color-border); }
.settings-section h3 { font-size: 14px; font-weight: 600; margin-bottom: 8px; }
.radio-label { display: block; padding: 6px 0; font-size: 13px; color: var(--color-text-secondary); cursor: pointer; }
.radio-label input { margin-right: 8px; }
.select-input { padding: 6px 12px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 13px; background: var(--color-bg); color: var(--color-text); margin-right: 8px; }
.action-btn { padding: 8px 16px; background: var(--color-primary); color: #ffffff; border: none; border-radius: var(--radius-full); font-size: 13px; font-weight: 600; cursor: pointer; display: inline-block; }
.import-label { position: relative; cursor: pointer; margin-top: 8px; }
.file-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.import-area { margin-top: 12px; }
.section-desc { margin-top: 8px; font-size: 12px; color: var(--color-text-tertiary); }
.import-success { margin-top: 8px; font-size: 13px; color: var(--color-success); }
.import-error { margin-top: 8px; font-size: 13px; color: var(--color-danger); }
.seed-btn { margin-top: 12px; padding: 8px 16px; background: none; border: 1px dashed var(--color-border); border-radius: var(--radius-full); font-size: 13px; color: var(--color-text-secondary); cursor: pointer; }
.seed-btn:hover:not(:disabled) { background: var(--color-bg-secondary); }
.seed-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.seed-msg { margin-top: 6px; font-size: 12px; color: var(--color-success); }
.danger-zone { margin-top: 16px; padding-top: 16px; border-top: 1px solid #fde8e8; }
.clear-btn { padding: 8px 16px; background: none; border: 1px solid var(--color-danger); border-radius: var(--radius-full); font-size: 13px; color: var(--color-danger); cursor: pointer; }
.clear-btn:hover { background: #fde8e8; }
.clear-confirm { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.clear-warn { font-size: 13px; color: var(--color-danger); font-weight: 500; }
.clear-yes { padding: 4px 12px; background: var(--color-danger); border: none; border-radius: var(--radius-full); font-size: 12px; color: #fff; cursor: pointer; }
.clear-no { padding: 4px 12px; background: var(--color-bg); border: 1px solid var(--color-border); border-radius: var(--radius-full); font-size: 12px; cursor: pointer; }
.sponsor-section { border-bottom: none; text-align: center; }
.sponsor-desc { font-size: 14px; color: var(--color-text); margin-bottom: 16px; }
.sponsor-codes { display: flex; justify-content: center; gap: 24px; margin-bottom: 12px; }
.sponsor-item { display: flex; flex-direction: column; align-items: center; gap: 6px; font-size: 12px; color: var(--color-text-secondary); }
.sponsor-img { width: 160px; height: 176px; border-radius: 8px; }
.sponsor-tip { font-size: 11px; color: var(--color-text-tertiary); margin-top: 8px; }
</style>
