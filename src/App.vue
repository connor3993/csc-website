<script setup>
import NavBar from './components/NavBar.vue'

// 服务器信息
const serverName = "CSC Museum"
</script>

<template>
  <div class="app-container">
    <NavBar :server-name="serverName" />
    <router-view />
  </div>
</template>

<style scoped src="@/assets/styles/views/App.css"></style>
