<script setup>
// Props
defineProps({
  showImportPanel: Boolean,
  importDropActive: Boolean,
  selectedFolders: {
    type: Array,
    default: () => []
  }
})

// Emits
defineEmits(['update:showImportPanel', 'handleDragEnter', 'handleDragLeave', 'handleDrop', 'openImportDialog', 'importFolder', 'removeFolder', 'batchImport', 'preventDefault'])
</script>

<template>
  <div v-if="showImportPanel" class="import-modal">
    <div class="import-overlay" @click="$emit('update:showImportPanel', false)"></div>
    <div
      class="import-panel"
      @dragenter="$emit('handleDragEnter', $event)"
      @dragover="$emit('preventDefault', $event)"
      @dragleave="$emit('handleDragLeave', $event)"
      @drop="$emit('handleDrop', $event)"
    >
      <div :class="['import-drop-area', { 'drag-over': importDropActive }]">
        <div v-if="selectedFolders.length === 0">
          <div class="import-icon" @click="$emit('openImportDialog')">📁</div>
          <div class="import-text">点击选择文件夹或直接将文件夹拖入此处</div>
        </div>
        <div v-else class="import-list">
          <div class="import-item" v-for="(folder, index) in selectedFolders" :key="index">
            <span class="folder-path">{{ folder }}</span>
            <button class="btn-import" @click="$emit('importFolder', folder)">导入</button>
            <button class="btn-remove" @click="$emit('removeFolder', index)">取消</button>
          </div>
        </div>
      </div>
      <div class="import-footer">
        <button class="btn-primary" @click="$emit('batchImport')" :disabled="selectedFolders.length === 0">批量导入</button>
        <button class="btn-secondary" @click="$emit('update:showImportPanel', false)">关闭</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.import-modal {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 500;
}

.import-overlay {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.import-panel {
  position: relative;
  width: 90%;
  max-width: 600px;
  background-color: #2a2a2a;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  z-index: 501;
}

.import-drop-area {
  flex: 1;
  padding: 2rem;
  border: 2px dashed #444;
  border-radius: 4px;
  margin: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
  min-height: 200px;
}

.import-drop-area.drag-over {
  background-color: #3a4a4a;
  border-color: #0e639c;
}

.import-icon {
  font-size: 3rem;
  cursor: pointer;
  margin-bottom: 1rem;
}

.import-text {
  color: #ccc;
  font-size: 0.9rem;
  text-align: center;
}

.import-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
}

.import-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: #1e1e1e;
  border-radius: 4px;
}

.folder-path {
  flex: 1;
  color: #aaa;
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-import,
.btn-remove {
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-import {
  background-color: #0e639c;
  color: white;
}

.btn-import:hover {
  background-color: #1177bb;
}

.btn-remove {
  background-color: #666;
  color: white;
}

.btn-remove:hover {
  background-color: #777;
}

.import-footer {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #444;
  justify-content: flex-end;
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: #0e639c;
  color: white;
}

.btn-primary:hover {
  background-color: #1177bb;
}

.btn-primary:disabled {
  background-color: #666;
  color: #999;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-secondary {
  background-color: #666;
  color: white;
}

.btn-secondary:hover {
  background-color: #777;
}
</style>
