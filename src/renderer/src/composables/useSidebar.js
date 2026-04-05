import { ref } from 'vue';

/**
 * 侧边栏管理composable
 * 负责侧边栏菜单、漫画列表、章节列表、历史记录
 */
export function useSidebar(imageCache, pagination) {
  // ========================
  // 侧边栏显示状态
  // ========================
  const showContents = ref(false);
  const showMangaList = ref(false);
  const showHistory = ref(false);

  // ========================
  // 数据列表
  // ========================
  const mangaList = ref([
    { id: 1, title: '漫画 1' },
    { id: 2, title: '漫画 2' },
    { id: 3, title: '漫画 3' },
    { id: 4, title: '漫画 4' },
    { id: 5, title: '漫画 5' }
  ]);

  const contentsList = ref([
    { id: 1, title: '第一章', startPage: 1 },
    { id: 2, title: '第二章', startPage: 15 },
    { id: 3, title: '第三章', startPage: 30 },
    { id: 4, title: '第四章', startPage: 45 },
    { id: 5, title: '第五章', startPage: 60 }
  ]);

  const historyList = ref([]);

  // ========================
  // 侧边栏切换
  // ========================
  const toggleContents = () => {
    showContents.value = !showContents.value;
    if (showContents.value) {
      showMangaList.value = false;
      showHistory.value = false;
    }
  };

  const toggleMangaList = () => {
    showMangaList.value = !showMangaList.value;
    if (showMangaList.value) {
      showContents.value = false;
      showHistory.value = false;
    }
  };

  const toggleHistory = () => {
    showHistory.value = !showHistory.value;
    if (showHistory.value) {
      showContents.value = false;
      showMangaList.value = false;
    }
  };

  // ========================
  // 页面选择和导航
  // ========================
  const selectContent = async (content) => {
    pagination.currentPage.value = content.startPage;
    showContents.value = false;
    addHistory(imageCache.currentMangaId.value, content.startPage);
    await pagination.loadPageFromCache();
  };

  const selectManga = async (manga) => {
    imageCache.currentMangaId.value = manga.id;
    pagination.currentPage.value = 1;
    showMangaList.value = false;
    
    const imageList = await imageCache.fetchMangaImageList(manga.id);
    pagination.totalPages.value = imageList.length;
    
    addHistory(manga.id, 1);
    await pagination.loadPageFromCache();
  };

  const selectHistory = async (item) => {
    imageCache.currentMangaId.value = item.mangaId;
    pagination.currentPage.value = item.page;
    showHistory.value = false;
    await pagination.loadPageFromCache();
  };

  // ========================
  // 历史记录管理
  // ========================
  const addHistory = (mangaId, page) => {
    const existingIndex = historyList.value.findIndex(
      h => h.mangaId === mangaId && h.page === page
    );
    
    if (existingIndex !== -1) {
      historyList.value.splice(existingIndex, 1);
    }
    
    const manga = mangaList.value.find(m => m.id === mangaId);
    historyList.value.unshift({
      mangaId: mangaId,
      page: page,
      mangaTitle: manga ? manga.title : '未知漫画',
      timestamp: new Date().toLocaleTimeString()
    });
    
    if (historyList.value.length > 20) {
      historyList.value.pop();
    }
  };

  const clearHistory = () => {
    historyList.value = [];
  };

  return {
    // 显示状态
    showContents,
    showMangaList,
    showHistory,
    // 数据列表
    mangaList,
    contentsList,
    historyList,
    // 切换方法
    toggleContents,
    toggleMangaList,
    toggleHistory,
    // 导航方法
    selectContent,
    selectManga,
    selectHistory,
    // 历史记录方法
    addHistory,
    clearHistory
  };
}
