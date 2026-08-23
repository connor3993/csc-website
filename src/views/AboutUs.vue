<template>
  <div class="about-us-container">
    <div class="about-us-content">
      <h2 class="section-title">CSC Team</h2>
      <div class="cards-wrapper">
        
        <!-- 成员 1: 腐竹 -->
        <div class="team-card">
          <div class="card-content">
            <h2>TheChips2557</h2>
            <span class="role-badge">腐竹/Owner</span>
            <p class="description">负责服务器的整体运营与维护，把控发展方向。</p>
          </div>
        </div>

        <!-- 成员 2: 管理员 留作后续添加主要成员-->
        <!-- <div class="team-card">
          <div class="card-content">
            <h2>Admin One</h2>
            <span class="role-badge">管理员/Admin</span>
            <p class="description">协助管理服务器日常事务，处理玩家反馈。</p>
          </div>
        </div> -->

      </div>

      <!-- 玩家风采板块 -->
      <section class="photo-section player-section">
        <h2 class="section-title">CSC Player / 玩家风采</h2>
        <div class="photo-grid">
          <div 
            v-for="(item, index) in playerImages" 
            :key="'player-'+index" 
            class="photo-item"
            @click="openPreview(item.full)"
          >
            <div class="photo-frame">
              <img :src="item.thumb" loading="lazy" alt="Player selfie" />
            </div>
          </div>
        </div>
      </section>

      <!-- 集体合影板块 -->
      <section class="photo-section group-section">
        <h2 class="section-title">CSC Memories / 集体合影</h2>
        <div class="photo-grid">
          <div 
            v-for="(item, index) in groupImages" 
            :key="'group-'+index" 
            class="photo-item wide"
            @click="openPreview(item.full)"
          >
            <div class="photo-frame">
              <img :src="item.thumb" loading="lazy" alt="Group memory" />
            </div>
          </div>
        </div>
      </section>

    </div>

    <ImagePreview 
      :show="!!selectedImage" 
      :src="selectedImage" 
      @close="closePreview" 
    />
    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppFooter from '@/components/AppFooter.vue'
import ImagePreview from '@/components/ImagePreview.vue'
import { useImagePreview } from '@/utils/imagePreview'

// 图片预览逻辑
const { selectedImage, openPreview, closePreview } = useImagePreview()

// 1. 加载玩家自拍 (public/imgs/player) 和集体合影
const playerImages = ref([])
const groupImages = ref([])

const zipImages = (fullList = [], thumbList = []) =>
  fullList.map((full, index) => ({
    full,
    thumb: thumbList[index] || full
  }))

onMounted(() => {
  fetch('/imgs/data.json')
    .then(res => res.json())
    .then(data => {
      if (data) {
        if (data.player) {
          playerImages.value = zipImages(data.player, data.player_thumb)
        }
        if (data.groupPhoto) {
          groupImages.value = zipImages(data.groupPhoto, data.groupPhoto_thumb)
        }
      }
    })
    .catch(err => console.error('Failed to load images:', err))
})

</script>

<style scoped src="@/assets/styles/views/AboutUs.css"></style>


