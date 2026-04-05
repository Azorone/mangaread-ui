<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue';
import { useImageCache } from '../composables/useImageCache';
import { useCropper } from '../composables/useCropper';
import { useLightbox } from '../composables/useLightbox';
import { usePagination } from '../composables/usePagination';
import { useSidebar } from '../composables/useSidebar';
import { useKeyboard } from '../composables/useKeyboard';
import 'cropperjs/dist/cropper.css';

// ========================
// 初始化 Composables
// ========================
const imageRef = ref(null);
const imageCache = useImageCache();
const pagination = usePagination(imageCache);
const sidebar = useSidebar(imageCache, pagination);
const cropper = useCropper(imageRef);
const lightbox = useLightbox(cropper.croppedList);
const keyboard = useKeyboard(pagination, cropper);

// ========================
// 计算属性 - 当前漫画页面URL
// ========================
const currentMangaPage = computed(() => {
  const imageData = imageCache.getImageUrlByPage(pagination.currentPage.value);
  if (imageData) {
    return imageData.url;
  }
  return '';
});

// ========================
// 生命周期 - 组件挂载时初始化
// ========================
onMounted(async () => {
  // 初始化Cropper
  cropper.initCropper();

  // 监听视口大小变化，自动重新适配
  window.addEventListener('resize', cropper.fitToScreen);
  
  // 初始化时先获取漫画图片列表，然后预取和加载第一页
  try {
    await imageCache.fetchMangaImageList(imageCache.currentMangaId.value);
    pagination.totalPages.value = imageCache.mangaImageList.value.length;
    
    await imageCache.prefetchImagesToCache(
      pagination.currentPage.value,
      pagination.totalPages.value
    );
    
    await pagination.loadPageFromCache();
  } catch (error) {
    console.error('初始化缓存时出错：', error);
  }
  
  // 定期补充缓存（每3秒检查一次是否需要补充）
  const prefetchInterval = setInterval(() => {
    imageCache.prefetchImagesToCache(
      pagination.currentPage.value,
      pagination.totalPages.value
    );
  }, 3000);

  
  // 保存interval ID以便在卸载时清理
  window._prefetchIntervalId = prefetchInterval;
  
  // 设置键盘事件监听
  keyboard.setupKeyboardListener();

  await getVersion();

});

// ========================
// 生命周期 - 组件卸载前清理资源
// ========================
onBeforeUnmount(() => {
  // 销毁Cropper实例，释放内存
  cropper.destroyCropper();
  
  // 移除事件监听器
  window.removeEventListener('resize', cropper.fitToScreen);
  keyboard.removeKeyboardListener();
  
  // 清理预取的定时器
  if (window._prefetchIntervalId) {
    clearInterval(window._prefetchIntervalId);
    delete window._prefetchIntervalId;
  }
});

// ========================
// 数据监听 - 当漫画页面URL改变时
// ========================
watch(currentMangaPage, (newUrl) => {
  if (cropper.cropper.value) {
    // 替换Cropper中的图片为新URL
    cropper.cropper.value.replace(newUrl);
  }
});

async function getVersion() {
  console.log("apoi " + window.api);
   let v = await window.api.getAppVersion();
   alert(`当前版本：${v}`);
}

</script>

