<script setup>
import ToolbarLeftGroup from './ToolbarLeftGroup.vue'
import ToolbarCenterGroup from './ToolbarCenterGroup.vue'
import ToolbarRightGroup from './ToolbarRightGroup.vue'

// Props
const props = defineProps({
  sidebar: Object,
  cropper: Object,
  pagination: Object,
  theme: Object,
  appVersion: String,
  openScreenshotsFolder: Function,
  openMangaStoreFolder: Function
})

// Emits
defineEmits([
  'cleanCroppedList',
  'clearScreenshots',
  'openScreenshotsFolder',
  'openMangaStoreFolder'
])

// 事件处理
const handleOpenScreenshotsFolder = () => {
  props.openScreenshotsFolder?.()
}

const handleOpenMangaStoreFolder = () => {
  props.openMangaStoreFolder?.()
}

const openManagerWindow = async () => {
  await window.api.openManagerWindow()
}
</script>

<template>
  <div class="toolbar">
    <ToolbarLeftGroup
      :sidebar="sidebar"
      :theme="theme"
      :app-version="appVersion"
      :open-manager-window="openManagerWindow"
      @open-screenshots-folder="handleOpenScreenshotsFolder"
      @open-manga-store-folder="handleOpenMangaStoreFolder"
    />

    <ToolbarCenterGroup :cropper="props.cropper" />

    <ToolbarRightGroup
      :cropper="props.cropper"
      :pagination="props.pagination"
      @clean-cropped-list="$emit('cleanCroppedList')"
      @clear-screenshots="$emit('clearScreenshots')"
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
  background: linear-gradient(to right, var(--bg-panel), var(--bg-elevated));
  border-bottom: 1px solid var(--border-color);
  flex-wrap: wrap;
}
</style>
