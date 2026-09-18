import { useEffect, useState } from 'react'

/**
 * 大图预览状态：selectedImage 非 null 时打开预览层并锁定背景滚动。
 * effect 里同时处理「打开锁定 / 关闭恢复 / 组件卸载时恢复」，
 * 修复原版「预览开着切走页面导致 body 永久锁死」的问题。
 */
export function useImagePreview() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    document.body.style.overflow = selectedImage ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [selectedImage])

  return {
    selectedImage,
    openPreview: (img: string) => setSelectedImage(img),
    closePreview: () => setSelectedImage(null),
  }
}
