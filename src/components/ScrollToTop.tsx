import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** 路由切换时回到页面顶部（等价于 vue-router 的 scrollBehavior）。 */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
