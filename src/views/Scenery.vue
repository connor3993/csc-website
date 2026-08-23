<script setup>
import { computed, ref, onMounted } from 'vue'
import { useImagePreview } from '@/utils/imagePreview'
import ImagePreview from '@/components/ImagePreview.vue'
import AppFooter from '@/components/AppFooter.vue'

// 动态导入 public 中的建筑图片路径
const allImages = ref([])

const zipImages = (fullList = [], thumbList = []) =>
  fullList.map((full, index) => ({
    full,
    thumb: thumbList[index] || full
  }))

onMounted(() => {
  fetch('/imgs/data.json')
    .then(res => res.json())
    .then(data => {
      if (data && data.building) {
        allImages.value = zipImages(data.building, data.building_thumb)
      }
    })
})

// 使用图片预览工具
const { selectedImage, openPreview, closePreview } = useImagePreview()

// 将图片分组，每组5张，用于布局 (1大 + 4小)
const imageGroups = computed(() => {
  const groups = []
  const chunkSize = 5
  if (!allImages.value) return groups;

  for (let i = 0; i < allImages.value.length; i += chunkSize) {
    // 确保每组至少有5张图以保持布局完美（不足的使用占位或切片）
    // 这里简单处理：如果不足5张，也展示，CSS Grid会自动处理空位
    groups.push(allImages.value.slice(i, i + chunkSize))
  }
  return groups
})

// 图片加载失败处理：尝试重新加载，通过添加随机查询参数绕过缓存或重试
const handleImageError = (event) => {
  const img = event.target
  let retries = parseInt(img.getAttribute('data-retries') || '0')
  
  if (retries >= 3) {
    console.error(`Image failed to load after 3 retries: ${img.src}`)
    return // 停止重试
  }
  
  retries++
  img.setAttribute('data-retries', retries)
  
  // 指数退避算法：重试越多次等待时间越长，防止彻底卡死浏览器
  const delay = Math.min(1000 * Math.pow(2, retries - 1), 10000)
  
  console.log(`Image failed to load: ${img.src}. Retrying in ${delay}ms... (Attempt ${retries})`)

  setTimeout(() => {
    const currentSrc = img.src.split('?')[0]
    // 直接更新 src 触发重新加载，不需要 removeAttribute
    img.src = `${currentSrc}?retry=${Date.now()}`
  }, delay)
}
</script>

<template>
  <div class="scenery-page">
    <header class="page-header">
      <h1>CSC 建筑风景</h1>
      <p>方块堆叠的艺术，记录世界的每一处精彩</p>
    </header>

    <div class="gallery-container">
      <div 
        v-for="(group, gIndex) in imageGroups" 
        :key="gIndex" 
        class="gallery-group"
        :class="{ 'reverse': gIndex % 2 !== 0 }"
      >
        <!-- 主图 (大图) -->
        <div class="photo-card main-card" v-if="group[0]" @click="openPreview(group[0].full)">
          <div class="img-wrapper">
            <img
              :src="group[0].full"
              :srcset="`${group[0].thumb} 800w, ${group[0].full} 1920w`"
              sizes="(max-width: 768px) 90vw, 55vw"
              loading="lazy"
              alt="Building showcase main"
              @error="handleImageError"
            />
          </div>
        </div>

        <!-- 副图 (4张网格) -->
        <div class="sub-grid">
          <div 
            class="photo-card sub-card" 
            v-for="(item, sIndex) in group.slice(1, 5)" 
            :key="sIndex"
            @click="openPreview(item.full)"
          >
            <div class="img-wrapper">
              <img :src="item.thumb" loading="lazy" alt="Building showcase sub" @error="handleImageError" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 使用抽离出的预览组件 -->
    <ImagePreview 
      :show="!!selectedImage" 
      :src="selectedImage" 
      @close="closePreview" 
    />
    <AppFooter />
  </div>
</template>

<style scoped src="@/assets/styles/views/Scenery.css"></style>


