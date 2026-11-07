import { useEffect } from 'react'

/**
 * 把一张图片提前塞进浏览器缓存。
 *
 * 动机：「便捷功能」页（Tools）的背景图 map.webp 只在 Tools.css 里被引用，
 * 而 Tools 是懒加载路由 —— 请求链是「JS chunk → CSS chunk → 才开始下图片」，
 * 三次串行往返，所以进页之后背景要等半天才出来。
 * 在首页挂一个 <link rel="preload"> 把这张图预热掉，点进 Tools 时直接命中缓存。
 *
 * fetchpriority 显式设为 low：它是「下一页要用的资源」，不该跟首页首屏大图抢带宽；
 * 但比 rel="prefetch"（要等浏览器空闲才下）更早开始，命中率更高。
 */
export function usePreloadImage(src?: string) {
  useEffect(() => {
    if (!src) return

    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = src
    link.type = 'image/webp'
    link.setAttribute('fetchpriority', 'low')
    document.head.appendChild(link)

    return () => {
      document.head.removeChild(link)
    }
  }, [src])
}
