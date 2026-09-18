import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from '@/pages/Home'

// 首页随主包加载，其余页面按需分包，减少首屏体积
const Commands = lazy(() => import('@/pages/Commands'))
const Scenery = lazy(() => import('@/pages/Scenery'))
const AboutUs = lazy(() => import('@/pages/AboutUs'))
const Tools = lazy(() => import('@/pages/Tools'))
const Developing = lazy(() => import('@/pages/Developing'))

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/commands" element={<Commands />} />
      <Route path="/scenery" element={<Scenery />} />
      <Route path="/aboutus" element={<AboutUs />} />
      <Route path="/tools" element={<Tools />} />
      <Route path="/developing" element={<Developing />} />
    </Routes>
  )
}
