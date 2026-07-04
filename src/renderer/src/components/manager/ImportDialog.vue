<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const emit = defineEmits(['imported'])

const visible = defineModel('visible', { type: Boolean, default: false })
const importDropActive = ref(false)
const selectedFolders = ref([])
const dragCounter = ref(0)

const preventDefault = (event) => {
  event.preventDefault()
  event.stopPropagation()
}

const openImportDialog = async () => {
  try {
    const result = await window.api.openFolderDialog()
    if (result && Array.isArray(result.filePaths)) {
      result.filePaths.forEach((path) => handleImportedFolder(path))
    }
  } catch (error) {
    console.error('打开文件夹选择器失败：', error)
  }
}

const handleImportedFolder = (folderPath) => {
  if (!folderPath || selectedFolders.value.includes(folderPath)) return
  selectedFolders.value.push(folderPath)
}

const importFolder = async (folder) => {
  try {
    const result = await window.api.importFolders([folder])
    if (result && Array.isArray(result.results)) {
      const res = result.results[0]
      if (res.success) {
        const index = selectedFolders.value.indexOf(folder)
        if (index > -1) selectedFolders.value.splice(index, 1)
        emit('imported')
      } else {
        ElMessage.error(`导入失败：${res.error}`)
      }
    }
  } catch (error) {
    ElMessage.error(`导入过程中出错：${error.message}`)
  }
}

const batchImport = async () => {
  try {
    const result = await window.api.importFolders(selectedFolders.value)
    let successCount = 0
    let failCount = 0
    if (result && Array.isArray(result.results)) {
      result.results.forEach((res) => {
        if (res.success) successCount++
        else failCount++
      })
    }
    selectedFolders.value = []
    visible.value = false
    emit('imported')
    ElMessage.success(`批量导入完成：成功 ${successCount} 个，失败 ${failCount} 个`)
  } catch (error) {
    ElMessage.error(`批量导入过程中出错：${error.message}`)
  }
}

const handleDragEnter = (event) => {
  preventDefault(event)
  dragCounter.value++
  importDropActive.value = true
}

const handleDragLeave = (event) => {
  preventDefault(event)
  dragCounter.value--
  if (dragCounter.value === 0) importDropActive.value = false
}

const handleDrop = async (event) => {
  preventDefault(event)
  dragCounter.value = 0
  importDropActive.value = false
  const files = Array.from(event.dataTransfer?.files || [])
  for (const file of files) {
    const path = await window.api.getPathForFile(file)
    if (path) handleImportedFolder(path)
  }
}

const removeFolder = (index) => {
  selectedFolders.value.splice(index, 1)
}
</script>

<template>
  <el-dialog
    v-model="visible"
    title="📁 导入漫画"
    width="560px"
    :close-on-click-modal="false"
  >
    <div
      :class="['import-drop-zone', { 'drag-over': importDropActive }]"
      @dragenter="handleDragEnter"
      @dragover="preventDefault"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <div v-if="selectedFolders.length === 0" class="drop-empty" @click="openImportDialog">
        <div class="drop-icon">📁</div>
        <div class="drop-text">点击选择文件夹或直接将文件夹拖入此处</div>
      </div>
      <div v-else class="drop-list">
        <div v-for="(folder, index) in selectedFolders" :key="index" class="drop-item">
          <span class="drop-path">{{ folder }}</span>
          <el-button size="small" type="primary" @click="importFolder(folder)">导入</el-button>
          <el-button size="small" @click="removeFolder(index)">取消</el-button>
        </div>
      </div>
    </div>
    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
      <el-button type="primary" :disabled="selectedFolders.length === 0" @click="batchImport">
        批量导入
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.import-drop-zone {
  border: 2px dashed #555;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.import-drop-zone.drag-over {
  border-color: #409eff;
  background-color: rgba(64, 158, 255, 0.1);
}

.drop-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.drop-icon {
  font-size: 3rem;
}

.drop-text {
  color: #999;
  font-size: 0.95rem;
}

.drop-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.drop-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #333;
  border-radius: 4px;
}

.drop-path {
  flex: 1;
  text-align: left;
  color: #ccc;
  font-size: 0.85rem;
  word-break: break-all;
}
</style>
