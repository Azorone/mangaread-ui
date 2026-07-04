import { ref } from 'vue'

export function usePagination(mangaSet) {
  const currentPage = ref(1)
  const totalPages = ref(100)

  const initializePagination = async () => {
    try {
      if (mangaSet.mangaSet.value.length === 0) {
        totalPages.value = 0
        currentPage.value = 0
        return
      }
      if (mangaSet.MangaIndex.value >= mangaSet.mangaSet.value.length) {
        mangaSet.MangaIndex.value = 0
      }
      const manga = mangaSet.mangaSet.value[mangaSet.MangaIndex.value]
      if (!manga || !manga.chapters) {
        totalPages.value = 0
        currentPage.value = 0
        return
      }
      let totalImages = 0
      for (const ch of manga.chapters) {
        totalImages += (ch.images || []).length
      }
      totalPages.value = totalImages
      currentPage.value = mangaSet.PageIndex.value + 1
    } catch (error) {
      console.error('初始化分页失败:', error)
    }
  }

  const syncPage = () => {
    let offset = 0
    try {
      const manga = mangaSet.mangaSet.value[mangaSet.MangaIndex.value]
      if (!manga || !manga.chapters) return
      for (let i = 0; i < mangaSet.ChapterIndex.value; i++) {
        offset += (manga.chapters[i].images || []).length
      }
      currentPage.value = offset + mangaSet.PageIndex.value + 1
    } catch {
      currentPage.value = 1
    }
  }

  const prevPage = () => {
    mangaSet.switchPage(-1)
    syncPage()
    mangaSet.saveCurrentHistory()
  }

  const nextPage = () => {
    mangaSet.switchPage(1)
    syncPage()
    mangaSet.saveCurrentHistory()
  }

  /**
   * 从输入框跳转到指定页码
   * 由 ToolbarRightGroup 的页码输入框调用
   * 实际跳转逻辑委托给 imageDisplay.jumpToPage
   */
  let jumpToPageExternal = null

  const registerJumpHandler = (handler) => {
    jumpToPageExternal = handler
  }

  const jumpToPageViaInput = async (targetPage) => {
    if (jumpToPageExternal) {
      await jumpToPageExternal(targetPage)
    }
  }

  return {
    currentPage,
    totalPages,
    prevPage,
    nextPage,
    initializePagination,
    syncPage,
    registerJumpHandler,
    jumpToPageViaInput
  }
}
