import { createContext, useContext } from 'react'

/**
 * 导航栏「浅色文字模式」的跨组件通信：
 * 首页滚动到深色区块时通知 NavBar 切换配色，替代原版直接操作 .navbar DOM 的做法。
 */
const NavLightContext = createContext({ light: false, setLight: () => {} })

export const NavLightProvider = NavLightContext.Provider

export const useNavLight = () => useContext(NavLightContext)
