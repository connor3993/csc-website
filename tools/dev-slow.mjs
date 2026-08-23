#!/usr/bin/env node
/**
 * dev-slow.mjs — 一条命令同时启动 Vite 开发服务器 + 慢网代理
 *
 * 为什么 vite 的输出要走管道转发给代理：
 *   如果 vite 直接打印到终端，它的日志（VITE ready、端口信息、HMR 消息等）
 *   会插进代理的图表刷新循环，把光标往下推，导致"上移重绘"错位、图表叠加。
 *   所以这里把 vite 的 stdout/stderr 接到管道，转发给代理的 stdin，
 *   由代理统一渲染"vite 日志区 + 网速图表"，行数固定，绝不错位。
 *
 * 用法：npm run dev-slow
 * 退出：Ctrl+C 同时关闭两个进程。
 */

import { spawn } from 'node:child_process'

const isWin = process.platform === 'win32'

// vite：输出走管道（stdout/stderr → proxy.stdin）
const vite = spawn(isWin ? 'npm.cmd' : 'npm', ['run', 'dev'], {
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: isWin,
})

// 慢网代理：继承终端（渲染图表），stdin 接收 vite 日志
const proxy = spawn(process.execPath, ['tools/slow-proxy.mjs'], {
  stdio: ['pipe', 'inherit', 'inherit'],
})

vite.stdout.on('data', (d) => proxy.stdin.write(d))
vite.stderr.on('data', (d) => proxy.stdin.write(d))

let closing = false
function closeAll(code = 0) {
  if (closing) return
  closing = true
  vite.kill('SIGTERM')
  proxy.kill('SIGTERM')
  setTimeout(() => process.exit(code), 500)
}

vite.on('exit', (code) => closeAll(code ?? 0))
proxy.on('exit', (code) => closeAll(code ?? 0))

process.on('SIGINT', () => closeAll(130))
process.on('SIGTERM', () => closeAll(143))