<template>
  <!-- 漫画阅读器主容器 -->
  <div class="manga-app">
    <!-- ==================== 工具栏区域 ==================== -->
    <div class="toolbar">
      <!-- 左侧：导航和控制按钮 -->
      <div class="group">
        <!-- 漫画列表按钮 -->
        <button @click="sidebar.toggleMangaList" title="打开漫画列表">
          📚 漫画列表
        </button>
        <!-- 目录按钮 -->
        <button @click="sidebar.toggleContents" title="打开目录">
          📖 目录
        </button>
        <!-- 阅读历史按钮 -->
        <button @click="sidebar.toggleHistory" title="打开阅读历史">
          ⏱️ 历史记录
        </button>
        <!-- 缓存设置按钮 -->
        <button @click="imageCache.showCacheSettings.value = true" title="设置图片缓存">
          ⚙️ 缓存设置
        </button>
      </div>

      <!-- 中心：图片编辑工具组 -->
      <div class="group">
        <!-- 放大按钮 -->
        <button @click="cropper.zoom(0.1)" title="放大 (键盘: + 键)">➕ 放大</button>
        <!-- 缩小按钮 -->
        <button @click="cropper.zoom(-0.1)" title="缩小 (键盘: - 键)">➖ 缩小</button>
        <!-- 左旋转 -->
        <button @click="cropper.rotate(-90)">↺ 左旋</button>
        <!-- 右旋转 -->
        <button @click="cropper.rotate(90)">↻ 右旋</button>
        <!-- 自适应屏幕 -->
        <button @click="cropper.fitToScreen">📺 自适应屏幕</button>
      </div>

      <!-- 右侧：裁剪和分页工具 -->
      <div class="group">
        <!-- 切换裁剪模式 -->
        <button :class="{ active: cropper.isCropping.value }" @click="cropper.toggleCrop">
          {{ cropper.isCropping.value ? '禁用裁剪' : '✂️ 自由裁剪' }}
        </button>
        <!-- 保存选区（仅在裁剪模式启用时可用） -->
        <button :disabled="!cropper.isCropping.value" @click="cropper.getCroppedImage">
          💾 保存选区
        </button>
        <!-- 分页按钮 -->
        <button 
          @click="pagination.prevPage" 
          :disabled="pagination.currentPage.value === 1" 
          title="前一页 (键盘: ← 左箭头)"
        >
          ⬅️ 前一页
        </button>
        <!-- 页码显示 -->
        <span class="page-indicator">{{ pagination.currentPage.value }} / {{ pagination.totalPages.value }}</span>
        <!-- 下一页按钮 -->
        <button 
          @click="pagination.nextPage" 
          :disabled="pagination.currentPage.value === pagination.totalPages.value" 
          title="下一页 (键盘: → 右箭头)"
        >
          下一页 ➡️
        </button>
      </div>
    </div>

    <!-- ==================== 主图片查看区域 ==================== -->
    <!-- @contextmenu.prevent: 禁用默认右键菜单，自定义右键行为 -->
    <div class="viewer-container" @contextmenu.prevent="cropper.handleRightClick">
      <!-- 图片包装层 -->
      <div class="img-wrapper">
        <!-- 漫画当前页图片（ref绑定用于Cropper初始化） -->
        <img ref="imageRef" :src="currentMangaPage" alt="Manga Page" />
      </div>
    </div>

    <!-- ==================== 预览条区域 ==================== -->
    <!-- v-if: 仅当有裁剪图片时显示 -->
    <div v-if="cropper.croppedList.value.length > 0" class="preview-bar">
      <!-- 预览信息文本 -->
      <span>裁剪预览({{ cropper.croppedList.value.length }}) - 点击图片可放大：</span>
      <!-- 预览图片列表 -->
      <div class="preview-list">
        <!-- 循环渲染所有裁剪的图片缩略图，点击打开灯箱 -->
        <img 
          v-for="(item, index) in cropper.croppedList.value" 
          :key="index" 
          :src="item" 
          alt="Preview" 
          @click="lightbox.openLightbox(index)"
        />
      </div>
    </div>

    <!-- ==================== 目录侧边栏 ==================== -->
    <!-- 目录面板（从左侧滑出） -->
    <div v-if="sidebar.showContents.value" class="sidebar contents-sidebar">
      <!-- 目录头部 -->
      <div class="sidebar-header">
        <h3>📖 目录</h3>
        <button class="close-sidebar-btn" @click="sidebar.toggleContents">✕</button>
      </div>
      <!-- 目录内容列表 -->
      <div class="sidebar-content">
        <ul class="contents-list">
          <li 
            v-for="(content, index) in sidebar.contentsList.value" 
            :key="index"
            class="contents-item"
            @click="sidebar.selectContent(content)"
          >
            {{ content.title }}
          </li>
        </ul>
      </div>
    </div>

    <!-- ==================== 漫画列表侧边栏 ==================== -->
    <!-- 漫画列表面板（从左侧滑出） -->
    <div v-if="sidebar.showMangaList.value" class="sidebar manga-list-sidebar">
      <!-- 漫画列表头部 -->
      <div class="sidebar-header">
        <h3>📚 漫画列表</h3>
        <button class="close-sidebar-btn" @click="sidebar.toggleMangaList">✕</button>
      </div>
      <!-- 漫画列表内容 -->
      <div class="sidebar-content">
        <ul class="manga-list">
          <li 
            v-for="manga in sidebar.mangaList.value" 
            :key="manga.id"
            class="manga-item"
            @click="sidebar.selectManga(manga)"
          >
            <div class="manga-title">{{ manga.title }}</div>
          </li>
        </ul>
      </div>
    </div>

    <!-- ==================== 阅读历史侧边栏 ==================== -->
    <!-- 历史记录面板（从左侧滑出） -->
    <div v-if="sidebar.showHistory.value" class="sidebar history-sidebar">
      <!-- 历史记录头部 -->
      <div class="sidebar-header">
        <h3>⏱️ 阅读历史</h3>
        <button class="close-sidebar-btn" @click="sidebar.toggleHistory">✕</button>
      </div>
      <!-- 历史记录内容 -->
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
        <button class="clear-btn" @click="sidebar.clearHistory">🗑️ 清空历史</button>
      </div>
    </div>

    <!-- ==================== 灯箱遮罩（防止点击侧边栏外）==================== -->
    <!-- 当侧边栏打开时，点击遮罩关闭侧边栏 -->
    <div 
      v-if="sidebar.showContents.value || sidebar.showMangaList.value || sidebar.showHistory.value" 
      class="sidebar-overlay"
      @click="sidebar.showContents.value = false; sidebar.showMangaList.value = false; sidebar.showHistory.value = false"
    ></div>

    <!-- ==================== 图片缓存设置面板 ==================== -->
    <!-- 缓存设置弹窗（模态对话框） -->
    <div v-if="imageCache.showCacheSettings.value" class="cache-settings-modal">
      <!-- 背景遮罩 -->
      <div class="cache-settings-overlay" @click="imageCache.showCacheSettings.value = false"></div>
      
      <!-- 设置面板内容 -->
      <div class="cache-settings-panel">
        <div class="cache-settings-header">
          <h3>⚙️ 图片缓存设置</h3>
          <button class="close-btn" @click="imageCache.showCacheSettings.value = false" title="关闭">✕</button>
        </div>
        
        <div class="cache-settings-body">
          <!-- 预取数量设置 -->
          <div class="setting-item">
            <label for="prefetches">预取图片数量：</label>
            <input 
              id="prefetches"
              type="number" 
              v-model.number="imageCache.prefetchCountSetting.value" 
              min="1" 
              max="20"
              class="setting-input"
            />
            <span class="setting-hint">（1-20张）</span>
          </div>
          
          <!-- 最大缓存数设置 -->
          <div class="setting-item">
            <label for="maxcache">最大缓存数量：</label>
            <input 
              id="maxcache"
              type="number" 
              v-model.number="imageCache.maxCacheSizeSetting.value" 
              :min="imageCache.prefetchCountSetting.value"
              max="100"
              class="setting-input"
            />
            <span class="setting-hint">（{{ imageCache.prefetchCountSetting.value }}-100张）</span>
          </div>
          
          <!-- 缓存统计信息 -->
          <div class="cache-status">
            <p>缓存图片数：<strong>{{ imageCache.imageCacheQueue.value.length }} / {{ imageCache.maxCacheSizeSetting.value }}</strong> 张</p>
            <p>内存占用：<strong>{{ (imageCache.cacheSizeInBytes.value / 1024 / 1024).toFixed(2) }}</strong> MB</p>
            <div class="cache-progress">
              <div class="progress-bar" :style="{ width: (imageCache.imageCacheQueue.value.length / imageCache.maxCacheSizeSetting.value * 100) + '%' }"></div>
            </div>
          </div>
        </div>
        
        <div class="cache-settings-footer">
          <button class="btn-primary" @click="imageCache.saveCacheSettings(pagination.currentPage.value, pagination.totalPages.value)">保存设置</button>
          <button class="btn-secondary" @click="imageCache.showCacheSettings.value = false">取消</button>
        </div>
      </div>
    </div>

    <!-- ==================== 灯箱（全屏预览）区域 ==================== -->
    <!-- v-if: 仅当灯箱打开时显示 -->
    <!-- @click.self: 点击黑色背景关闭灯箱（不会误触内容） -->
    <div v-if="lightbox.showLightbox.value" class="lightbox-overlay" @click.self="lightbox.closeLightbox">
      <!-- 关闭按钮 -->
      <button class="close-btn" @click="lightbox.closeLightbox">✕</button>
      
      <!-- 上一张按钮 -->
      <button class="nav-btn prev-btn" @click="lightbox.prevPreview">❮</button>
      
      <!-- 灯箱内容（大图 + 页码） -->
      <div class="lightbox-content">
        <!-- 当前预览的大图 -->
        <img :src="cropper.croppedList.value[lightbox.activePreviewIndex.value]" alt="Enlarged Preview" />
        <!-- 页码计数器 -->
        <div class="lightbox-counter">
          {{ lightbox.activePreviewIndex.value + 1 }} / {{ cropper.croppedList.value.length }}
        </div>
      </div>
      
      <!-- 下一张按钮 -->
      <button class="nav-btn next-btn" @click="lightbox.nextPreview">❯</button>
    </div>
  </div>
