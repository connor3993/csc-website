import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useNavLight } from '@/context/NavLight'
import './NavBar.css'

type NavBarProps = {
  serverName: string
}

type NavClassArgs = {
  isActive: boolean
}

// NavLink 激活态映射为 .active（与 NavBar.css 中的样式对应）
const navClass = ({ isActive }: NavClassArgs) => (isActive ? 'active' : undefined)

export default function NavBar({ serverName }: NavBarProps) {
  const { light } = useNavLight()
  const location = useLocation()

  // 移动端菜单状态
  const [menuOpen, setMenuOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)

  // 路由变化时自动关闭菜单
  useEffect(() => {
    setMenuOpen(false)
    setToolsOpen(false)
  }, [location.pathname])

  const closeMenu = () => {
    setMenuOpen(false)
    setToolsOpen(false)
  }

  const toggleMenu = () => {
    // 关闭主菜单时把子菜单也折叠
    if (menuOpen) setToolsOpen(false)
    setMenuOpen(open => !open)
  }

  const navClassNames = `navbar${menuOpen ? ' nav-mobile-open' : ''}${light ? ' nav-light-text' : ''}`

  return (
    <nav className={navClassNames}>
      <div className="logo">
        <Link to="/" className="logo-text" onClick={closeMenu}>
          {serverName}
        </Link>
      </div>

      {/* 移动端菜单开关 */}
      <button className="mobile-toggle" onClick={toggleMenu} aria-label="Toggle Menu">
        {menuOpen ? (
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="12" x2="20" y2="12"></line>
            <line x1="4" y1="6" x2="20" y2="6"></line>
            <line x1="4" y1="18" x2="20" y2="18"></line>
          </svg>
        )}
      </button>

      {menuOpen && <div className="mobile-backdrop" onClick={closeMenu}></div>}

      <div className={`nav-links-wrapper${menuOpen ? ' is-open' : ''}`}>
        <div className="nav-links">
          <NavLink to="/" end className={navClass} onClick={closeMenu}>首页</NavLink>
          <NavLink to="/scenery" className={navClass} onClick={closeMenu}>服内风景</NavLink>
          <NavLink to="/commands" className={navClass} onClick={closeMenu}>命令列表</NavLink>

          {/* 便捷功能下拉菜单 */}
          <div className={`dropdown${toolsOpen ? ' mobile-dropdown-open' : ''}`}>
            <div className="dropdown-trigger-container">
              <NavLink to="/tools" className={({ isActive }) => `dropdown-trigger${isActive ? ' active' : ''}`} onClick={closeMenu}>
                便捷功能
              </NavLink>
              <button className="mobile-arrow-btn" onClick={e => { e.preventDefault(); e.stopPropagation(); setToolsOpen(o => !o) }}>
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>

            <div className="dropdown-menu">
              <a href="https://frp-shy.com:49886/" target="_blank" rel="noopener noreferrer" onClick={closeMenu}>卫星地图</a>
              <NavLink to="/developing" className={navClass} onClick={closeMenu}>语音聊天</NavLink>
            </div>
          </div>

          <NavLink to="/aboutus" className={navClass} onClick={closeMenu}>CSC Team</NavLink>
        </div>
      </div>
    </nav>
  )
}
