<script setup>
// Props
defineProps({
  cropper: Object
})
</script>

<template>
  <div class="group">
    <button title="放大 (键盘: + 键)" @click="cropper.zoom(0.1)">➕ 放大</button>
    <button title="缩小 (键盘: - 键)" @click="cropper.zoom(-0.1)">➖ 缩小</button>
    <button @click="cropper.rotate(-90)">↺ 左旋</button>
    <button @click="cropper.rotate(90)">↻ 右旋</button>
    <button @click="cropper.fitToScreen()">📺 自适应屏幕</button>
  </div>
</template>

<style scoped>
/* ==================== 按钮组样式 ==================== */
.group {
  display: flex;
  gap: 0.5rem;
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
</style>
