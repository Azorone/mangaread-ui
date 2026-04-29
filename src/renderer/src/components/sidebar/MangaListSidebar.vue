<script setup>
// Props
defineProps({
  sidebar: Object
})
</script>

<template>
  <!-- 漫画列表侧边栏 -->
  <div v-if="sidebar.showMangaList.value" class="sidebar manga-list-sidebar">
    <div class="sidebar-header">
      <h3>📚 漫画列表</h3>
      <button class="close-sidebar-btn" @click="sidebar.toggleMangaList()">✕</button>
    </div>
    <div class="sidebar-content">
      <ul class="manga-list">
        <li 
          v-for="manga in sidebar.mangaList.value" 
          :key="manga"
          class="manga-item"
          @click="sidebar.selectManga(manga)"
        >
          <div class="manga-title">{{ manga }}</div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
/* ==================== 侧边栏通用样式 ==================== */
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 300px;
  height: 100vh;
  background-color: #2a2a2a;
  border-right: 1px solid #444;
  display: flex;
  flex-direction: column;
  z-index: 100;
  animation: slideIn 0.3s ease-out;
}

/* 滑入关键帧 */
@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

/* ==================== 侧边栏头部样式 ==================== */
.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #1e1e1e;
  border-bottom: 1px solid #444;
}

.sidebar-header h3 {
  margin: 0;
  color: #fff;
  font-size: 1.1rem;
}

/* 关闭侧边栏按钮 */
.close-sidebar-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}

.close-sidebar-btn:hover {
  color: #0e639c;
}

/* ==================== 侧边栏内容区域 ==================== */
.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0;
}

/* ==================== 漫画列表样式 ==================== */
.manga-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

/* 漫画项 */
.manga-item {
  padding: 0.75rem 1rem;
  color: #ccc;
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;
}

/* 漫画项悬停效果 */
.manga-item:hover {
  background-color: #3a3a3a;
  color: #fff;
  border-left-color: #0e639c;
}

/* 激活状态（当前选中的漫画） */
.manga-item.active {
  background-color: #0e639c;
  color: #fff;
  border-left-color: #fff;
}

/* 漫画标题 */
.manga-title {
  word-break: break-word;
  font-size: 0.95rem;
}
</style>
