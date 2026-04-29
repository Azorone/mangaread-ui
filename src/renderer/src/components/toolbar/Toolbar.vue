<script setup>
import ToolbarLeftGroup from './ToolbarLeftGroup.vue'
import ToolbarCenterGroup from './ToolbarCenterGroup.vue'
import ToolbarRightGroup from './ToolbarRightGroup.vue'

// Props
const props = defineProps({
  sidebar: Object,
  cropper: Object,
  pagination: Object,
  openScreenshotsFolder: Function,
  openMangaStoreFolder: Function
})

// Emits
defineEmits(['showImportPanel', 'cleanCroppedList', 'clearScreenshots', 'openScreenshotsFolder', 'openMangaStoreFolder'])

// 事件处理
const handleOpenScreenshotsFolder = () => {
  props.openScreenshotsFolder?.()
}

const handleOpenMangaStoreFolder = () => {
  props.openMangaStoreFolder?.()
}
</script>

<template>
  <div class="toolbar">
    <ToolbarLeftGroup 
      :sidebar="sidebar"
      @showImportPanel="$emit('showImportPanel')"
      @openScreenshotsFolder="handleOpenScreenshotsFolder"
      @openMangaStoreFolder="handleOpenMangaStoreFolder"
    />
    
    <ToolbarCenterGroup 
      :cropper="props.cropper"
    />
    
    <ToolbarRightGroup 
      :cropper="props.cropper"
      :pagination="props.pagination"
      @cleanCroppedList="$emit('cleanCroppedList')"
      @clearScreenshots="$emit('clearScreenshots')"
    />
  </div>
</template>

<style scoped>
/* ==================== 工具栏样式 ==================== */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: linear-gradient(to right, #2a2a2a, #3a3a3a);
  border-bottom: 1px solid #444;
  flex-wrap: wrap;
}
</style>
