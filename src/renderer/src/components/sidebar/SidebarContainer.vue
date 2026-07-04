<script setup>
import ContentsSidebar from './ContentsSidebar.vue'
import MangaListSidebar from './MangaListSidebar.vue'
import HistorySidebar from './HistorySidebar.vue'

defineProps({
  sidebar: Object
})

const emit = defineEmits(['closeAllSidebars'])
</script>

<template>
  <ContentsSidebar :sidebar="sidebar" />

  <MangaListSidebar :sidebar="sidebar" />

  <HistorySidebar :sidebar="sidebar" />

  <div
    v-if="sidebar.showContents.value || sidebar.showMangaList.value || sidebar.showHistory.value"
    class="sidebar-overlay"
    @click="emit('closeAllSidebars')"
  ></div>
</template>

<style scoped>
.sidebar-overlay {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: var(--bg-overlay);
  z-index: 99;
}
</style>
