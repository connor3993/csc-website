import { Suspense, useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from '@/router'
import { ScrollToTop } from '@/components/ScrollToTop'
import NavBar from '@/components/NavBar'
import { NavLightProvider } from '@/context/NavLight'
import { SITE } from '@/config/site'
import '@/assets/app.css'

export default function App() {
  // 首页滚动到深色区块时，导航栏需要切换浅色文字（由 Home 内的滚动逻辑驱动）
  const [navLight, setNavLight] = useState(false)

  return (
    <BrowserRouter>
      <NavLightProvider value={{ light: navLight, setLight: setNavLight }}>
        <ScrollToTop />
        <div className="app-container">
          <NavBar serverName={SITE.name} />
          <Suspense fallback={null}>
            <AppRoutes />
          </Suspense>
        </div>
      </NavLightProvider>
    </BrowserRouter>
  )
}
