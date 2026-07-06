/**
 * CRX3 打包脚本
 *
 * 将 dist/ 目录打包为符合 Chrome Extension CRX3 规范的 .crx 文件。
 * 使用 RSA-SHA256 签名，私钥通过环境变量 CRX_PRIVATE_KEY (PEM base64) 传入。
 *
 * 用法:
 *   CRX_PRIVATE_KEY=$(base64 key.pem) node scripts/pack-crx.js
 *
 * 格式参考: https://developer.chrome.com/docs/extensions/how-to/distribute/pack-extensions
 */

import { execSync } from 'node:child_process'
import crypto from 'node:crypto'
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const { createHash, createSign, createPublicKey } = crypto

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const DIST = resolve(ROOT, 'dist')
const ZIP_PATH = resolve(ROOT, 'extension.zip')
const PACKAGE_JSON = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf-8'))
const VERSION = PACKAGE_JSON.version
const CRX_OUTPUT = resolve(ROOT, `x-pocket-v${VERSION}.crx`)

// ═══════════════════════════════════════════════════════
// 工具函数
// ═══════════════════════════════════════════════════════

/**
 * 编码 Protobuf 变长整数 (varint)。
 * 用于 protobuf 的 length-delimited 字段。
 */
function encodeVarint(value) {
  const bytes = []
  while (value > 0x7f) {
    bytes.push((value & 0x7f) | 0x80)
    value >>>= 7
  }
  bytes.push(value & 0x7f)
  return Buffer.from(bytes)
}

/**
 * 编码 Protobuf length-delimited 字段 (tag + length + data)。
 * @param {number} fieldNumber
 * @param {Buffer} data
 * @returns {Buffer}
 */
function encodeBytesField(fieldNumber, data) {
  const tag = Buffer.from([(fieldNumber << 3) | 2])
  const length = encodeVarint(data.length)
  return Buffer.concat([tag, length, data])
}

/**
 * 编码 Protobuf 嵌套消息字段。
 * @param {number} fieldNumber
 * @param {Buffer} messageBytes
 * @returns {Buffer}
 */
function encodeMessageField(fieldNumber, messageBytes) {
  const tag = Buffer.from([(fieldNumber << 3) | 2])
  const length = encodeVarint(messageBytes.length)
  return Buffer.concat([tag, length, messageBytes])
}

/**
 * 编码 AsymmetricKeyProof 消息。
 * field 1: public_key (bytes)
 * field 2: signature (bytes)
 */
function encodeKeyProof(publicKey, signature) {
  const field1 = encodeBytesField(1, publicKey)
  const field2 = encodeBytesField(2, signature)
  return Buffer.concat([field1, field2])
}

/**
 * 编码 CrxFileHeader 消息。
 * field 2: sha256_with_rsa (repeated AsymmetricKeyProof)
 */
function encodeCrxFileHeader(keyProof) {
  return encodeMessageField(2, keyProof)
}

// ═══════════════════════════════════════════════════════
// 主流程
// ═══════════════════════════════════════════════════════

function main() {
  console.log('[pack-crx] 开始 CRX3 打包...')
  console.log(`[pack-crx] 版本: ${VERSION}`)
  console.log(`[pack-crx] 源目录: ${DIST}`)

  // 1. 校验 dist 目录
  const manifestPath = resolve(DIST, 'manifest.json')
  if (!existsSync(manifestPath)) {
    console.error('[pack-crx] ❌ dist/manifest.json 不存在，请先执行 pnpm build')
    process.exit(1)
  }

  // 2. 获取私钥
  const privateKeyB64 = process.env.CRX_PRIVATE_KEY
  if (!privateKeyB64) {
    console.warn('[pack-crx] ⚠️  未设置 CRX_PRIVATE_KEY 环境变量，将仅生成 .zip 文件')
    createZip()
    console.log(`[pack-crx] ✅ 已生成: ${ZIP_PATH}`)
    console.log('[pack-crx] 💡 提示: 设置 CRX_PRIVATE_KEY 环境变量以生成 .crx 文件')
    console.log('[pack-crx] 💡 使用 scripts/generate-key.js 生成密钥对')
    return
  }

  const privateKeyPem = Buffer.from(privateKeyB64, 'base64').toString('utf-8')

  // 3. 创建 zip
  createZip()

  // 4. 读取 zip 并计算 SHA256
  const zipData = readFileSync(ZIP_PATH)
  const zipHash = createHash('sha256').update(zipData).digest()
  console.log(`[pack-crx] ZIP SHA256: ${zipHash.toString('hex')}`)

  // 5. 使用 RSA-SHA256 签名 zip hash
  const sign = createSign('RSA-SHA256')
  sign.update(zipHash)
  const signature = sign.sign(privateKeyPem)

  // 6. 提取公钥 (DER 格式)
  const publicKeyDer = createPublicKey({ key: privateKeyPem, format: 'pem', type: 'pkcs1' })
    .export({ format: 'der', type: 'spki' })

  console.log(`[pack-crx] 签名长度: ${signature.length} bytes`)
  console.log(`[pack-crx] 公钥长度: ${publicKeyDer.length} bytes`)

  // 7. 编码 Protobuf CrxFileHeader
  const keyProof = encodeKeyProof(publicKeyDer, signature)
  const headerProto = encodeCrxFileHeader(keyProof)
  console.log(`[pack-crx] Protobuf header 长度: ${headerProto.length} bytes`)

  // 8. 写入 CRX3 文件
  // 格式: "Cr24" (4) + version:3 (4) + header_length (4) + header + zip
  const magic = Buffer.from('Cr24', 'ascii')
  const version = Buffer.alloc(4)
  version.writeUInt32LE(3, 0)
  const headerLen = Buffer.alloc(4)
  headerLen.writeUInt32LE(headerProto.length, 0)

  const crxData = Buffer.concat([magic, version, headerLen, headerProto, zipData])
  writeFileSync(CRX_OUTPUT, crxData)

  console.log(`[pack-crx] ✅ 已生成: ${CRX_OUTPUT}`)
  console.log(`[pack-crx] 文件大小: ${(crxData.length / 1024).toFixed(1)} KB`)

  // 9. 清理临时 zip
  unlinkSync(ZIP_PATH)
}

function createZip() {
  // 使用系统 zip 命令（ubuntu/macOS 均可用）
  try {
    execSync(`cd "${DIST}" && zip -r "${ZIP_PATH}" . -x "*.DS_Store"`, {
      stdio: 'pipe',
      encoding: 'utf-8',
    })
    console.log(`[pack-crx] ZIP 大小: ${(readFileSync(ZIP_PATH).length / 1024).toFixed(1)} KB`)
  } catch (err) {
    console.error('[pack-crx] ❌ 创建 zip 失败:', err.message)
    process.exit(1)
  }
}

main()
