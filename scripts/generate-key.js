/**
 * 生成 Chrome Extension 签名密钥对。
 *
 * 输出:
 *   - key.pem      私钥（保密！用于 CRX 签名，上传到 GitHub Secrets）
 *   - key.pub.pem  公钥（可公开，用于验证签名）
 *
 * 用法:
 *   node scripts/generate-key.js
 *
 * 上传私钥到 GitHub:
 *   1. base64 -i key.pem | pbcopy  (macOS)
 *   2. 粘贴到 GitHub → Settings → Secrets → CRX_PRIVATE_KEY
 *
 * 安全提醒:
 *   - 私钥一旦丢失，将无法更新已在 Chrome Web Store 发布的扩展
 *   - 切勿将私钥提交到版本控制系统
 *   - 建议将私钥存储在密码管理器中备份
 */

import { generateKeyPairSync } from 'node:crypto'
import { writeFileSync, chmodSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const PRIVATE_KEY_PATH = resolve(ROOT, 'key.pem')
const PUBLIC_KEY_PATH = resolve(ROOT, 'key.pub.pem')

// 检查是否已存在，避免覆盖
if (existsSync(PRIVATE_KEY_PATH)) {
  console.error('❌ key.pem 已存在！为避免覆盖现有密钥，请手动删除后重试：')
  console.error(`   rm ${PRIVATE_KEY_PATH}`)
  process.exit(1)
}

console.log('🔑 正在生成 RSA-2048 密钥对...')

const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs1',
    format: 'pem',
  },
})

writeFileSync(PRIVATE_KEY_PATH, privateKey, { mode: 0o600 })
chmodSync(PRIVATE_KEY_PATH, 0o600)
writeFileSync(PUBLIC_KEY_PATH, publicKey, { mode: 0o644 })

console.log(`✅ 私钥: ${PRIVATE_KEY_PATH}`)
console.log(`✅ 公钥: ${PUBLIC_KEY_PATH}`)
console.log()
console.log('📋 下一步操作：')
console.log()
console.log(`  1. 将私钥添加到 .gitignore:`)
console.log(`     echo "key.pem" >> .gitignore`)
console.log()
console.log(`  2. 将私钥上传到 GitHub Secrets:`)
console.log(`     cat key.pem | base64 | pbcopy`)
console.log(`     → GitHub Repo → Settings → Secrets and variables → Actions`)
console.log(`     → New repository secret → Name: CRX_PRIVATE_KEY`)
console.log()
console.log(`  3. 公钥文件 (key.pub.pem) 可用于验证签名，无需保密`)
console.log()
console.log('⚠️  安全提醒：')
console.log('   - 私钥一旦丢失无法恢复，请妥善备份')
console.log('   - 切勿将私钥提交到 Git 仓库')
