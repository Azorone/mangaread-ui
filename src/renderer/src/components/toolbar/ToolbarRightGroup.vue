<script setup>
// Props
defineProps({
  cropper: Object,
  pagination: Object
})

// Emits
defineEmits(['cleanCroppedList', 'clearScreenshots'])
</script>

<template>
  <div class="group">
    <button :class="{ active: cropper.isCropping.value }" @click="cropper.toggleCrop()">
      {{ cropper.isCropping.value ? '禁用裁剪' : '✂️ 自由裁剪' }}
    </button>
    <button :disabled="!cropper.isCropping.value" @click="cropper.getCroppedImage()">
      💾 保存选区
    </button>
    <button @click="$emit('cleanCroppedList')">
      🧹 清空预览
    </button>
    <button @click="$emit('clearScreenshots')" title="清空所有保存的截图">
      🗑️ 清空截图
    </button>
    <button 
      @click="pagination.prevPage()" 
      :disabled="pagination.currentPage.value === 1" 
      title="前一页 (键盘: ← 左箭头)"
    >
      ⬅️ 前一页
    </button>
    <span class="page-indicator">{{ pagination.currentPage.value }} / {{ pagination.totalPages.value }}</span>
    <button 
      @click="pagination.nextPage()" 
      :disabled="pagination.currentPage.value === pagination.totalPages.value" 
      title="下一页 (键盘: → 右箭头)"
    >
      下一页 ➡️
    </button>
  </div>
</template>

<style scoped>
/* ==================== 按钮组样式 ==================== */
.group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

/* ==================== 通用按钮样式 ==================== */
button {
  padding: 0.5rem 1rem;
  background-color: #484b4d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
  white-space: nowrap;
}

button:hover {
  background-color: #1177bb;
}

button:active {
  background-color: #0d5a8f;
}

/* 激活状态（裁剪模式打开时） */
button.active {
  background-color: #118c45;
  border: 2px solid #0a5a2a;
}

/* 禁用状态（裁剪模式关闭时"保存"按钮） */
button:disabled {
  background-color: #666;
  color: #999;
  cursor: not-allowed;
  opacity: 0.6;
}

/* ==================== 页码指示器 ==================== */
.page-indicator {
  padding: 0.5rem 1rem;
  background-color: #1e1e1e;
  color: #fff;
  border-radius: 4px;
  font-weight: bold;
  min-width: 80px;
  text-align: center;
}
</style>
