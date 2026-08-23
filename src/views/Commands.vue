<template>
  <div class="commands-page">
    <div class="commands-container">
      <div class="page-header">
        <h1 class="page-title">指令列表</h1>
        <p class="page-subtitle">查看所有可以使用的指令</p>
      </div>

      <div class="command-table-container">
        <!-- 表头 -->
        <template v-for="(category, cIndex) in categories" :key="cIndex">
          <!-- 分类标题行 -->
          <div class="table-row category-row">
             <div class="td category-cell" colspan="2">{{ category.title }}</div>
          </div>
          
          <!-- 指令行 -->
          <div v-for="(cmd, index) in category.commands" :key="index" class="table-row">
            <div class="td col-cmd">
              <span class="cmd-pill">{{ cmd.main }}</span>
              <span v-if="cmd.sub && cmd.sub !== '无'" class="cmd-sub-text"> {{ cmd.sub }}</span>
            </div>
            <div class="td col-desc">
              {{ cmd.desc }}
            </div>
          </div>
        </template>

      </div>
    </div>
    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import AppFooter from '@/components/AppFooter.vue'

const categories = ref([]);

// 从 public/commandPage/commands.json 加载指令数据
onMounted(async () => {
  try {
    const response = await fetch('/commandPage/commands.json');
    if (response.ok) {
      categories.value = await response.json();
    } else {
      console.error('Failed to load commands:', response.statusText);
    }
  } catch (error) {
    console.error('Error loading commands:', error);
  }
});
</script>

<style scoped src="@/assets/styles/views/Commands.css"></style>


