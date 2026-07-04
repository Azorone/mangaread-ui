import { ref } from 'vue'

export function useMangaSet() {
  const mangaSet = ref([])
  const MangaIndex = ref(0)
  const ChapterIndex = ref(0)
  const PageIndex = ref(0)
  const HistoryList = ref([])
  let historyLoaded = false

  const fetchHistoryData = async () => {
    if (historyLoaded) return
    try {
      const history = await window.api.getHistory()
      HistoryList.value = Array.isArray(history) ? history : []
      historyLoaded = true
    } catch (error) {
      console.error('加载历史记录失败:', error)
      HistoryList.value = []
    }
  }

  const refreshHistory = async () => {
    try {
      const history = await window.api.getHistory()
      HistoryList.value = Array.isArray(history) ? history : []
    } catch (error) {
      console.error('刷新历史记录失败:', error)
    }
  }

  const saveCurrentHistory = async () => {
    if (mangaSet.value.length === 0) return
    if (MangaIndex.value >= mangaSet.value.length) return
    const manga = mangaSet.value[MangaIndex.value]
    if (!manga || !manga.chapters || ChapterIndex.value >= manga.chapters.length) return
    const chapter = manga.chapters[ChapterIndex.value]
    if (!chapter || !chapter.images || PageIndex.value >= chapter.images.length) return

    const entry = {
      manganame: manga.name,
      chaptername: chapter.name,
      pagename: chapter.images[PageIndex.value].name,
      pageindex: PageIndex.value,
      chapterindex: ChapterIndex.value,
      mangaindex: MangaIndex.value
    }
    try {
      const updatedHistory = await window.api.updateHistory(entry)
      HistoryList.value = Array.isArray(updatedHistory) ? updatedHistory : []
    } catch (error) {
      console.error('保存阅读历史失败:', error)
    }
  }

  const fetchMangaSetData = async () => {
    try {
      const structure = await window.api.getMangaStructure()
      mangaSet.value = structure.mangas || []
    } catch (error) {
      console.error('获取漫画结构数据失败:', error)
      mangaSet.value = []
    }
  }

  const initializeMangaSet = async () => {
    console.log('正在初始化漫画结构数据...')
    await fetchMangaSetData()
    await fetchHistoryData()
  }

  const getImagesUrl = (MangaIndex_, ChapterIndex_, PageIndex_) => {
    if (mangaSet.value.length === 0) return ''
    if (MangaIndex_ >= mangaSet.value.length) return ''
    const manga = mangaSet.value[MangaIndex_]
    if (!manga || !manga.chapters) return ''
    if (ChapterIndex_ >= manga.chapters.length) return ''
    const chapter = manga.chapters[ChapterIndex_]
    if (!chapter || !chapter.images) return ''
    if (PageIndex_ >= chapter.images.length) return ''
    return chapter.images[PageIndex_].path || ''
  }

  const findMangaIndex = (mangaName) => {
    for (let i = 0; i < mangaSet.value.length; i++) {
      if (mangaSet.value[i].name === mangaName) {
        return i
      }
    }
    return -1
  }

  const findChapterIndex = (chapterName) => {
    if (MangaIndex.value >= mangaSet.value.length) return -1
    const chapters = mangaSet.value[MangaIndex.value].chapters
    for (let i = 0; i < chapters.length; i++) {
      if (chapters[i].name === chapterName) {
        return i
      }
    }
    return -1
  }

  const switchComic = (mangaName) => {
    const index = findMangaIndex(mangaName)
    if (index === -1) return
    MangaIndex.value = index
    ChapterIndex.value = 0
    PageIndex.value = 0
    saveCurrentHistory()
  }

  const switchChapter = (chapterName) => {
    const index = findChapterIndex(chapterName)
    if (index === -1) return
    ChapterIndex.value = index
    PageIndex.value = 0
    saveCurrentHistory()
  }

  const switchPage = (num) => {
    if (mangaSet.value.length === 0) return
    if (MangaIndex.value >= mangaSet.value.length) return
    const chapters = mangaSet.value[MangaIndex.value].chapters
    if (!chapters || ChapterIndex.value >= chapters.length) return
    const images = chapters[ChapterIndex.value].images
    if (!images) return

    const newPage = PageIndex.value + num

    if (newPage < 0) {
      changeChapter(-1)
      return
    }
    if (newPage >= images.length) {
      changeChapter(1)
      return
    }
    PageIndex.value = newPage
  }

  const changeChapter = (num) => {
    if (mangaSet.value.length === 0) return
    if (MangaIndex.value >= mangaSet.value.length) return
    const chapters = mangaSet.value[MangaIndex.value].chapters
    if (!chapters) return

    const newChapter = ChapterIndex.value + num
    if (newChapter < 0 || newChapter >= chapters.length) {
      console.warn('章节索引超出范围')
      return
    }
    ChapterIndex.value = newChapter
    PageIndex.value = 0
  }

  const delManga = (mangaName) => {
    const index = findMangaIndex(mangaName)
    if (index !== -1) {
      mangaSet.value.splice(index, 1)
    }
  }

  const jumpToHistory = (item) => {
    const mangaIdx = findMangaIndex(item.manganame)
    if (mangaIdx === -1) return false

    MangaIndex.value = mangaIdx

    if (
      item.chapterindex !== undefined &&
      item.chapterindex < (mangaSet.value[mangaIdx].chapters || []).length
    ) {
      ChapterIndex.value = item.chapterindex
    } else {
      const chIdx = findChapterIndex(item.chaptername)
      if (chIdx !== -1) ChapterIndex.value = chIdx
    }

    if (item.pageindex !== undefined) {
      const chapters = mangaSet.value[mangaIdx].chapters
      if (ChapterIndex.value < (chapters || []).length) {
        const images = chapters[ChapterIndex.value].images || []
        if (item.pageindex < images.length) {
          PageIndex.value = item.pageindex
        } else {
          PageIndex.value = 0
        }
      }
    } else {
      PageIndex.value = 0
    }
    return true
  }

  return {
    switchChapter,
    changeChapter,
    switchPage,
    delManga,
    mangaSet,
    MangaIndex,
    ChapterIndex,
    PageIndex,
    HistoryList,
    fetchMangaSetData: fetchMangaSetData,
    fetchHistoryData,
    refreshHistory,
    initializeMangaSet,
    getImagesUrl,
    switchComic,
    saveCurrentHistory,
    jumpToHistory
  }
}
