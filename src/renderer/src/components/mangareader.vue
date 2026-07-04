<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useCropper } from '../composables/useCropper'
import { useLightbox } from '../composables/useLightbox'
import { usePagination } from '../composables/usePagination'
import { useSidebar } from '../composables/useSidebar'
import { useKeyboard } from '../composables/useKeyboard'
import { useMangaSet } from '../composables/useMangaSet'
import { useImageDisplay } from '../composables/useImageDisplay'
import { useTheme } from '../composables/useTheme'
import 'cropperjs/dist/cropper.css'
import Toolbar from './toolbar/Toolbar.vue'
import ViewerContainer from './viewer/ViewerContainer.vue'
import PreviewBar from './viewer/PreviewBar.vue'
import SidebarContainer from './sidebar/SidebarContainer.vue'

const mangaSet = useMangaSet()
const image = ref(null)
const pagination = usePagination(mangaSet)
const sidebar = useSidebar(mangaSet, pagination)
const cropper = useCropper()
const lightbox = useLightbox(cropper.croppedList)
const keyboard = useKeyboard(pagination, cropper)
const imageDisplay = useImageDisplay(mangaSet, pagination, cropper)
const theme = useTheme()
const appVersion = ref('')

// ==================== 数据版本号同步（管理窗口 → 阅读器） ====================
const lastDataVersion = ref(0)

const syncDataIfChanged = async () => {
  try {
    const currentVersion = await window.api.getDataVersion()
    if (currentVersion === lastDataVersion.value) return

    lastDataVersion.value = currentVersion

    // 保存当前阅读位置快照
    const savedMangaIndex = mangaSet.MangaIndex.value
    const savedChapterIndex = mangaSet.ChapterIndex.value
    const savedPageIndex = mangaSet.PageIndex.value
    const prevMangaName =
      mangaSet.mangaSet.value[savedMangaIndex]?.name

    // 全量刷新
    await mangaSet.fetchMangaSetData()
    await mangaSet.fetchHistoryData()

    // 边界处理：尝试恢复阅读位置
    const newMangaIndex = mangaSet.mangaSet.value.findIndex(
      (m) => m.name === prevMangaName
    )
    if (newMangaIndex >= 0) {
      mangaSet.MangaIndex.value = newMangaIndex
      const chapterCount =
        mangaSet.mangaSet.value[newMangaIndex]?.chapters?.length || 0
      mangaSet.ChapterIndex.value = Math.min(
        savedChapterIndex,
        chapterCount - 1
      )
      const pageCount =
        mangaSet.mangaSet.value[newMangaIndex]?.chapters?.[
          mangaSet.ChapterIndex.value
        ]?.images?.length || 0
      mangaSet.PageIndex.value = Math.min(savedPageIndex, pageCount - 1)
    } else {
      // 当前漫画已被删除，重置到第一本
      mangaSet.MangaIndex.value = Math.min(
        0,
        mangaSet.mangaSet.value.length - 1
      )
      mangaSet.ChapterIndex.value = 0
      mangaSet.PageIndex.value = 0
    }

    pagination.initializePagination()
  } catch {
    // 同步失败时静默处理
  }
}

// ==================== 当前页面URL ====================

const currentMangaPage = computed(() => {
  try {
    const imageUrl = mangaSet.getImagesUrl(
      mangaSet.MangaIndex.value,
      mangaSet.ChapterIndex.value,
      mangaSet.PageIndex.value
    )
    if (imageUrl && !imageUrl.startsWith('manga:/')) {
      return `manga:/${imageUrl}`
    }
    return imageUrl
  } catch {
    return ''
  }
})

// ==================== 截图操作 ====================

const clearScreenshots = async () => {
  try {
    const result = await window.api.clearScreenshots()
    if (result.success) {
      cropper.croppedList.value = []
      ElMessage.success(`截图目录已清空！`)
    } else {
      ElMessage.error(`清空失败：${result.error}`)
    }
  } catch {
    ElMessage.error('清空截图时发生错误')
  }
}

const openScreenshotsFolder = async () => {
  try {
    const result = await window.api.openScreenshotsFolder()
    if (!result.success) ElMessage.error(`打开文件夹失败：${result.error}`)
  } catch {
    ElMessage.error('打开截图文件夹时发生错误')
  }
}

const openMangaStoreFolder = async () => {
  try {
    const result = await window.api.openMangaStoreFolder()
    if (!result.success) ElMessage.error(`打开文件夹失败：${result.error}`)
  } catch {
    ElMessage.error('打开漫画文件夹时发生错误')
  }
}

const cleanCroppedList = () => {
  cropper.croppedList.value.length = 0
}

const closeAllSidebars = () => {
  sidebar.showContents.value = false
  sidebar.showMangaList.value = false
  sidebar.showHistory.value = false
}

// ==================== 生命周期 ====================

onMounted(async () => {
  cropper.initCropper(image.value.imageRef)
  await mangaSet.initializeMangaSet()
  await sidebar.initSidebar()
  await pagination.initializePagination()

  // 获取版本号
  try {
    appVersion.value = await window.api.getAppVersion()
  } catch {
    appVersion.value = '?'
  }

  // 初始化主题
  theme.initTheme()

  // 注册页码跳转处理器
  pagination.registerJumpHandler(imageDisplay.jumpToPage)

  window.addEventListener('resize', cropper.fitToScreen)
  window.addEventListener('focus', syncDataIfChanged)
  keyboard.setupKeyboardListener()
  cropper.toggleCrop()

  // 记录初始版本号
  window.api.getDataVersion().then((v) => {
    lastDataVersion.value = v
  })

  // 首次加载后触发自适应（等待 cropper 完全初始化）
  setTimeout(() => imageDisplay.triggerFitToScreen(), 500)
})