</template>

<style scoped>
/* ==================== 全局容器样式 ==================== */
.manga-app {
  /* 弹性布局，纵向排列 */
  display: flex;
  flex-direction: column;
  /* 占满整个视口高度 */
  height: 100vh;
  /* 深色主题背景 */
  background-color: #1a1a1a;
  /* 文字颜色 */
  color: #fff;
}

/* ==================== 工具栏样式 ==================== */
.toolbar {
  /* 弹性布局 */
  display: flex;
  /* 项目之间平均分配空间 */
  justify-content: space-between;
  /* 垂直居中 */
  align-items: center;
  /* 内部间距 */
  padding: 10px 20px;
  /* 工具栏背景色 */
  background-color: #2c2c2c;
  /* 工具栏下边框 */
  border-bottom: 1px solid #3c3c3c;
  /* 换行处理 */
  flex-wrap: wrap;
  /* 如果空间不足，项目会缩小 */
  gap: 15px;
}

/* ==================== 按钮组样式 ==================== */
.group {
  /* 弹性布局，横向排列 */
  display: flex;
  /* 按钮间距 */
  gap: 10px;
}

/* ==================== 通用按钮样式 ==================== */
button {
  /* 深色按钮背景 */
  background-color: #3a3a3a;
  /* 白色文字 */
  color: white;
  /* 移除默认边框 */
  border: none;
  /* 按钮内间距 */
  padding: 6px 12px;
  /* 圆角 */
  border-radius: 4px;
  /* 鼠标指针 */
  cursor: pointer;
  /* 背景色平滑过渡 */
  transition: background 0.2s;
  /* 禁止文字选择 */
  user-select: none;
}

