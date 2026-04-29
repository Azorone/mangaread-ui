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
  align-items: center;
  background-color: #1a1a1a;
  overflow: hidden;
  position: relative;
}

/* 图片包装层 */
.img-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* ==================== 图片通用样式 ==================== */
img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  user-select: none;
}
</style>
