<script setup>
// Props
defineProps({
  cropper: Object
})
</script>

<template>
  <div class="group">
    <button @click="cropper.zoom(0.1)" title="放大 (键盘: + 键)">➕ 放大</button>
    <button @click="cropper.zoom(-0.1)" title="缩小 (键盘: - 键)">➖ 缩小</button>
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
  background-color: #4b4b4b;
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
</style>
