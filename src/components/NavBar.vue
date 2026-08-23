<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import router from '@/router';

defineProps({
  serverName: {
    type: String,
    required: true
  }
})

// 移动端菜单状态控制
const isMobileMenuOpen = ref(false);
const toggleMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
  // 当关闭主菜单时，把所有子菜单也折叠
  if (!isMobileMenuOpen.value) {
    isToolsOpen.value = false;
  }
};
const closeMenu = () => {
  isMobileMenuOpen.value = false;
  isToolsOpen.value = false;
};

// 记录移动端下拉菜单的展开状态
const isToolsOpen = ref(false);
const toggleTools = (e) => {
  
  isToolsOpen.value = !isToolsOpen.value;
};

// 路由改变时自动关闭菜单
const route = useRoute();
watch(() => route.path, () => {
  closeMenu();
});
</script>

<template>
  <nav class="navbar" :class="{ 'nav-mobile-open': isMobileMenuOpen }">
    <div class="logo">
      <router-link to="/" class="logo-text" @click="closeMenu">{{ serverName }}</router-link>
    </div>

    <!-- 移动端菜单开关 -->
    <button class="mobile-toggle" @click="toggleMenu" aria-label="Toggle Menu">
      <svg v-if="!isMobileMenuOpen" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <line x1="4" y1="12" x2="20" y2="12"></line>
        <line x1="4" y1="6" x2="20" y2="6"></line>
        <line x1="4" y1="18" x2="20" y2="18"></line>
      </svg>
      <svg v-else viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>

    <!-- 移动端遮罩层 -->
    <div v-if="isMobileMenuOpen" class="mobile-backdrop" @click="closeMenu"></div>

    <div class="nav-links-wrapper" :class="{ 'is-open': isMobileMenuOpen }">
      <div class="nav-links">
        <router-link to="/" @click="closeMenu">首页</router-link>
        
        <router-link to="/scenery" @click="closeMenu">服内风景</router-link>

        <router-link to="/commands" @click="closeMenu">命令列表</router-link>
        
        <!-- 便捷功能下拉菜单 -->
        <div class="dropdown" :class="{ 'mobile-dropdown-open': isToolsOpen }">
          <div class="dropdown-trigger-container">
            <router-link to="/tools" class="dropdown-trigger" @click="closeMenu">
              便捷功能
            </router-link>
            <button class="mobile-arrow-btn" @click.stop.prevent="toggleTools">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" :style="{ transform: isToolsOpen ? 'rotate(90deg)' : 'rotate(0deg)' }">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
          
            <div class="dropdown-menu" v-show="isToolsOpen">
              <a href="https://frp-shy.com:49886/" target="_blank" rel="noopener noreferrer" @click="closeMenu">卫星地图</a>
              <router-link to="/developing" @click="closeMenu">语音聊天</router-link>
            </div>
        </div>

        <router-link to="/aboutus" @click="closeMenu">CSC Team</router-link>
      </div>
    </div>
  </nav>
</template>

<style scoped src="@/assets/styles/components/NavBar.css"></style>








