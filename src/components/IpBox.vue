<script setup>
import { reactive, ref } from 'vue'
import copyIcon from '@/assets/icons/copy.png'
import checkIcon from '@/assets/icons/check.png'

const props = defineProps({
  ip: {
    type: String,
    required: true
  },
  port: {
    type: String,
    default: '25565'
  }
})

// 使用 reactive 独立跟踪复制状态
const copyStatus = reactive({
  ip: false,
  port: false
})

const copyText = async (text, type) => {
  try {
    // 优先使用标准 API (需要 HTTPS 或 localhost)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      // HTTP 局域网环境降级方案：创建临时输入框复制
      const textArea = document.createElement("textarea");
      textArea.value = text;
      
      // 防止手机端弹出键盘和页面滚动
      textArea.style.position = "fixed"; 
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (!successful) throw new Error('Fallback copy failed');
    }
    
    // 设置对应状态为 true
    copyStatus[type] = true
    
    // 1.5秒后恢复
    setTimeout(() => { 
      copyStatus[type] = false 
    }, 5000) // 缩短提示时间
    
  } catch (err) {
    console.error('Copy failed', err)
    alert('复制失败，请手动复制：\n' + text)
  }
}
</script>

<template>
  <div class="ip-card">
    <div class="ip-row" @click="copyText(ip, 'ip')" title="点击复制 IP">
      <div class="info-group">
        <span class="label">IP</span>
        <span class="value">{{ ip }}</span>
      </div>
      <div class="icon-wrapper" :class="{ success: copyStatus.ip }">
        <img v-if="!copyStatus.ip" :src="copyIcon" alt="Copy" class="icon-img icon-copy" />
        <img v-else :src="checkIcon" alt="Copied" class="icon-img icon-check" />
      </div>
    </div>
    
    <div class="port-row" @click="copyText(port, 'port')" title="点击复制端口">
      <div class="info-group">
        <span class="label">PORT</span>
        <span class="value">{{ port }}</span>
      </div>
      <div class="icon-wrapper" :class="{ success: copyStatus.port }">
        <img v-if="!copyStatus.port" :src="copyIcon" alt="Copy" class="icon-img icon-copy" />
        <img v-else :src="checkIcon" alt="Copied" class="icon-img icon-check" />
      </div>
    </div>
  </div>
</template>

<style scoped src="@/assets/styles/components/IpBox.css"></style>


