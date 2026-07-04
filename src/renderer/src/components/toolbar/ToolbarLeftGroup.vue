<script setup>
// Props
defineProps({
  sidebar: Object,
  theme: Object,
  appVersion: String,
  openManagerWindow: Function
})

// Emits
defineEmits(['openScreenshotsFolder', 'openMangaStoreFolder'])
</script>

<template>
  <div class="group">
    <button title="打开漫画列表" @click="sidebar.toggleMangaList()">📚 漫画列表</button>
    <button title="打开目录" @click="sidebar.toggleContents()">📖 目录</button>
    <button title="打开阅读历史" @click="sidebar.toggleHistory()">⏱️ 历史记录</button>
    <button title="打开截图文件夹" @click="$emit('openScreenshotsFolder')">📁 截图文件夹</button>
    <button title="打开漫画文件夹" @click="$emit('openMangaStoreFolder')">📂 漫画文件夹</button>
    <button title="打开漫画管理窗口" class="manager-btn" @click="openManagerWindow">⚙️ 管理</button>
    <button
      :title="theme.isDark.value ? '切换到亮色主题' : '切换到暗色主题'"
      class="theme-btn"
      @click="theme.toggleTheme()"
    >
      {{ theme.isDark.value ? '☀️' : '🌙' }}
    </button>
    <span class="version-badge" title="当前版本">v{{ appVersion }}</span>
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

.version-badge {
  font-size: 0.75rem;
  color: var(--text-dim);
  padding: 0.1rem 0.4rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  white-space: nowrap;
  user-select: none;
  opacity: 0.7;
}
</style>
