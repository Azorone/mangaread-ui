import { nextTick } from 'vue'

/**
 * 图片显示管理 composable
 * 处理：图片自适应、长图滚动、跨章节页码跳转
 */
export function useImageDisplay(mangaSet, pagination, cropper) {
  /**
   * 在 cropper replace 完成后触发自适应
   * 使用指数退避重试，确保 cropper 就绪
   */
  const triggerFitToScreen = async () => {
    if (!cropper.cropper.value) return

    try {
      await nextTick()
      await new Promise((resolve) => setTimeout(resolve, 100))

      const tryFit = (retries = 3) => {
        if (retries <= 0) return false
        try {
          const containerData = cropper.cropper.value.getContainerData()
          const imageData = cropper.cropper.value.getImageData()
          if (
            containerData &&
            imageData &&
            containerData.width > 50 &&
            imageData.naturalWidth > 0
          ) {
            cropper.fitToScreen()
            return true
          }
        } catch {
          // cropper 可能还没就绪
        }
        // 延迟重试
        setTimeout(() => tryFit(retries - 1), 200)
        return false
      }

      tryFit()
    } catch {
      // 静默失败
    }
  }

  /**
   * 跳转到指定页码（1-indexed），自动跨章节计算
   * 保证：
   * 1. 索引安全（不越界）
   * 2. 历史数据保存
   * 3. 自适应触发
   * 4. 输入校验
   */
  const jumpToPage = async (targetPage) => {
    if (mangaSet.mangaSet.value.length === 0) return false

    const mangaIndex = mangaSet.MangaIndex.value
    const manga = mangaSet.mangaSet.value[mangaIndex]
    if (!manga || !manga.chapters) return false

    // 计算总页数
    let totalPages = 0
    for (const ch of manga.chapters) {
      totalPages += (ch.images || []).length
    }
    if (totalPages === 0) return false

    // 校验输入
    if (isNaN(targetPage) || targetPage === null || targetPage === undefined) {
      return false
    }

    // 钳制范围
    targetPage = Math.max(1, Math.min(targetPage, totalPages))
    if (targetPage === pagination.currentPage.value) return true // 相同页，不操作

    // 定位目标页码所在章节
    let accumulated = 0
    let targetChapterIndex = 0
    let targetPageIndex = 0

    for (let i = 0; i < manga.chapters.length; i++) {
      const count = (manga.chapters[i].images || []).length
      if (accumulated + count >= targetPage) {
        targetChapterIndex = i
        targetPageIndex = targetPage - accumulated - 1
        break
      }
      accumulated += count
    }

    // 更新索引
    mangaSet.ChapterIndex.value = targetChapterIndex
    mangaSet.PageIndex.value = targetPageIndex

    // 同步分页
    pagination.syncPage()

    // 保存阅读历史
    mangaSet.saveCurrentHistory()

    // 自适应
    await triggerFitToScreen()

    return true
  }

  return {
    triggerFitToScreen,
    jumpToPage
  }
}
