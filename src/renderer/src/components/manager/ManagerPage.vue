<script setup>
import { ref, onMounted } from 'vue'
import { useMangaManager } from '../../composables/useMangaManager'
import ImportDialog from './ImportDialog.vue'

const manager = useMangaManager()
const importDialogVisible = ref(false)

/**
 * 通过 manga: 协议构造缩略图 URL
 * 浏览器自动处理图片解码/缩放/缓存，无需 IPC 读取整文件
 */
const getThumbnailUrl = (mangaName, chapterName, pageName) => {
  return `manga:/${mangaName}/${chapterName}/${pageName}`
}

// 导入完成后刷新
const onImported = () => {
  manager.fetchAllData()
}

onMounted(() => {
  manager.fetchAllData()
})
</script>

<template>
  <div class="manager-app">
    <!-- 顶部标题栏 -->
    <div class="manager-header">
      <h1>📚 漫画管理</h1>
      <div class="header-actions">
        <el-button type="primary" @click="importDialogVisible = true">
          📁 导入漫画
        </el-button>
        <el-button @click="manager.fetchAllData()" :loading="manager.loading.value">
          🔄 刷新
        </el-button>
      </div>
    </div>

    <div class="manager-body">
      <!-- ==================== 漫画表格 ==================== -->
      <div class="table-section">
        <div class="section-title">
          <span>漫画列表</span>
          <span class="count-badge">{{ manager.mangaList.value.length }}</span>
        </div>
        <el-table
          :data="manager.mangaList.value"
          style="width: 100%"
          :highlight-current-row="true"
          :row-class-name="({ row }) =>
            row.manganame === manager.selectedMangaName.value ? 'current-row' : ''
          "
          @row-click="(row) => manager.selectManga(row.manganame)"
          size="small"
          :loading="manager.loading.value"
        >
          <el-table-column prop="manganame" label="名称" min-width="180" />
          <el-table-column prop="chaptersize" label="章节数" width="80" align="center" />
          <el-table-column prop="importtime" label="导入时间" width="130" />
          <el-table-column prop="updatetime" label="更新时间" width="130" />
          <el-table-column label="操作" width="280" fixed="right">
            <template #default="{ row }">
              <el-button
                size="small"
                type="primary"
                @click="manager.addChapter(row.manganame)"
              >
                ＋章节
              </el-button>
              <el-button
                size="small"
                @click="manager.renameManga(row.manganame)"
              >
                ✏️
              </el-button>
              <el-button
                size="small"
                @click="manager.exportManga(row.manganame)"
              >
                📦
              </el-button>
              <el-button
                size="small"
                type="danger"
                @click="manager.deleteManga(row.manganame)"
              >
                🗑️
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- ==================== 章节表格 ==================== -->
      <div v-if="manager.selectedManga.value" class="table-section">
        <div class="section-title">
          <span>
            章节列表 —
            <strong>{{ manager.selectedManga.value.manganame }}</strong>
          </span>
          <span class="count-badge">{{ manager.chapterList.value.length }}</span>
          <div class="section-actions" style="margin-left: auto;">
            <el-button
              size="small"
              type="primary"
              @click="manager.addChapterFromDir(manager.selectedMangaName.value)"
            >
              📂 从文件夹导入章节
            </el-button>
          </div>
        </div>
        <el-table
          :data="manager.chapterList.value"
          style="width: 100%"
          :highlight-current-row="true"
          :row-class-name="({ row }) =>
            row.chaptername === manager.selectedChapterName.value ? 'current-row' : ''
          "
          @row-click="(row) => manager.selectChapter(row.chaptername)"
          size="small"
        >
          <el-table-column prop="chaptername" label="章节名称" min-width="180" />
          <el-table-column prop="imagesize" label="图片数" width="80" align="center" />
          <el-table-column label="操作" width="380" fixed="right">
            <template #default="{ row }">
              <el-button
                size="small"
                type="success"
                @click="manager.addPagesToChapter(manager.selectedMangaName.value, row.chaptername)"
              >
                📎 添加页面
              </el-button>
              <el-button
                size="small"
                @click="manager.renameChapter(manager.selectedMangaName.value, row.chaptername)"
              >
                ✏️
              </el-button>
              <el-button
                size="small"
                type="danger"
                @click="manager.deleteChapter(manager.selectedMangaName.value, row.chaptername)"
              >
                🗑️
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- ==================== 页面表格 ==================== -->
      <div v-if="manager.selectedChapter.value" class="table-section">
        <div class="section-title">
          <span>
            页面列表 —
            <strong>{{ manager.selectedChapter.value.chaptername }}</strong>
          </span>
          <span class="count-badge">{{ manager.pageList.value.length }}</span>
        </div>
        <el-table
          :data="manager.pageList.value"
          style="width: 100%"
          size="small"
          :loading="manager.loading.value"
        >
          <el-table-column label="缩略图" width="100" align="center">
            <template #default="{ row }">
              <div class="thumbnail-cell">
                <img
                  :src="getThumbnailUrl(manager.selectedMangaName.value, manager.selectedChapterName.value, row.name)"
                  class="thumbnail-img"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="文件名" min-width="200" />
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-button
                size="small"
                @click="
                  manager.renamePage(
                    manager.selectedMangaName.value,
                    manager.selectedChapterName.value,
                    row.name
                  )
                "
              >
                ✏️ 重命名
              </el-button>
              <el-button
                size="small"
                type="danger"
                @click="
                  manager.deletePage(
                    manager.selectedMangaName.value,
                    manager.selectedChapterName.value,
                    row.name
                  )
                "
              >
                🗑️
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 空状态 -->
      <div v-if="manager.mangaList.value.length === 0 && !manager.loading.value" class="empty-state">
        <div class="empty-icon">📂</div>
        <div class="empty-text">还没有漫画，点击上方「导入漫画」开始吧</div>
      </div>
    </div>

    <!-- ==================== 导入对话框 ==================== -->
    <ImportDialog v-model:visible="importDialogVisible" @imported="onImported" />
  </div>
</template>

<style scoped>
.manager-app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #1a1a1a;
  color: #e0e0e0;
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: #2a2a2a;
  border-bottom: 1px solid #444;
  flex-shrink: 0;
}

.manager-header h1 {
  margin: 0;
  font-size: 1.3rem;
  color: #fff;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.manager-body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.table-section {
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 8px;
  padding: 1rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
  color: #ccc;
}

.section-actions {
  margin-left: auto;
}

.count-badge {
  background: #409eff;
  color: #fff;
  padding: 0.1rem 0.5rem;
  border-radius: 10px;
  font-size: 0.8rem;
}

/* 覆盖 Element Plus 暗色表格样式 */
:deep(.el-table) {
  --el-table-bg-color: #2a2a2a;
  --el-table-tr-bg-color: #2a2a2a;
  --el-table-header-bg-color: #333;
  --el-table-row-hover-bg-color: #3a3a3a;
  --el-table-text-color: #e0e0e0;
  --el-table-header-text-color: #ccc;
  --el-table-border-color: #444;
}

:deep(.el-table th.el-table__cell) {
  background-color: #333 !important;
}

:deep(.current-row) {
  --el-table-tr-bg-color: #1a3a5c !important;
}

:deep(.el-table__body tr.current-row > td) {
  background-color: #1a3a5c !important;
}

.thumbnail-cell {
  width: 60px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 4px;
  background: #333;
  margin: 0 auto;
}

.thumbnail-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.thumbnail-placeholder {
  font-size: 1.5rem;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: #666;
}

.empty-icon {
  font-size: 4rem;
}

.empty-text {
  font-size: 1.1rem;
}
</style>
