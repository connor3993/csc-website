import { useEffect, useState } from 'react'
import { SITE } from '@/config/site'

/**
 * 轮询 mcstatus.io 获取服务器在线状态。
 * - 查询成功：60s 后刷新
 * - 查询失败/离线：指数退避（2s 起步、封顶 60s），
 *   修复原版「离线时每 2s 无限重试」持续打接口的问题
 * - 组件卸载时中止请求、清理定时器
 */
export function useServerStatus() {
  const [status, setStatus] = useState({
    online: 0,
    max: 20,
    version: SITE.fallbackVersion,
  })

  useEffect(() => {
    const controller = new AbortController()
    let timer
    let failures = 0

    const poll = async () => {
      try {
        const res = await fetch(
          `https://api.mcstatus.io/v2/status/bedrock/${SITE.ip}:${SITE.statusPort}`,
          { signal: controller.signal },
        )
        const json = await res.json()
        if (!json.online) throw new Error('server offline')

        failures = 0
        setStatus({
          online: json.players.online,
          max: json.players.max,
          version: json.version.name,
        })
        timer = setTimeout(poll, 60_000)
      } catch (err) {
        if (controller.signal.aborted) return
        failures += 1
        setStatus(s => ({ ...s, online: 0, max: 30 }))
        timer = setTimeout(poll, Math.min(2000 * 2 ** failures, 60_000))
      }
    }

    poll()
    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [])

  return status
}