/* 按钮悬停效果 */
button:hover {
  /* 悬停时变亮 */
  background-color: #4a4a4a;
}

/* 激活状态（裁剪模式打开时） */
button.active {
  /* VS Code蓝色 */
  background-color: #007acc;
}

/* 禁用状态（裁剪模式关闭时"保存"按钮） */
button:disabled {
  /* 半透明显示禁用状态 */
  opacity: 0.5;
  /* 禁用光标 */
  cursor: not-allowed;
}

/* ==================== 页码指示器 ==================== */
.page-indicator {
  /* 文字颜色 */
  color: #aaa;
  /* 字体大小 */
  font-size: 14px;
  /* 水平内间距 */
  padding: 0 10px;
  /* 垂直居中对齐 */
  align-self: center;
}

/* ==================== 图片查看区样式 ==================== */
.viewer-container {
  /* 占据剩余空间 */
  flex: 1;
  /* 超出部分隐藏 */
  overflow: hidden;
  /* 相对定位，用于灯箱定位 */
  position: relative;
  /* 居中显示图片 */
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 图片包装层 */
.img-wrapper {
  /* 尽可能占用容器空间 */
  width: 100%;
  height: 100%;
  /* 内部居中 */
  display: flex;
  justify-content: center;
  align-items: center;
}

/* ==================== 图片通用样式 ==================== */
img {
  /* 块级元素 */
  display: block;
  /* 图片响应式尺寸 */
  max-width: 100%;
}

/* ==================== 预览条样式 ==================== */
.preview-bar {
  /* 预览条高度 */
  height: 120px;
  /* 深色背景 */
  background-color: #222;
  /* 弹性布局 */
  display: flex;
  flex-direction: column;
  /* 垂直居中 */
  justify-content: center;
  /* 内容左对齐 */
  align-items: flex-start;
  /* 内间距 */
  padding: 10px 20px;
  /* 上边框 */
  border-top: 1px solid #3c3c3c;
}

/* 预览条文本样式 */
.preview-bar span {
  /* 小字体 */
  font-size: 12px;
  /* 灰色文字 */
  color: #aaa;
  /* 下间距 */
  margin-bottom: 5px;
}

/* ==================== 预览图片列表样式 ==================== */
.preview-list {
  /* 横向排列 */
  display: flex;
  /* 图片间距 */
  gap: 10px;
  /* 占满容器宽度 */
  width: 100%;
  /* 溢出时可水平滚动 */
  overflow-x: auto;
}

/* 预览缩略图样式 */
.preview-list img {
  /* 缩略图高度 */
  height: 70px;
  /* 边框 */
  border: 1px solid #555;
  /* 圆角 */
  border-radius: 4px;
  /* 背景色 */
  background-color: #000;
  /* 鼠标指针变为小手，提示可点击 */
  cursor: pointer;
  /* 平滑过渡变换和边框色 */
  transition: transform 0.2s, border-color 0.2s;
}

/* 缩略图悬停效果 */
.preview-list img:hover {
  /* 轻微放大，增加交互感 */
  transform: scale(1.05);
  /* 边框变为蓝色 */
  border-color: #007acc;
}

/* ==================== 侧边栏通用样式 ==================== */
/* 侧边栏容器 */
.sidebar {
  /* 固定定位 */
  position: fixed;
  /* 左侧边 */
  left: 0;
  /* 从顶部开始 */
  top: 0;
  /* 占满视口高度 */
  height: 100vh;
  /* 宽度 */
  width: 320px;
  /* 深色背景 */
  background-color: #1e1e1e;
  /* 阴影效果 */
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.5);
  /* 动画过渡 */
  transition: transform 0.3s ease;
  /* 确保在灯箱下方 */
  z-index: 100;
  /* 溢出隐藏 */
  overflow-y: auto;
  /* 滑入动画 */
  transform: translateX(0);
}

