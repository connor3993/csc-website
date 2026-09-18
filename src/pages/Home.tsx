import { Fragment, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import OnlinePlayer from '@/components/OnlinePlayer'
import IpBox from '@/components/IpBox'
import Footer from '@/components/Footer'
import SmartImage from '@/components/SmartImage'
import { ImageData, SiteData, useJson } from '@/hooks/useJson'
import { useServerStatus } from '@/hooks/useServerStatus'
import { useNavLight } from '@/context/NavLight'
import { SITE } from '@/config/site'
import imgSurvival from '@/assets/imgs/3.webp'
import imgCommunity from '@/assets/imgs/talk.webp'
import imgBuilding from '@/assets/imgs/building.webp'
import imgTech from '@/assets/imgs/survival_thumb.webp'
import moreIcon from '@/assets/icons/more.png'
import './Home.css'

// 功能特色卡片：数据驱动渲染（原版是 4 段手写重复 HTML）
const FEATURES = [
  { number: '01', title: '原版生存', desc: '回归初心，体验最纯粹的冒险与挑战。', image: imgSurvival },
  { number: '02', title: '友好社区', desc: '结识志同道合的伙伴，共同创造回忆。', image: imgCommunity },
  { number: '03', title: '建筑养老', desc: '在方块世界中寻找宁静，搭建心中的理想乡。', image: imgBuilding },
  { number: '04', title: '生电科技', desc: '探索红石的奥秘，用自动化改变世界。', image: imgTech },
]

export default function Home() {
  // 跑马灯图片（取前 10 张，tiny/thumb/full 三档）
  const data = useJson<SiteData>('/imgs/data.json')
  const marqueeImages = data?.building?.slice(0, 10).map((full, i) => ({
    full,
    thumb: data.building_thumb?.[i] || full,
    tiny: data.building_tiny?.[i] || full,
  })) ?? []

  const { online, max, version } = useServerStatus()
  const { setLight } = useNavLight()

  const heroRef = useRef<HTMLElement | null>(null)
  const introRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        // 视差背景：直接写样式，不触发 React 重渲染（原版每个滚动事件都会重渲染整页）
        if (heroRef.current) {
          heroRef.current.style.backgroundPositionY = `${window.scrollY * 0.5}px`
        }
        // intro 区块顶进导航栏区域时（rect.top <= 80）且未滚出（rect.bottom >= 20），
        // 导航栏切换浅色文字
        const rect = introRef.current?.getBoundingClientRect()
        setLight(!!rect && rect.top <= 80 && rect.bottom >= 20)
      })
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [setLight])

  // 复制一份列表实现无缝滚动
  const marqueeRows = [0, 1]

  return (
    <div className="home-container">
      {/* Hero Section: 视差背景 + 关键信息 */}
      <section className="hero-section" ref={heroRef}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="brand-text">
            CSC MUSEUM
            <br />
            <span className="version-tag">支持基岩版{version}以上</span>
          </div>
          <div className="hero-text-group">
            <h1 className="main-title">
              沉浸式生存 <br />
              <span className="outline-text">构建你的世界</span>
            </h1>
            <p className="subtitle">建筑养老 | 生电科技 | 友好社区</p>
          </div>

          <div className="status-bar">
            <OnlinePlayer online={online} max={max} />
            <IpBox ip={SITE.ip} port={SITE.port} />
          </div>
        </div>
      </section>

      {/* 高级感文本过渡区 */}
      <section className="intro-section" ref={introRef}>
        <div className="intro-container">
          <h2>
            在这里，每一块方块都承载着<span className="highlight">创意</span>与<span className="highlight">梦想</span>。
            <br />
            <span className="fade-text">不仅仅是一个服务器，更是一个艺术馆。</span>
          </h2>
        </div>
      </section>

      {/* 横向自动滑动建筑展示 (跑马灯) */}
      <section className="gallery-wrapper">
        <div className="gallery-title">
          <Link to="/scenery" style={{ textDecoration: 'none' }}>
            <h3>
              建筑鉴赏
              <img src={moreIcon} alt="查看更多" className="more-icon" />
            </h3>
          </Link>
          <p>BUILDING SHOWCASE</p>
        </div>
        <div className="marquee-container">
          <div className="marquee-track">
            {marqueeRows.map(row => (
              <Fragment key={row}>
                {marqueeImages.map((img, index) => (
                  <div className="marquee-item" key={`${row}-${index}`}>
                    <SmartImage
                      src={img.tiny}
                      srcSet={`${img.tiny} 400w, ${img.thumb} 800w`}
                      sizes="200px"
                      loading="lazy"
                      alt="Building showcase"
                    />
                  </div>
                ))}
              </Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* 功能特色网格 */}
      <section className="feature-grid">
        {FEATURES.map(({ number, title, desc, image }) => (
          <div className="feature-card" key={number}>
            <div className="card-bg" style={{ backgroundImage: `url(${image})` }}></div>
            <div className="card-content">
              <span className="card-number">{number}</span>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* 加入我们 */}
      <section className="join-section">
        <div className="join-container">
          <h2>加入我们</h2>
          <p>
            探索更多精彩，即刻加入官方社区
            <br />
            支持基岩版{version}以上
          </p>
          <div className="join-card">
            <div className="qq-info">
              <span className="label">官方QQ群</span>
              <span className="number">{SITE.qqGroup}</span>
            </div>
            <a href={SITE.qqJoinUrl} target="_blank" rel="noopener noreferrer" className="join-btn">
              立即加入
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