onBeforeUnmount(() => {
  cropper.destroyCropper()
  window.removeEventListener('resize', cropper.fitToScreen)
  window.removeEventListener('focus', syncDataIfChanged)
  keyboard.removeKeyboardListener()
  mangaSet.saveCurrentHistory()
})

// 页面/章节/漫画切换时触发自适应
watch(currentMangaPage, (newUrl) => {
  if (cropper.cropper.value) {
    cropper.cropper.value.replace(newUrl)
    // 替换图片完成后触发自适应
    imageDisplay.triggerFitToScreen()
  }
})
</script>

<template>
  <div class="manga-app">
    <!-- ==================== 工具栏 ==================== -->
    <Toolbar
      :sidebar="sidebar"
      :cropper="cropper"
      :pagination="pagination"
      :theme="theme"
      :app-version="appVersion"
      :open-screenshots-folder="openScreenshotsFolder"
      :open-manga-store-folder="openMangaStoreFolder"
      @clean-cropped-list="cleanCroppedList"
      @clear-screenshots="clearScreenshots"
    />

    <!-- ==================== 主查看区 ==================== -->
    <ViewerContainer ref="image" :current-manga-page="currentMangaPage" :cropper="cropper" />

    <!-- ==================== 预览条 ==================== -->
    <PreviewBar :cropper="cropper" :lightbox="lightbox" />

    <!-- ==================== 侧边栏 ==================== -->
    <SidebarContainer
      :sidebar="sidebar"
      @close-all-sidebars="closeAllSidebars"
    />

    <!-- ==================== 灯箱 (ElDialog 全屏) ==================== -->
    <el-dialog
      v-model="lightbox.showLightbox.value"
      fullscreen
      :show-close="false"
      class="lightbox-dialog"
    >
      <div class="lightbox-wrapper" @click.self="lightbox.closeLightbox()">
        <button class="lb-close" @click="lightbox.closeLightbox()">✕</button>
        <button class="lb-nav lb-prev" @click="lightbox.prevPreview()">❮</button>
        <div class="lb-content">
          <img
            v-if="cropper.croppedList.value[lightbox.activePreviewIndex.value]"
            :src="cropper.croppedList.value[lightbox.activePreviewIndex.value].base64"
            draggable="true"
            @dragstart="
              (e) => {
                const item = cropper.croppedList.value[lightbox.activePreviewIndex.value]
                const fileUri = `file://${item.path}`
                e.dataTransfer.setData('text/uri-list', fileUri)
                e.dataTransfer.setData('text/plain', fileUri)
                e.dataTransfer.setDragImage(e.target, 10, 10)
              }
            "
          />
          <span class="lb-counter">
            {{ lightbox.activePreviewIndex.value + 1 }} / {{ cropper.croppedList.value.length }}
          </span>
        </div>
        <button class="lb-nav lb-next" @click="lightbox.nextPreview()">❯</button>
      </div>
    </el-dialog>

  </div>
</template>

<style scoped>
.manga-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--bg-app);
  color: var(--text-primary);
}

/* ==================== 灯箱样式 ==================== */
.lightbox-dialog :deep(.el-dialog) {
  background: transparent !important;
}

.lightbox-wrapper {
  position: relative;
  width: 100%;
  height: 85vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.lb-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 85%;
  max-height: 85vh;
}

.lb-content img {
  max-width: 100%;
  max-height: 75vh;
  border: 1px solid #444;
  border-radius: 4px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
}

.lb-counter {
  margin-top: 10px;
  color: #aaa;
  font-size: 14px;
  background: rgba(0, 0, 0, 0.6);
  padding: 3px 10px;
  border-radius: 10px;
}

.lb-close {
  position: absolute;
  top: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 14px;
  border-radius: 4px;
  font-size: 18px;
  cursor: pointer;
  z-index: 1001;
}

.lb-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.lb-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 12px 18px;
  border-radius: 4px;
  font-size: 20px;
  cursor: pointer;
  z-index: 1001;
}

.lb-nav:hover {
  background: rgba(255, 255, 255, 0.2);
}

.lb-prev {
  left: 10px;
}

.lb-next {
  right: 10px;
}

/* ==================== 导入拖拽区 ==================== */
.import-drop-zone {
  min-height: 200px;
  border: 2px dashed #555;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-color: #1c1c1c;
  transition:
    border-color 0.2s,
    background-color 0.2s;
  cursor: pointer;
}

.import-drop-zone.drag-over {
  border-color: #409eff;
  background-color: rgba(64, 158, 255, 0.06);
}

.drop-empty {
  text-align: center;
  color: #ccc;
}

.drop-icon {
  font-size: 48px;
  user-select: none;
  margin-bottom: 12px;
}

.drop-text {
  font-size: 14px;
  line-height: 1.5;
}

.drop-list {
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.drop-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background-color: #2a2a2a;
  border-radius: 4px;
}

.drop-path {
  flex: 1;
  font-size: 12px;
  color: #ccc;
  word-break: break-all;
}
</style>
