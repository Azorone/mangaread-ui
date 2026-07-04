<script setup>
import { ref } from 'vue'

// Props
defineProps({
  currentMangaPage: String,
  cropper: Object
})

const imageRef = ref(null)
defineExpose({
  imageRef
})
</script>

<template>
  <div class="viewer-container" @contextmenu.prevent="cropper.handleRightClick()">
    <div class="img-wrapper">
      <img ref="imageRef" :src="currentMangaPage" alt="Manga Page" />
    </div>
  </div>
</template>

<style scoped>
/* ==================== 图片查看区样式 ==================== */
.viewer-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background-color: var(--bg-app);
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
}

/* 红色长图滚动条（仅查看器区域） */
.viewer-container::-webkit-scrollbar {
  width: var(--scrollbar-width, 8px);
}

.viewer-container::-webkit-scrollbar-track {
  background: var(--scrollbar-track-bg, #1a1a1a);
}

.viewer-container::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb-bg, #cc3333);
  border-radius: var(--scrollbar-thumb-radius, 4px);
}

.viewer-container::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover-bg, #ff4444);
}

/* 图片包装层 */
.img-wrapper {
  width: 100%;
  min-height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

/* ==================== 图片通用样式 ==================== */
img {
  max-width: 100%;
  height: auto;
  display: block;
  user-select: none;
}
</style>
