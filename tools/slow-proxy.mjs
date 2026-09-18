#!/usr/bin/env node
/**
 * slow-proxy.mjs — 开发期慢网模拟器（仅开发用，不参与构建，不影响网页代码）
 *
 * 原理：
 *   本地起一个反向代理，把请求转发给 Vite dev server（默认 localhost:5173），
 *   响应体在传输时按全局令牌桶做真实的字节级限速 + 可选延迟。
 *   全局共享一个 375KB/s 的桶，多个并发连接（浏览器单域约 6 条）共享总带宽，
 *   因此能真实还原"整条线路只有 3Mbps"的效果。
 *
 * 用法：
 *   1) 先启动开发服务器：npm run dev          （Vite 默认监听 5173）
 *   2) 再启动慢网代理：   node tools/slow-proxy.mjs
 *   3) 浏览器访问：       http://localhost:8080
 *   或者直接用：          npm run dev-slow      （一条命令同时起两个）
 *
 * 环境变量（均可选，默认值模拟 3Mbps 下行 / 3Mbps 上行 / 50ms 延迟）：
 *   SLOW_KBPS        下行限速 KB/s，默认 375（= 3Mbps）
 *   SLOW_UP_KBPS     上行限速 KB/s，默认 375
 *   SLOW_LATENCY_MS  每个响应额外延迟 ms，默认 50
 *   SLOW_PATTERN     只对匹配的 URL 限速（正则），默认 .*（全部限速）
 *                    例如只想限图片：SLOW_PATTERN='\.(png|jpe?g|webp|gif|avif|svg|mp4|webm)$'
 *   PORT             代理监听端口，默认 8080
 *   UPSTREAM         上游地址，默认 http://localhost:5173
 *
 * 说明：
 *   - WebSocket（Vite HMR）直通不限速，热更新不受影响。
 *   - 终端里网速统计图在原位置每秒刷新（ANSI 光标重绘，不追加、不闪屏）。
 *   - 本文件只存在于 tools/，不被打包进 dist/，可随时删除。
 */

import http from 'node:http'
import { Transform } from 'node:stream'

// ---------- 参数 ----------
const args = process.argv.slice(2)
const argOf = (name, def) => {
  const i = args.indexOf(name)
  return i >= 0 && args[i + 1] ? args[i + 1] : def
}
const PORT = Number(argOf('--port', process.env.PORT || 8080))
const UPSTREAM = new URL(argOf('--upstream', process.env.UPSTREAM || 'http://localhost:5173'))

const KBPS_DOWN = Number(process.env.SLOW_KBPS || 375)
const KBPS_UP = Number(process.env.SLOW_UP_KBPS || 375)
const LATENCY_MS = Number(process.env.SLOW_LATENCY_MS || 50)
const PATTERN = new RegExp(process.env.SLOW_PATTERN || '.*', 'i')

// ---------- 终端检测 ----------
const IS_TTY = Boolean(process.stdout.isTTY)

// ---------- 全局令牌桶（所有连接共享总带宽） ----------
class TokenBucket {
  constructor(kbps, burstSeconds = 0.02) {
    this.ratePerMs = (kbps * 1024) / 1000 // bytes per ms
    this.cap = Math.max(1024, this.ratePerMs * burstSeconds * 1000)
    this.tokens = this.cap
    this.last = Date.now()
  }
  /** 返回取走 n 字节需要等待的毫秒数。
   *  注意：等待期间补充的令牌已用于偿还本次欠账，必须把时间基准
   *  this.last 推进到等待结束，否则会被下一个 chunk 重复使用（速度翻倍）。 */
  take(n) {
    const now = Date.now()
    this.tokens = Math.min(this.cap, this.tokens + (now - this.last) * this.ratePerMs)
    if (this.tokens >= n) {
      this.tokens -= n
      this.last = now
      return 0
    }
    const wait = Math.ceil((n - this.tokens) / this.ratePerMs)
    this.tokens = 0
    this.last = now + wait
    return wait
  }
}
const downBucket = new TokenBucket(KBPS_DOWN)
const upBucket = new TokenBucket(KBPS_UP)

