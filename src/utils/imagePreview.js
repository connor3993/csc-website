import { ref } from 'vue'

export function useImagePreview() {
  const selectedImage = ref(null)

  const openPreview = (img) => {
    if (!img) return
    selectedImage.value = img
    document.body.style.overflow = 'hidden' // 禁止背景滚动
  }

  const closePreview = () => {
    selectedImage.value = null
    document.body.style.overflow = '' // 恢复滚动
  }

  return {
    selectedImage,
    openPreview,
    closePreview
  }
}
