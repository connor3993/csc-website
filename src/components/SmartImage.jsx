import { useEffect, useRef, useState } from 'react'

/**
 * 带失败重试的图片组件：加载失败按指数退避自动重试（改写 URL 绕过缓存）。
 * 替代原项目写在 Scenery 页里的 DOM 操作式错误处理，全站复用。
 */
export default function SmartImage({ src, alt = '', maxRetries = 3, ...rest }) {
  const [attempt, setAttempt] = useState(0)
  const timer = useRef()

  // 卸载时清理待执行的重试
  useEffect(() => () => clearTimeout(timer.current), [])
  // 换图时重置重试计数
  useEffect(() => setAttempt(0), [src])

  const handleError = () => {
    if (attempt >= maxRetries) return
    timer.current = setTimeout(
      () => setAttempt(n => n + 1),
      Math.min(1000 * 2 ** attempt, 10_000),
    )
  }

  const url = attempt ? `${src}${src.includes('?') ? '&' : '?'}retry=${attempt}` : src
  return <img src={url} alt={alt} onError={handleError} decoding="async" {...rest} />
}
