import { initCustomFormatter, ref } from 'vue';

/**
 * 侧边栏管理composable
 * 负责侧边栏菜单、漫画列表、章节列表、历史记录
 */
export function useSidebar(mangaSet, pagination) {
  // ========================
  // 侧边栏显示状态
  // ========================
  const showContents = ref(false);
  const showMangaList = ref(false);
  const showHistory = ref(false);
  const mangaList = ref([]);
  const chapterList = ref([]);
  const historyList = ref([]);
  // ========================
  // 数据列表
  // ========================
 
  // ========================
  // 侧边栏切换
  // ========================
  const initSidebar=async ()=>{ 
    mangaList.value = mangaSet.mangaSet.value.map(manga => manga.name);
    chapterList.value = mangaSet.mangaSet.value[mangaSet.MangaIndex.value].chapters.map(chapter => chapter.name);
  };  


  
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
  const selectContent = async (chapter) => {
    console.log(`选择章节 ${chapter}，加载页面列表`);
    mangaSet.switchChapter(chapter);
    initSidebar();
   
  };

  const selectManga = async (manga) => {
   console.log(`选择漫画 ${manga}，加载章节列表`);
   mangaSet.switchComic(manga);
   initSidebar();
   pagination.initializePagination();
  };
 const refreshMangaList = async () => {
   await mangaSet.initializeMangaSet();
    await initSidebar();
};
  const selectHistory = async (item) => {

  };

  // ========================
  // 历史记录管理
  // ========================
  const addHistory = (mangaId, page) => {
   
  };

  const clearHistory = () => {
    
  };

  return {
    // 显示状态
    showContents,
    showMangaList,
    showHistory,
    // 数据列表
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
    clearHistory,
    // 漫画列表方法
      mangaList,
      chapterList,
      historyList,
      initSidebar,
      refreshMangaList
  };
}
