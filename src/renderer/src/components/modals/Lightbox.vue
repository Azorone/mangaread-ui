<script setup>
// Props
const prop =  defineProps({
  lightbox: Object,
  cropper: Object
})

// Emits
defineEmits(['handlePreviewDragStart'])

const handlePreviewDragStart = (event, index) => {
  const item = prop.cropper.croppedList.value[index];
  const fileUri = `file://${item.path}`;
  event.dataTransfer.setData('text/uri-list', fileUri);
  event.dataTransfer.setData('text/plain', fileUri);
  const img = event.target;
  event.dataTransfer.setDragImage(img, 10, 10);
}
</script>

<template>
  <!-- ==================== 灯箱（全屏预览）区域 ==================== -->
  <div v-if="lightbox.showLightbox.value" class="lightbox-overlay" @click.self="lightbox.closeLightbox()">
    <!-- 关闭按钮 -->
    <button class="close-btn" @click="lightbox.closeLightbox()">✕</button>
    
    <!-- 上一张按钮 -->
    <button class="nav-btn prev-btn" @click="lightbox.prevPreview()">❮</button>
    
    <!-- 灯箱内容（大图 + 页码） -->
    <div class="lightbox-content">
      <!-- 当前预览的大图 -->
      <img :src="cropper.croppedList.value[lightbox.activePreviewIndex.value].base64" alt="Enlarged Preview"  
        @dragstart="handlePreviewDragStart($event, lightbox.activePreviewIndex.value)"
        draggable="true"/>
      <!-- 页码计数器 -->
      <div class="lightbox-counter">
        {{ lightbox.activePreviewIndex.value + 1 }} / {{ cropper.croppedList.value.length }}
      </div>
    </div>
    
    <!-- 下一张按钮 -->
    <button class="nav-btn next-btn" @click="lightbox.nextPreview()">❯</button>
  </div>
</template>

<style scoped>
.lightbox-overlay {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.lightbox-content {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 90vw;
  max-height: 90vh;
}

.lightbox-content img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.lightbox-counter {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px 15px;
  border-radius: 4px;
  font-size: 0.9rem;
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  z-index: 1001;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #0e639c;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  padding: 15px;
  font-size: 2rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
  z-index: 1001;
}

.nav-btn:hover {
  background-color: rgba(0, 0, 0, 0.8);
}

.prev-btn {
  left: 20px;
}

.next-btn {
  right: 20px;
}
</style>
