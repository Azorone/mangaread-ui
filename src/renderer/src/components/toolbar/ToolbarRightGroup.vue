<script setup>
import { ref, watch } from 'vue'

// Props
const props = defineProps({
  cropper: Object,
  pagination: Object
})

// Emits
defineEmits(['cleanCroppedList', 'clearScreenshots'])

// 页码输入框
const pageInput = ref('')

// 同步输入框与当前页码（使用 props.pagination 访问）
watch(
  () => [props.pagination.currentPage.value, props.pagination.totalPages.value],
  () => {
    pageInput.value = String(props.pagination.currentPage.value)
  },
  { immediate: true }
)

const onPageInputKeydown = (e) => {
  if (e.key === 'Enter') {
    e.target.blur()
  }
}

const onPageInputBlur = () => {
  const val = parseInt(pageInput.value, 10)
  if (isNaN(val) || val < 1) {
    // 输入无效，回显当前页码
    pageInput.value = String(props.pagination.currentPage.value)
    return
  }
  props.pagination.jumpToPageViaInput(val)
}
</script>

<template>
  <div class="group">
    <button :class="{ active: cropper.isCropping.value }" @click="cropper.toggleCrop()">
      {{ cropper.isCropping.value ? '禁用裁剪' : '✂️ 自由裁剪' }}
    </button>
    <button :disabled="!cropper.isCropping.value" @click="cropper.getCroppedImage()">
      💾 保存选区
    </button>
    <button @click="$emit('cleanCroppedList')">🧹 清空预览</button>
    <button title="清空所有保存的截图" @click="$emit('clearScreenshots')">🗑️ 清空截图</button>
    <button
      :disabled="pagination.currentPage.value <= 1"
      title="前一页 (键盘: ←)"
      @click="pagination.prevPage()"
    >
      ⬅️
    </button>
    <div class="page-input-wrapper">
      <input
        v-model="pageInput"
        class="page-input"
        type="text"
        inputmode="numeric"
        title="输入页码后按 Enter 跳转"
        @keydown="onPageInputKeydown"
        @blur="onPageInputBlur"
      />
      <span class="page-separator">/</span>
      <span class="page-total">{{ pagination.totalPages.value }}</span>
    </div>
    <button
      :disabled="pagination.currentPage.value >= pagination.totalPages.value"
      title="下一页 (键盘: →)"
      @click="pagination.nextPage()"
    >
      ➡️
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
  background-color: var(--btn-bg);
  color: var(--btn-text);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color var(--transition-normal);
  white-space: nowrap;
}

button:hover {
  background-color: var(--btn-bg-hover);
  color: #ffffff;
}

button:active {
  background-color: var(--btn-bg-active);
}

/* 激活状态（裁剪模式打开时） */
button.active {
  background-color: var(--highlight-green);
  border: 2px solid #0a5a2a;
  color: #ffffff;
}

/* 禁用状态 */
button:disabled {
  background-color: var(--btn-disabled-bg);
  color: var(--btn-disabled-text);
  cursor: not-allowed;
  opacity: 0.6;
}

/* ==================== 页码输入框 ==================== */
.page-input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background: var(--bg-elevated);
  padding: 0.3rem 0.6rem;
  border-radius: var(--radius-md);
}

.page-input {
  width: 50px;
  text-align: center;
  background: var(--bg-app);
  color: var(--text-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  padding: 0.25rem 0.3rem;
  font-size: 0.9rem;
  outline: none;
  transition: border-color var(--transition-normal);
}

.page-input:focus {
  border-color: var(--border-focus);
}

.page-separator {
  color: var(--text-dim);
  font-size: 0.9rem;
}

.page-total {
  color: var(--text-secondary);
  font-size: 0.9rem;
  min-width: 30px;
  text-align: center;
}
</style>
