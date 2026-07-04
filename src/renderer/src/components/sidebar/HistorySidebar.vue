<script setup>
defineProps({
  sidebar: Object
})
</script>

<template>
  <div v-if="sidebar.showHistory.value" class="sidebar history-sidebar">
    <div class="sidebar-header">
      <h3>⏱️ 阅读历史</h3>
      <button class="close-sidebar-btn" @click="sidebar.toggleHistory()">✕</button>
    </div>
    <div class="sidebar-content">
      <div
        v-if="sidebar.historyList.value && sidebar.historyList.value.length > 0"
        class="history-list"
      >
        <div
          v-for="(item, i) in sidebar.historyList.value"
          :key="i"
          class="history-item"
          @click="sidebar.selectHistory(item)"
        >
          <div class="history-title">{{ item.manganame }}</div>
          <div class="history-meta">{{ item.chaptername }} - 第{{ item.pageindex + 1 }}页</div>
          <div class="history-time">{{ item.timestamp }}</div>
        </div>
      </div>
      <div v-else class="empty-message">暂无阅读历史</div>
    </div>
    <div
      v-if="sidebar.historyList.value && sidebar.historyList.value.length > 0"
      class="sidebar-footer"
    >
      <button class="clear-btn" @click="sidebar.clearHistory()">清空历史</button>
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

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem;
}

.history-item {
  padding: 0.75rem;
  background-color: var(--bg-elevated);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--highlight-blue);
  cursor: pointer;
  transition: background-color var(--transition-normal);
}

.history-item:hover {
  background-color: var(--bg-panel);
}

.history-title {
  color: var(--text-primary);
  font-weight: bold;
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
}

.history-meta {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
}

.history-time {
  color: var(--text-dim);
  font-size: 0.75rem;
}

.empty-message {
  padding: 2rem 1rem;
  text-align: center;
  color: var(--text-dim);
  font-size: 0.9rem;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid #444;
}

.clear-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #c0504d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.clear-btn:hover {
  background-color: #d95951;
}
</style>