/* 侧边栏滑出动画 */
.sidebar.contents-sidebar,
.sidebar.manga-list-sidebar {
  /* 从左侧滑入 */
  animation: slideIn 0.3s ease;
}

/* 滑入关键帧 */
@keyframes slideIn {
  from {
    /* 开始时在屏幕外 */
    transform: translateX(-100%);
  }
  to {
    /* 最终在屏幕内 */
    transform: translateX(0);
  }
}

/* ==================== 侧边栏头部样式 ==================== */
.sidebar-header {
  /* 弹性布局 */
  display: flex;
  /* 两端对齐 */
  justify-content: space-between;
  /* 垂直居中 */
  align-items: center;
  /* 内间距 */
  padding: 15px;
  /* 底部边框 */
  border-bottom: 1px solid #333;
  /* 背景色深一点 */
  background-color: #2c2c2c;
  /* 顶部粘性定位 */
  position: sticky;
  top: 0;
  /* 确保在顶层 */
  z-index: 101;
}

/* 侧边栏标题 */
.sidebar-header h3 {
  /* 外间距清零 */
  margin: 0;
  /* 文字大小 */
  font-size: 16px;
  /* 文字色 */
  color: #fff;
}

/* 关闭侧边栏按钮 */
.close-sidebar-btn {
  /* 透明背景 */
  background-color: transparent;
  /* 文字颜色 */
  color: #aaa;
  /* 边框 */
  border: none;
  /* 内间距 */
  padding: 4px 8px;
  /* 字体大小 */
  font-size: 18px;
  /* 光标 */
  cursor: pointer;
  /* 过渡 */
  transition: color 0.2s;
}

/* 关闭按钮悬停 */
.close-sidebar-btn:hover {
  /* 变亮 */
  color: #fff;
}

/* ==================== 侧边栏内容区域 ==================== */
.sidebar-content {
  /* 内间距 */
  padding: 10px 0;
  /* 允许内部滚动 */
  overflow-y: auto;
  /* 计算高度：总高度 - 头部(60px) - 可能的底部按钮(60px) */
  /* 使用 max 函数确保最小高度 */
  height: calc(100vh - 60px);
  /* 防止出现过大的滚动区域 */
  max-height: 100%;
}

/* ==================== 目录列表样式 ==================== */
.contents-list {
  /* 清除列表默认样式 */
  list-style: none;
  /* 外间距 */
  margin: 0;
  /* 内间距 */
  padding: 0;
}

