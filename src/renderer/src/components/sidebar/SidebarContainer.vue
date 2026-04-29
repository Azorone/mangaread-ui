<script setup>
import ContentsSidebar from './ContentsSidebar.vue'
import MangaListSidebar from './MangaListSidebar.vue'
import HistorySidebar from './HistorySidebar.vue'

// Props
defineProps({
  sidebar: Object
})
</script>

<template>
  <!-- 目录侧边栏 -->
  <ContentsSidebar :sidebar="sidebar" />
  
  <!-- 漫画列表侧边栏 -->
  <MangaListSidebar :sidebar="sidebar" />
  
  <!-- 阅读历史侧边栏 -->
  <HistorySidebar :sidebar="sidebar" />

  <!-- ==================== 侧边栏遮罩（防止点击侧边栏外）==================== -->
  <div 
    v-if="sidebar.showContents.value || sidebar.showMangaList.value || sidebar.showHistory.value" 
    class="sidebar-overlay"
    @click="sidebar.showContents.value = false; sidebar.showMangaList.value = false; sidebar.showHistory.value = false"
  ></div>
</template>

<style scoped>
/* ==================== 侧边栏遮罩 ==================== */
.sidebar-overlay {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 99;
}
</style>
