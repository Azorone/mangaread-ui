<script setup>
defineProps({
  sidebar: Object
})
</script>

<template>
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
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: var(--sidebar-width, 300px);
  height: 100vh;
  background-color: var(--bg-panel);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  z-index: 100;
  animation: slideIn var(--transition-slow) ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: var(--bg-elevated);
  border-bottom: 1px solid var(--border-color);
}

.sidebar-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.1rem;
}

.close-sidebar-btn {
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  transition: color var(--transition-normal);
}

.close-sidebar-btn:hover {
  color: var(--highlight-blue);
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0;
}

.manga-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.manga-item {
  padding: 0.75rem 1rem;
  color: var(--text-secondary);
  cursor: pointer;
  border-left: 3px solid transparent;
  transition:
    background-color var(--transition-normal),
    color var(--transition-normal),
    border-color var(--transition-normal);
  user-select: none;
}

.manga-item:hover {
  background-color: var(--bg-elevated);
  color: var(--text-primary);
  border-left-color: var(--highlight-blue);
}

.manga-item.active {
  background-color: var(--highlight-blue);
  color: #ffffff;
  border-left-color: #ffffff;
}

.manga-title {
  word-break: break-word;
  font-size: 0.95rem;
}
</style>