/* 目录项 */
.contents-item {
  /* 内间距 */
  padding: 12px 15px;
  /* 文字颜色 */
  color: #bbb;
  /* 光标 */
  cursor: pointer;
  /* 边框分隔线 */
  border-bottom: 1px solid #333;
  /* 过渡 */
  transition: background-color 0.2s, color 0.2s;
}

/* 目录项悬停效果 */
.contents-item:hover {
  /* 背景色变亮 */
  background-color: #333;
  /* 文字色变白 */
  color: #fff;
  /* 加底线 */
  border-left: 3px solid #007acc;
  /* 调整内间距以适应边框 */
  padding-left: 12px;
}

/* ==================== 漫画列表样式 ==================== */
.manga-list {
  /* 清除列表默认样式 */
  list-style: none;
  /* 外间距 */
  margin: 0;
  /* 内间距 */
  padding: 0;
}

/* 漫画项 */
.manga-item {
  /* 内间距 */
  padding: 15px;
  /* 边框分隔线 */
  border-bottom: 1px solid #333;
  /* 光标 */
  cursor: pointer;
  /* 过渡 */
  transition: background-color 0.2s;
}

/* 漫画项悬停效果 */
.manga-item:hover {
  /* 背景色变亮 */
  background-color: #333;
}

/* 漫画标题 */
.manga-title {
  /* 文字颜色 */
  color: #fff;
  /* 字体大小 */
  font-size: 14px;
  /* 字体加粗 */
  font-weight: 500;
  /* 下间距 */
  margin-bottom: 5px;
}

/* ==================== 阅读历史列表样式 ==================== */
.history-list {
  /* 占满容器 */
  width: 100%;
  /* 列表项布局 */
  display: flex;
  flex-direction: column;
}

/* 历史项 */
.history-item {
  /* 内间距 */
  padding: 12px 15px;
  /* 边框分隔线 */
  border-bottom: 1px solid #333;
  /* 光标 */
  cursor: pointer;
  /* 过渡 */
  transition: background-color 0.2s;
}

/* 历史项悬停效果 */
.history-item:hover {
  /* 背景色变亮 */
  background-color: #333;
  /* 加左边蓝线 */
  border-left: 3px solid #007acc;
  /* 调整内间距 */
  padding-left: 12px;
}

/* 历史标题 */
.history-title {
  /* 白色文字 */
  color: #fff;
  /* 字体大小 */
  font-size: 14px;
  /* 字体加粗 */
  font-weight: 500;
  /* 下间距 */
  margin-bottom: 4px;
}

/* 历史元数据（章节+页码） */
.history-meta {
  /* 灰色文字 */
  color: #bbb;
  /* 小字体 */
  font-size: 12px;
  /* 下间距 */
  margin-bottom: 3px;
}

/* 历史时间 */
.history-time {
  /* 深灰色文字 */
  color: #888;
  /* 最小字体 */
  font-size: 11px;
}

/* 空状态提示 */
.empty-message {
  /* 文字居中 */
  text-align: center;
  /* 内间距 */
  padding: 40px 20px;
  /* 灰色文字 */
  color: #666;
  /* 字体大小 */
  font-size: 14px;
}

/* ==================== 侧边栏底部按钮 ==================== */
.sidebar-footer {
  /* 粘性定位在底部 */
  position: sticky;
  bottom: 0;
  /* 内间距 */
  padding: 15px;
  /* 背景色 */
  background-color: #2c2c2c;
  /* 顶部边框 */
  border-top: 1px solid #333;
}

/* 清空按钮 */
.clear-btn {
  /* 占满宽度 */
  width: 100%;
  /* 内间距 */
  padding: 10px;
  /* 背景色 */
  background-color: #3a3a3a;
  /* 文字颜色 */
  color: #fff;
  /* 边框 */
  border: none;
  /* 圆角 */
  border-radius: 4px;
  /* 光标 */
  cursor: pointer;
  /* 过渡 */
  transition: background-color 0.2s;
}

/* 清空按钮悬停 */
.clear-btn:hover {
  /* 变亮 */
  background-color: #4a4a4a;
}

