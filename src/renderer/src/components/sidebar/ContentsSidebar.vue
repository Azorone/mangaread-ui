<script setup>
defineProps({
  sidebar: Object
})
</script>

<template>
  <div v-if="sidebar.showContents.value" class="sidebar contents-sidebar">
    <div class="sidebar-header">
      <h3>📖 目录</h3>
      <button class="close-sidebar-btn" @click="sidebar.toggleContents()">✕</button>
    </div>
    <div class="sidebar-content">
      <ul class="contents-list">
        <li
          v-for="(content, index) in sidebar.chapterList.value"
          :key="index"
          class="contents-item"
          @click="sidebar.selectContent(content)"
        >
          {{ content }}
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
  width: 300px;
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

.contents-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.contents-item {
  padding: 0.75rem 1rem;
  color: var(--text-secondary);
  cursor: pointer;
  border-left: 3px solid transparent;
  transition:
    background-color var(--transition-normal),
    color var(--transition-normal),
    border-color 0.2s;
  user-select: none;
}

.contents-item:hover {
  background-color: var(--bg-elevated);
  color: var(--text-primary);
  border-left-color: var(--highlight-blue);
}
</style>
