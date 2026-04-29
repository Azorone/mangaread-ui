<script setup>
// Props
defineProps({
  sidebar: Object
})
</script>

<template>
  <!-- 阅读历史侧边栏 -->
  <div v-if="sidebar.showHistory.value" class="sidebar history-sidebar">
    <div class="sidebar-header">
      <h3>⏱️ 阅读历史</h3>
      <button class="close-sidebar-btn" @click="sidebar.toggleHistory()">✕</button>
    </div>
    <div class="sidebar-content">
      <div v-if="sidebar.historyList.value.length > 0" class="history-list">
        <div 
          v-for="(item, i) in sidebar.historyList.value" 
          :key="i"
          class="history-item"
          @click="sidebar.selectHistory(item)"
        >
          <div class="history-title">{{ item.mangaTitle }}</div>
          <div class="history-meta">第{{ item.page }}页</div>
          <div class="history-time">{{ item.timestamp }}</div>
        </div>
      </div>
      <div v-else class="empty-message">暂无阅读历史</div>
    </div>
    <!-- 清空历史按钮 -->
    <div v-if="sidebar.historyList.value.length > 0" class="sidebar-footer">
      <button class="clear-btn" @click="sidebar.clearHistory()">🗑️ 清空历史</button>
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

/* ==================== 阅读历史列表样式 ==================== */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem;
}

/* 历史项 */
.history-item {
  padding: 0.75rem;
  background-color: #1e1e1e;
  border-radius: 4px;
  border-left: 3px solid #0e639c;
  cursor: pointer;
  transition: background-color 0.2s;
}

/* 历史项悬停效果 */
.history-item:hover {
  background-color: #3a3a3a;
}

/* 历史标题 */
.history-title {
  color: #fff;
  font-weight: bold;
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
}

/* 历史元数据（章节+页码） */
.history-meta {
  color: #aaa;
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
}

/* 历史时间 */
.history-time {
  color: #666;
  font-size: 0.75rem;
}

/* 空状态提示 */
.empty-message {
  padding: 2rem 1rem;
  text-align: center;
  color: #666;
  font-size: 0.9rem;
}

/* ==================== 侧边栏底部按钮 ==================== */
.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid #444;
}

/* 清空按钮 */
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