// ---------- 限速 Transform：把 chunk 按令牌桶节奏吐出 ----------
class PacedTransform extends Transform {
  constructor(bucket) {
    super()
    this.bucket = bucket
    this.queue = []
    this.cbs = []
    this.flushing = false
    this.endCb = null
    this.bytes = 0
  }
  _transform(chunk, _enc, cb) {
    this.queue.push(chunk)
    this.cbs.push(cb)
    this._pump()
  }
  _flush(cb) {
    // 只有当队列全部吐出后，才允许流结束（否则响应会被提前截断）
    this.endCb = cb
    this._pump()
  }
  _pump() {
    if (this.flushing) return
    if (this.queue.length === 0) {
      if (this.endCb) {
        const cb = this.endCb
        this.endCb = null
        cb()
      }
      return
    }
    this.flushing = true
    const chunk = this.queue.shift()
    const wait = this.bucket.take(chunk.length)
    setTimeout(() => {
      this.bytes += chunk.length
      this.push(chunk)
      const cb = this.cbs.shift()
      if (cb) cb()
      this.flushing = false
      this._pump()
    }, wait)
  }
}

// ---------- 网速统计（全局下行/上行字节） ----------
let downBytes = 0
let upBytes = 0
const samples = [] // 每秒下行速率 bps，保留最近 180 秒
let lastBytes = 0
let lastMark = Date.now()

// ---------- 错误收集（只记真错误，ECONNRESET 视为正常取消不记） ----------
const errors = []
function logError(msg) {
  const t = new Date().toLocaleTimeString('zh-CN', { hour12: false })
  errors.push({ t, msg })
  if (errors.length > 20) errors.shift()
}

