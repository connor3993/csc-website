/**
 * 复制文本到剪贴板。
 * 优先使用标准 Clipboard API（需要 HTTPS 或 localhost）；
 * HTTP 局域网环境降级为隐藏 textarea + execCommand。
 */
export async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textArea = document.createElement('textarea')
  Object.assign(textArea.style, { position: 'fixed', left: '-9999px', top: '0' })
  textArea.value = text

  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()

  const ok = document.execCommand('copy')
  textArea.remove()

  if (!ok) throw new Error('Fallback copy failed')
}
