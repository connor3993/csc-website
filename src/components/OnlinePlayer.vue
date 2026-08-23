<script setup>
defineProps({
  onlinePlayers: {
    type: Number,
    required: true
  },
  maxPlayers: {
    type: Number,
    default: 30
  }
})
</script>

<template>
  <div class="server-status">
    <span class="status-dot"></span>
    在线人数: {{ onlinePlayers }} / {{ maxPlayers }}
  </div>
</template>

<style scoped src="@/assets/styles/components/OnlinePlayer.css"></style>

