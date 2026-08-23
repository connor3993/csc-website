<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import OnlinePlayer from '@/components/OnlinePlayer.vue'
import IpBox from '@/components/IpBox.vue'
import AppFooter from '@/components/AppFooter.vue'

// 动态导入建筑图片 (修改为从 public 读取)
const buildingImages = ref([])

onMounted(() => {
  fetch('/imgs/data.json')
    .then(res => res.json())
    .then(data => {
      if (data && data.building_thumb) {
        buildingImages.value = data.building_thumb.slice(0, 10)
      }
    })
})



// 服务器信息
const serverName = "CSC Museum"
const serverIp = "csc2022.top" 
const serverPort = "进群查看->674166080" 
const onlinePlayers = ref(0)
const maxPlayers = ref(20)
const serverVersion = ref("1.21.132")
const isCopied = ref(false)
let timer = null

const fetchServerStatus = () => {
  if (timer) clearTimeout(timer) // 防止重复

  fetch(`https://api.mcstatus.io/v2/status/bedrock/${serverIp}:49886`)
    .then(res => res.json())
    .then(json => {
      if (json.online) {
        onlinePlayers.value = json.players.online
        maxPlayers.value = json.players.max
        serverVersion.value = json.version.name
        // 成功获取：60秒后再次刷新
        timer = setTimeout(fetchServerStatus, 60000)
      } else {
        // 获取成功但在线状态为 false：可能是误报，2秒后重试
        onlinePlayers.value = 0
        maxPlayers.value = 30
        timer = setTimeout(fetchServerStatus, 2000)
      }
    })
    .catch(() => {
      // 请求失败（网络错误等）：2秒后重试
      onlinePlayers.value = 0
      maxPlayers.value = 30
      timer = setTimeout(fetchServerStatus, 2000)
    })
}

// 简单的视差滚动逻辑 (可选，配合CSS)
const scrollY = ref(0)
const introRef = ref(null)

const handleScroll = () => {
  scrollY.value = window.scrollY

  // 动态修改导航栏文字颜色
  // 当滚动到深色的 intro-section 时，为了能看清文字，给导航栏加一个 'nav-light-text' 类
  const nav = document.querySelector('.navbar')
  if (nav && introRef.value) {
    const rect = introRef.value.getBoundingClientRect()
    // 假设导航栏高度约 80px，当 intro-section 进入导航栏区域时变色
    // rect.top <= 80: 区块已经顶到导航栏下面了
    // rect.bottom >= 20: 区块还没完全滚出去
    if (rect.top <= 80 && rect.bottom >= 20) {
      nav.classList.add('nav-light-text')
    } else {
      nav.classList.remove('nav-light-text')
    }
  }
}

onMounted(() => {
  fetchServerStatus()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  if (timer) clearTimeout(timer) // 清除 setTimeout
  window.removeEventListener('scroll', handleScroll)
  // 离开页面时记得清理样式，防止影响其他页面
  const nav = document.querySelector('.navbar')
  if (nav) nav.classList.remove('nav-light-text')
})
</script>

<template>
  <div class="home-container">
    <!-- Hero Section: 视差背景 + 关键信息 -->
    <section class="hero-section" :style="{ backgroundPositionY: `${scrollY * 0.5}px` }">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="brand-text">
          CSC MUSEUM
          <br>
          <span class="version-tag">支持基岩版{{ serverVersion }}以上</span>
        </div>
        <div class="hero-text-group">
          <h1 class="main-title">
            沉浸式生存 <br>
            <span class="outline-text">构建你的世界</span>
          </h1>
          <p class="subtitle">建筑养老 | 生电科技 | 友好社区</p>
        </div>
        
        <div class="status-bar">
          <OnlinePlayer :online-players="onlinePlayers" :max-players="maxPlayers" />
          <IpBox :ip="serverIp" :port="serverPort" />
        </div>
      </div>
    </section>

    <!-- 高级感文本过渡区 -->
    <section class="intro-section" ref="introRef">
      <div class="intro-container">
        <h2>
          在这里，每一块方块都承载着<span class="highlight">创意</span>与<span class="highlight">梦想</span>。
          <br>
          <span class="fade-text">不仅仅是一个服务器，更是一个艺术馆。</span>
        </h2>
      </div>
    </section>

    <!-- 横向自动滑动建筑展示 (跑马灯) -->
    <section class="gallery-wrapper">
      <div class="gallery-title">
        <router-link to="/scenery" style="text-decoration: none;"><h3>建筑鉴赏
          <img src="@/assets/icons/more.png" alt="查看更多" class="more-icon" />
        </h3></router-link>
        
        <p>BUILDING SHOWCASE</p>
      </div>
      <div class="marquee-container">
        <div class="marquee-track">
          <!-- 复制一份实现无缝滚动 -->
          <div class="marquee-item" v-for="(img, index) in buildingImages" :key="`a-${index}`">
            <img :src="img" loading="lazy" alt="Building showcase" />
          </div>
          <div class="marquee-item" v-for="(img, index) in buildingImages" :key="`b-${index}`">
            <img :src="img" loading="lazy" alt="Building showcase" />
          </div>
        </div>
      </div>
    </section>

    <!-- 功能特色网格 (展开写，不使用循环) -->
    <section class="feature-grid">
      <!-- 01 原版生存 -->
      <div class="feature-card feature-survival">
        <div class="card-bg"></div>
        <div class="card-content">
          <span class="card-number">01</span>
          <h3>原版生存</h3>
          <p>回归初心，体验最纯粹的冒险与挑战。</p>
        </div>
      </div>

      <!-- 02 友好社区 -->
      <div class="feature-card feature-community">
        <div class="card-bg"></div>
        <div class="card-content">
          <span class="card-number">02</span>
          <h3>友好社区</h3>
          <p>结识志同道合的伙伴，共同创造回忆。</p>
        </div>
      </div>

      <!-- 03 建筑养老 -->
      <div class="feature-card feature-building">
        <div class="card-bg"></div>
        <div class="card-content">
          <span class="card-number">03</span>
          <h3>建筑养老</h3>
          <p>在方块世界中寻找宁静，搭建心中的理想乡。</p>
        </div>
      </div>

      <!-- 04 生电科技 -->
      <div class="feature-card feature-tech">
        <div class="card-bg"></div>
        <div class="card-content">
          <span class="card-number">04</span>
          <h3>生电科技</h3>
          <p>探索红石的奥秘，用自动化改变世界。</p>
        </div>
      </div>
    </section>

    <!-- 加入我们 -->
    <section class="join-section">
      <div class="join-container">
        <h2>加入我们</h2>
        <p>探索更多精彩，即刻加入官方社区
          <br>支持基岩版{{ serverVersion }}以上</p>
        <div class="join-card">
          <div class="qq-info">
            <span class="label">官方QQ群</span>
            <span class="number">674166080</span> 
          </div>
          <a href="https://qm.qq.com/q/k7TDguPCne" target="_blank" class="join-btn">
            立即加入
          </a>
        </div>
      </div>
    </section>

    <AppFooter />
  </div>
</template>

<style scoped src="@/assets/styles/views/home.css"></style>



