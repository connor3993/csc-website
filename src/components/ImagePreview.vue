<script setup>
defineProps({
  show: Boolean,
  src: String
})

const emit = defineEmits(['close'])

const closePreview = () => {
  emit('close')
}
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="preview-overlay" @click="closePreview">
      <button class="close-btn" @click="closePreview">
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <div class="preview-content">
        <img :src="src" alt="Full size preview" @click.stop />
      </div>
    </div>
  </Transition>
</template>

<style scoped src="@/assets/styles/components/ImagePreview.css"></style>