/* ==================== 侧边栏遮罩 ==================== */
.sidebar-overlay {
  /* 固定定位，覆盖整个视口 */
  position: fixed;
  top: 0;
  /* 从侧边栏右侧开始，不覆盖侧边栏和图片区域左侧 */
  left: 320px;
  /* 宽度和高度覆盖右侧区域 */
  right: 0;
  height: 100vh;
  /* 透明背景（用于点击关闭） */
  background-color: rgba(0, 0, 0, 0.3);
  /* 低于侧边栏，用于关闭侧边栏时的点击 */
  z-index: 98;
  /* 允许接收点击事件 */
  pointer-events: auto;
}

/* ==================== 缓存设置面板样式 ==================== */
.cache-settings-modal {
  /* 固定定位，覆盖整个视口 */
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  /* 居中显示 */
  display: flex;
  justify-content: center;
  align-items: center;
  /* 高 z-index */
  z-index: 500;
}

.cache-settings-overlay {
  /* 覆盖背景 */
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* 半透明黑色背景 */
  background-color: rgba(0, 0, 0, 0.5);
  /* 允许点击关闭 */
  cursor: pointer;
}

.cache-settings-panel {
  /* 相对定位 */
  position: relative;
  /* 面板宽度 */
  width: 90%;
  max-width: 500px;
  /* 内容容器 */
  background-color: #2c2c2c;
  /* 边框 */
  border: 1px solid #3c3c3c;
  /* 圆角 */
  border-radius: 8px;
  /* 阴影 */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.7);
  /* 内间距 */
  padding: 0;
  /* z-index */
  z-index: 501;
}

