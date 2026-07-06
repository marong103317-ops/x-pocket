<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CollectedTweet } from '@/shared/types/tweet'

const props = defineProps<{
  tweet: CollectedTweet
}>()

const loading = ref(true)
const error = ref('')

// Build a self-contained HTML page that loads widgets.js and renders the blockquote
const widgetJsUrl = computed(() => chrome.runtime.getURL('widgets.js'))

const srcdocContent = computed(() => {
  const bq = props.tweet.blockquoteHtml
  const jsUrl = widgetJsUrl.value
  return '<!DOCTYPE html>\n' +
    '<html>\n' +
    '<head>\n' +
    '<meta charset="utf-8">\n' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">\n' +
    '<style>\n' +
    '  body{margin:0;padding:0;display:flex;justify-content:center;background:#fff;' +
    'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;}\n' +
    '  .tweet-container{max-width:550px;width:100%;}\n' +
    '  .fallback{padding:16px;color:#536471;font-size:14px;text-align:center;}\n' +
    '</style>\n' +
    '</head>\n' +
    '<body>\n' +
    '  <div class="tweet-container">\n' +
    '    ' + bq + '\n' +
    '  </div>\n' +
    '  <script src="' + jsUrl + '"></' + 'script>\n' +
    '  <script>\n' +
    '    var check=setInterval(function(){' +
    'if(window.twttr&&window.twttr.widgets){' +
    'clearInterval(check);window.twttr.widgets.load();' +
    '}},100);\n' +
    '    setTimeout(function(){clearInterval(check);},8000);\n' +
    '  </' + 'script>\n' +
    '</body>\n' +
    '</html>'
})

function onIframeLoad() {
  loading.value = false
}

function onIframeError() {
  loading.value = false
  error.value = 'X 原生渲染不可用'
}
</script>

<template>
  <div class="native-embed">
    <div v-if="loading" class="native-loading">加载中...</div>
    <div v-if="error" class="native-error">{{ error }}</div>
    <iframe
      class="native-iframe"
      :srcdoc="srcdocContent"
      sandbox="allow-scripts allow-same-origin"
      frameborder="0"
      scrolling="no"
      @load="onIframeLoad"
      @error="onIframeError"
    />
  </div>
</template>

<style scoped>
.native-embed {
  position: relative;
  min-height: 200px;
}

.native-loading {
  text-align: center;
  padding: 20px;
  color: #536471;
  font-size: 13px;
}

.native-error {
  padding: 12px;
  background: #fef3c7;
  color: #92400e;
  border-radius: 4px;
  font-size: 13px;
  margin-bottom: 8px;
}

.native-iframe {
  width: 100%;
  border: none;
  min-height: 200px;
}
</style>
