<script setup>
// Props
const props = defineProps({
  cropper: Object,
  lightbox: Object
})

// Emits
defineEmits(['handlePreviewDragStart'])

const handlePreviewDragStart = (event, index) => {
  const item = props.cropper.croppedList.value[index];
  const fileUri = `file://${item.path}`;
  event.dataTransfer.setData('text/uri-list', fileUri);
  event.dataTransfer.setData('text/plain', fileUri);
  const img = event.target;
  event.dataTransfer.setDragImage(img, img.width / 2, img.height / 2);
}
</script>

<template>
  <div v-if="cropper.croppedList.value.length > 0" class="preview-bar">
    <span>裁剪预览({{ cropper.croppedList.value.length }}) - 点击图片可放大：</span>
    <div class="preview-list">
      <img 
        v-for="(item, index) in cropper.croppedList.value" 
        :key="index" 
        :src="item.base64" 
        alt="Preview" 
        @click="lightbox.openLightbox(index)"
        @dragstart="handlePreviewDragStart($event, index)"
        draggable="true"
      />
    </div>
  </div>
</template>

<style scoped>
/* ==================== 预览条样式 ==================== */
.preview-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background-color: #2a2a2a;
  border-top: 1px solid #444;
  overflow-x: auto;
}

/* 预览条文本样式 */
.preview-bar span {
  font-size: 0.9rem;
  color: #fff;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ==================== 预览图片列表样式 ==================== */
.preview-list {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  flex: 1;
}

/* 预览缩略图样式 */
.preview-list img {
  height: 80px;
  width: auto;
  object-fit: contain;
  border: 2px solid #444;
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.2s, transform 0.2s;
  flex-shrink: 0;
}

/* 缩略图悬停效果 */
.preview-list img:hover {
  border-color: #0e639c;
  transform: scale(1.05);
}
</style>