.cache-settings-header {
  /* 头部样式 */
  padding: 20px;
  /* 底部边框 */
  border-bottom: 1px solid #3c3c3c;
  /* 弹性布局 */
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cache-settings-header h3 {
  /* 清除默认间距 */
  margin: 0;
  /* 颜色和大小 */
  color: #fff;
  font-size: 16px;
}

.cache-settings-header .close-btn {
  /* 透明背景 */
  background-color: transparent;
  /* 颜色 */
  color: #aaa;
  /* 边框 */
  border: none;
  /* 内间距 */
  padding: 4px 8px;
  /* 字体大小 */
  font-size: 20px;
  /* 光标 */
  cursor: pointer;
}

.cache-settings-header .close-btn:hover {
  /* 悬停时的颜色 */
  color: #fff;
}

.cache-settings-body {
  /* 内间距 */
  padding: 20px;
}

.setting-item {
  /* 下间距 */
  margin-bottom: 20px;
  /* 弹性布局 */
  display: flex;
  flex-direction: column;
}

.setting-item label {
  /* 文字颜色 */
  color: #bbb;
  /* 下间距 */
  margin-bottom: 5px;
  /* 字体大小 */
  font-size: 14px;
}

.setting-input {
  /* 背景色 */
  background-color: #1a1a1a;
  /* 文字颜色 */
  color: #fff;
  /* 边框 */
  border: 1px solid #3c3c3c;
  /* 内间距 */
  padding: 8px;
  /* 圆角 */
  border-radius: 4px;
  /* 字体大小 */
  font-size: 14px;
  /* 过渡 */
  transition: border-color 0.2s;
}

.setting-input:focus {
  /* 焦点时的边框色 */
  border-color: #007acc;
  /* 移除默认轮廓 */
  outline: none;
}

.setting-hint {
  /* 灰色文字 */
  color: #888;
  /* 小字体 */
  font-size: 12px;
  /* 上间距 */
  margin-top: 3px;
}

.cache-status {
  /* 边框 */
  border: 1px solid #3c3c3c;
  /* 内间距 */
  padding: 15px;
  /* 圆角 */
  border-radius: 4px;
  /* 背景色 */
  background-color: #1a1a1a;
}

.cache-status p {
  /* 外间距 */
  margin: 0 0 10px 0;
  /* 颜色 */
  color: #bbb;
  /* 字体大小 */
  font-size: 14px;
}

.cache-status strong {
  /* 白色 */
  color: #fff;
}

.cache-progress {
  /* 进度条容器 */
  width: 100%;
  height: 6px;
  /* 背景色 */
  background-color: #333;
  /* 圆角 */
  border-radius: 3px;
  /* 溢出隐藏 */
  overflow: hidden;
  /* 上间距 */
  margin-top: 10px;
}

.progress-bar {
  /* 高度 */
  height: 100%;
  /* 背景色 */
  background-color: #007acc;
  /* 过渡 */
  transition: width 0.3s ease;
}

.cache-settings-footer {
  /* 弹性布局 */
  padding: 20px;
  border-top: 1px solid #3c3c3c;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-primary, .btn-secondary {
  /* 内间距 */
  padding: 8px 16px;
  /* 边框 */
  border: none;
  /* 圆角 */
  border-radius: 4px;
  /* 字体大小 */
  font-size: 14px;
  /* 光标 */
  cursor: pointer;
  /* 过渡 */
  transition: background-color 0.2s;
}

.btn-primary {
  /* 背景色 */
  background-color: #007acc;
  /* 文字颜色 */
  color: #fff;
}

.btn-primary:hover {
  /* 悬停时变亮 */
  background-color: #005a9e;
}

.btn-secondary {
  /* 背景色 */
  background-color: #3a3a3a;
  /* 文字颜色 */
  color: #fff;
}

.btn-secondary:hover {
  /* 悬停时变亮 */
  background-color: #4a4a4a;
}

/* ==================== 灯箱（全屏预览）样式 ==================== */
/* 灯箱遮罩/背景层 */
.lightbox-overlay {
  /* 固定定位，覆盖整个视口 */
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  /* 黑色半透明背景（90%不透明） */
  background-color: rgba(0, 0, 0, 0.9);
  /* 居中显示内容 */
  display: flex;
  justify-content: center;
  align-items: center;
  /* 确保在最顶层 */
  z-index: 999;
}

/* 灯箱内容容器 */
.lightbox-content {
  /* 相对定位，用于页码定位 */
  position: relative;
  /* 限制最大尺寸 */
  max-width: 80%;
  max-height: 85%;
  /* 垂直排列：图片 + 页码 */
  display: flex;
  flex-direction: column;
  /* 内容居中 */
  align-items: center;
}

/* 灯箱中的大图 */
.lightbox-content img {
  /* 响应式宽度 */
  max-width: 100%;
  /* 最大高度（视口80%） */
  max-height: 80vh;
  /* 边框 */
  border: 1px solid #444;
  /* 圆角 */
  border-radius: 4px;
  /* 阴影效果 */
  box-shadow: 0 0 20px rgba(0,0,0,0.5);
}

/* 页码计数器 */
.lightbox-counter {
  /* 与图片的间距 */
  margin-top: 10px;
  /* 灰色文字 */
  color: #aaa;
  /* 小字体 */
  font-size: 14px;
  /* 半透明黑色背景 */
  background: rgba(0,0,0,0.6);
  /* 内间距 */
  padding: 3px 10px;
  /* 胶囊形圆角 */
  border-radius: 10px;
}

/* ==================== 灯箱控制按钮样式 ==================== */
/* 关闭按钮 + 导航按钮通用样式 */
.close-btn, .nav-btn {
  /* 绝对定位 */
  position: absolute;
  /* 透明白色背景 */
  background: rgba(255, 255, 255, 0.1);
  /* 白色文字 */
  color: white;
  /* 边框 */
  border: 1px solid rgba(255, 255, 255, 0.3);
  /* 内间距 */
  padding: 10px 15px;
  /* 圆角 */
  border-radius: 4px;
  /* 字体大小 */
  font-size: 16px;
  /* 光标 */
  cursor: pointer;
  /* 过渡 */
  transition: background 0.2s, border-color 0.2s;
  /* 防止文字选择 */
  user-select: none;
}

/* 按钮悬停效果 */
.close-btn:hover, .nav-btn:hover {
  /* 悬停时的背景 */
  background: rgba(255, 255, 255, 0.2);
  /* 悬停时的边框 */
  border-color: rgba(255, 255, 255, 0.5);
}

/* 关闭按钮位置 */
.close-btn {
  /* 右上角 */
  top: 20px;
  right: 20px;
}

/* 导航按钮通用位置（垂直居中） */
.nav-btn {
  /* 垂直居中 */
  top: 50%;
  /* 向上移动按钮高度的一半 */
  transform: translateY(-50%);
  /* 左右按钮的 z-index 要高于灯箱内容 */
  z-index: 1001;
}

/* 上一张按钮位置 */
.prev-btn {
  /* 左侧 */
  left: 20px;
}

/* 下一张按钮位置 */
.next-btn {
  /* 右侧 */
  right: 20px;
}
</style>
