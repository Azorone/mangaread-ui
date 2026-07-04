import { ref } from 'vue'

export function useSidebar(mangaSet, pagination) {
  const showContents = ref(false)
  const showMangaList = ref(false)
  const showHistory = ref(false)
  const mangaList = ref([])
  const chapterList = ref([])
  const historyList = ref([])

  const initSidebar = async () => {
    mangaList.value = mangaSet.mangaSet.value.map((manga) => manga.name)
    try {
      if (
        mangaSet.mangaSet.value.length > 0 &&
        mangaSet.MangaIndex.value < mangaSet.mangaSet.value.length
      ) {
        chapterList.value = mangaSet.mangaSet.value[mangaSet.MangaIndex.value].chapters.map(
          (chapter) => chapter.name
        )
      } else {
        chapterList.value = []
      }
    } catch {
      chapterList.value = []
    }
    historyList.value = mangaSet.HistoryList.value
  }

  const toggleContents = () => {
    showContents.value = !showContents.value
    if (showContents.value) {
      showMangaList.value = false
      showHistory.value = false
    }
  }

  const toggleMangaList = () => {
    showMangaList.value = !showMangaList.value
    if (showMangaList.value) {
      showContents.value = false
      showHistory.value = false
    }
  }

  const toggleHistory = async () => {
    showHistory.value = !showHistory.value
    if (showHistory.value) {
      showContents.value = false
      showMangaList.value = false
    }
    if (showHistory.value) {
      await mangaSet.fetchHistoryData()
      historyList.value = mangaSet.HistoryList.value
    }
  }

  const selectContent = async (chapter) => {
    mangaSet.switchChapter(chapter)
    await initSidebar()
    pagination.initializePagination()
    pagination.syncPage()
    mangaSet.saveCurrentHistory()
  }

  const selectManga = async (manga) => {
    mangaSet.switchComic(manga)
    await initSidebar()
    pagination.initializePagination()
  }

  const refreshMangaList = async () => {
    await mangaSet.initializeMangaSet()
    await initSidebar()
    pagination.initializePagination()
  }

  const selectHistory = async (item) => {
    const result = mangaSet.jumpToHistory(item)
    if (result) {
      await initSidebar()
      pagination.initializePagination()
      pagination.syncPage()
      await mangaSet.saveCurrentHistory()
      showHistory.value = false
    }
  }

  const addHistory = () => {
    mangaSet.saveCurrentHistory()
  }

  const clearHistory = async () => {
    try {
      await window.api.saveHistory([])
      mangaSet.HistoryList.value = []
      historyList.value = []
    } catch (error) {
      console.error('清空历史记录失败:', error)
    }
  }

  return {
    showContents,
    showMangaList,
    showHistory,
    toggleContents,
    toggleMangaList,
    toggleHistory,
    selectContent,
    selectManga,
    selectHistory,
    addHistory,
    clearHistory,
    mangaList,
    chapterList,
    historyList,
    initSidebar,
    refreshMangaList
  }
}
