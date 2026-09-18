import { useEffect, useState } from 'react'

// 模块级缓存：同一 URL 全站只请求一次（如 Home / Scenery / AboutUs 共用 data.json）
const cache = new Map()

/**
 * fetch 一个 JSON 数据源，返回解析结果（加载中为 null）。
 */
export function useJson(url) {
  const [data, setData] = useState(() => cache.get(url) ?? null)

  useEffect(() => {
    if (cache.has(url)) return
    let alive = true

    fetch(url)
      .then(res => (res.ok ? res.json() : Promise.reject(res.statusText)))
      .then(json => {
        cache.set(url, json)
        if (alive) setData(json)
      })
      .catch(err => console.error(`Failed to load ${url}:`, err))

    return () => { alive = false }
  }, [url])

  return data
}

/**
 * 把「全量图 + 缩略图」两个数组按序号拼成 [{ full, thumb }]。
 * 缩略图缺失时回退为全量图。原项目在两个 View 里各写了一份，这里抽成工具函数。
 */
export function zipImages(fullList = [], thumbList = []) {
  return fullList.map((full, index) => ({ full, thumb: thumbList?.[index] || full }))
}