// ---------- vite 日志接收（dev-slow.mjs 会把 vite 输出转发到本进程 stdin） ----------
const VITE_ROWS = 3
const viteLogs = [] // 最近 VITE_ROWS 行
const stripAnsi = (s) =>
  s
    .replace(/\x1b\][^\x07]*(?:\x07|\x1b\\)/g, '')
    .replace(/\x1b\[[0-9;]*[A-Za-z]/g, '')
function pushViteLog(raw) {
  const line = stripAnsi(raw).replace(/\r/g, '').trim()
  if (!line) return
  viteLogs.push(line)
  if (viteLogs.length > VITE_ROWS) viteLogs.shift()
  if (!IS_TTY) console.log(`[vite] ${line}`) // 非终端环境直接转发显示
}
if (!process.stdin.isTTY) {
  process.stdin.setEncoding('utf8')
  let buf = ''
  process.stdin.on('data', (d) => {
    buf += d
    let i
    while ((i = buf.indexOf('\n')) >= 0) {
      pushViteLog(buf.slice(0, i))
      buf = buf.slice(i + 1)
    }
  })
  process.stdin.on('end', () => {
    if (buf.trim()) pushViteLog(buf)
  })
}

// ---------- 终端渲染（原地重绘：固定行数，光标上移 + 清行重写，绝不错位） ----------
const CHART_HEIGHT = 8
const CHART_WIDTH = 60
const MINI_BLOCKS = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█']
// 总行数恒定：vite 日志 3 + 统计 1 + 柱状图 8 + 轴 1 + 错误 1 + 提示 1 = 15
const TOTAL_ROWS = VITE_ROWS + 1 + CHART_HEIGHT + 1 + 1 + 1

function currentBps() {
  return samples.length ? samples[samples.length - 1] : 0
}
function peakBps() {
  return samples.length ? Math.max(...samples) : 0
}

const kbps = (b) => (b / 1024).toFixed(1)
const c = (code, s) => (IS_TTY ? `\x1b[${code}m${s}\x1b[0m` : s)

function buildLines() {
  const bars = samples.slice(-CHART_WIDTH)
  const now = currentBps()
  const peak = peakBps()
  const elapsedSec = Math.max(1, (Date.now() - lastMark) / 1000)
  const up = upBytes / 1024 / elapsedSec
  const maxRate = Math.max(KBPS_DOWN * 1024, ...bars, 1)
  const width = Math.min(CHART_WIDTH, Math.max(20, (process.stdout.columns || 80) - 8))
  const hasTraffic = bars.some((b) => b > 256)
  const lines = []

  // vite 日志区（固定 VITE_ROWS 行，不足补空行）
  for (let i = 0; i < VITE_ROWS; i++) {
    lines.push(viteLogs[i] ? c('2', '  ' + viteLogs[i]) : '')
  }

  // 统计行
  lines.push(
    `  限速 ${KBPS_DOWN}KB/s | 当前 ${c('1;33', kbps(now) + ' KB/s')} | 峰值 ${c('36', kbps(peak) + ' KB/s')} | 上行 ${c('32', up.toFixed(1) + ' KB/s')}`,
  )

  // 柱状图：y 轴高度 8 行，x 轴每列 1 秒
  for (let y = CHART_HEIGHT; y >= 1; y--) {
    let label = '     '
    if (y === CHART_HEIGHT) label = `${(maxRate / 1024).toFixed(0)}K `
    else if (y === Math.ceil(CHART_HEIGHT / 2)) label = `${(maxRate / 1024 / 2).toFixed(0)}K `
    let row = ''
    if (!hasTraffic) {
      // 无流量：图表区中央给提示，行数不变
      if (y === 4) row = c('2', `  暂无流量 — 打开 http://localhost:${PORT} 刷新页面观察`)
    } else {
      for (const bps of bars.slice(-width)) {
        const h = Math.round((bps / maxRate) * CHART_HEIGHT)
        row += h >= y ? '█' : ' '
      }
    }
    lines.push(label + row)
  }
  lines.push('     ' + '─'.repeat(width) + `  (最近 ${Math.min(bars.length, width)} 秒, 每列 1 秒)`)

  // 错误行（固定 1 行，无错误为空）
  const e = errors[errors.length - 1]
  lines.push(e ? c('31', `  [${e.t}] ${e.msg}`) : '')

  // 提示行
  lines.push(c('2', '  Ctrl+C 退出'))
  return lines
}

let lastRows = 0
function render() {
  if (IS_TTY) {
    const lines = buildLines()
    if (lastRows > 0) process.stdout.write(`\x1b[${TOTAL_ROWS}A`) // 光标回到图表区顶部
    for (const line of lines) {
      process.stdout.write('\x1b[2K' + line + '\n') // 清整行再写，避免残留
    }
    lastRows = TOTAL_ROWS
  } else {
    // 非 TTY（管道/后台/重定向）：每 10 秒一行轻量摘要，不刷屏
    const bars = samples.slice(-CHART_WIDTH)
    const lastPrint = render.__last || 0
    if (Date.now() - lastPrint >= 10000) {
      render.__last = Date.now()
      const maxRate = Math.max(KBPS_DOWN * 1024, ...bars, 1)
      const mini = bars
        .map((b) => MINI_BLOCKS[Math.min(7, Math.floor((b / maxRate) * 8))])
        .join('')
      console.log(`[网速] 当前 ${kbps(currentBps())}KB/s 峰值 ${kbps(peakBps())}KB/s | 最近${bars.length}s ${mini}`)
    }
  }
}

// 每秒采样 + 刷新图表
setInterval(() => {
  const now = Date.now()
  const dt = now - lastMark
  if (dt > 0) {
    samples.push(((downBytes - lastBytes) * 1000) / dt)
    if (samples.length > 180) samples.shift()
    lastBytes = downBytes
    lastMark = now
    render()
  }
}, 1000)

// ---------- 代理核心 ----------
const server = http.createServer((req, res) => {
  const slow = PATTERN.test(req.url)

  const upstreamReq = http.request(
    {
      hostname: UPSTREAM.hostname,
      port: UPSTREAM.port,
      path: req.url,
      method: req.method,
      headers: { ...req.headers, host: UPSTREAM.host },
    },
    (upRes) => {
      // 上游响应流：客户端中途取消/连接被重置时这里会收到 ECONNRESET，吞掉即可
      upRes.on('error', () => {})
      res.writeHead(upRes.statusCode, upRes.headers)
      const send = () => {
        if (slow) {
          const pacer = new PacedTransform(downBucket)
          pacer.on('data', (ch) => (downBytes += ch.length))
          pacer.on('error', () => {}) // 写入已断开的 res 时可能报错，吞掉
          upRes.pipe(pacer).pipe(res)
        } else {
          upRes.on('data', (ch) => (downBytes += ch.length))
          upRes.pipe(res)
        }
      }
      slow && LATENCY_MS > 0 ? setTimeout(send, LATENCY_MS) : send()
    },
  )
  upstreamReq.on('error', (err) => {
    if (err.code !== 'ECONNRESET') logError(`upstream: ${err.message}`)
    if (!res.headersSent && !res.destroyed) {
      res.writeHead(502, { 'content-type': 'text/plain; charset=utf-8' })
      res.end('upstream unavailable')
    }
  })

  // 上行也走限速（请求体通常很小，象征性处理）
  const upPacer = new PacedTransform(upBucket)
  upPacer.on('data', (ch) => (upBytes += ch.length))
  upPacer.on('error', () => {})
  req.pipe(upPacer).pipe(upstreamReq)

  // 客户端断开（刷新/取消）时清理整条链路，防止残留流继续写已关闭的响应
  res.on('close', () => {
    if (!res.writableFinished) {
      upstreamReq.destroy()
      req.destroy()
    }
  })
})

// ---------- WebSocket（Vite HMR）直通 ----------
server.on('upgrade', (req, socket, head) => {
  const up = http.request({
    hostname: UPSTREAM.hostname,
    port: UPSTREAM.port,
    path: req.url,
    method: 'GET',
    headers: { ...req.headers, host: UPSTREAM.host, connection: 'Upgrade', upgrade: 'websocket' },
  })
  up.on('upgrade', (upRes, upSocket, upHead) => {
    socket.write(
      'HTTP/1.1 101 Switching Protocols\r\n' +
        'Connection: Upgrade\r\n' +
        'Upgrade: websocket\r\n' +
        'Sec-WebSocket-Accept: ' + upRes.headers['sec-websocket-accept'] + '\r\n\r\n',
    )
    socket.write(upHead)
    upSocket.pipe(socket)
    socket.pipe(upSocket)
    // 任一端断开（刷新页面关闭 HMR）都要静默处理，不让进程崩溃
    socket.on('error', () => {})
    upSocket.on('error', () => {})
    socket.on('close', () => upSocket.destroy())
    upSocket.on('close', () => socket.destroy())
  })
  up.on('error', (err) => {
    if (err.code !== 'ECONNRESET') logError(`ws upstream: ${err.message}`)
    socket.destroy()
  })
  up.end()
})

// 兜底：任何未捕获异常都记录到图表而不是崩溃退出
process.on('uncaughtException', (err) => {
  logError(`uncaught: ${err.message}`)
})

server.listen(PORT, () => {
  console.log(`慢网代理已启动: http://localhost:${PORT}  (上游 ${UPSTREAM.href})`)
  console.log(`限速: 下行 ${KBPS_DOWN}KB/s (≈${(KBPS_DOWN / 128).toFixed(1)}Mbps) 上行 ${KBPS_UP}KB/s 延迟 ${LATENCY_MS}ms 范围 ${PATTERN}`)
  if (IS_TTY) {
    console.log('vite 日志 + 网速统计图将实时刷新，Ctrl+C 退出\n')
    process.stdout.write('\x1b[?25l') // 隐藏光标，避免图表区闪烁
  } else {
    console.log('非终端环境：网速摘要每 10 秒一行，Ctrl+C 退出\n')
  }
})

// 退出时恢复光标并正常结束
const restoreCursor = () => {
  if (IS_TTY) process.stdout.write('\x1b[?25h')
}
process.on('exit', restoreCursor)
process.on('SIGINT', () => process.exit(130))
process.on('SIGTERM', () => process.exit(143))
