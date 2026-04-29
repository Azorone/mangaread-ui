<script setup>
// Props
defineProps({
  sidebar: Object
})

// Emits
defineEmits(['showImportPanel', 'openScreenshotsFolder', 'openMangaStoreFolder'])
</script>

<template>
  <div class="group">
    <button @click="sidebar.toggleMangaList()" title="打开漫画列表">
      📚 漫画列表
    </button>
    <button @click="sidebar.toggleContents()" title="打开目录">
      📖 目录
    </button>
    <button @click="sidebar.toggleHistory()" title="打开阅读历史">
      ⏱️ 历史记录
    </button>
    <button @click="$emit('openScreenshotsFolder')" title="打开截图文件夹">
      📁 截图文件夹
    </button>
    <button @click="$emit('openMangaStoreFolder')" title="打开漫画文件夹">
      📂 漫画文件夹
    </button>
    <button @click="$emit('showImportPanel')" title="导入漫画文件夹">
      📥 导入
    </button>
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
  padding: 0.1rem 0.5rem;
  background-color: #424547;
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
