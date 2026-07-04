import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export function useMangaManager() {
  // ==================== 状态 ====================
  const mangaList = ref([])
  const selectedMangaName = ref('')
  const selectedChapterName = ref('')
  const loading = ref(false)
  const importDialogVisible = ref(false)

  // ==================== 计算属性 ====================
  const selectedManga = computed(() => {
    return mangaList.value.find((m) => m.manganame === selectedMangaName.value) || null
  })

  const chapterList = computed(() => {
    return selectedManga.value ? selectedManga.value.chapterlist : []
  })

  const selectedChapter = computed(() => {
    return chapterList.value.find((ch) => ch.chaptername === selectedChapterName.value) || null
  })

  const pageList = computed(() => {
    return selectedChapter.value ? selectedChapter.value.image : []
  })

  // ==================== 数据获取 ====================
  const fetchAllData = async () => {
    loading.value = true
    try {
      const detail = await window.api.mangaStore.getAllDetail()
      mangaList.value = detail.mangas || []
      // 如果选中的漫画仍在列表中，保持选中
      if (selectedMangaName.value) {
        const stillExists = mangaList.value.some(
          (m) => m.manganame === selectedMangaName.value
        )
        if (!stillExists) {
          selectedMangaName.value = ''
          selectedChapterName.value = ''
        }
      }
    } catch (error) {
      ElMessage.error(`获取数据失败：${error.message}`)
    } finally {
      loading.value = false
    }
  }

  // ==================== 选择操作 ====================
  const selectManga = (mangaName) => {
    if (selectedMangaName.value === mangaName) {
      // 点击已选中的漫画，取消选中
      selectedMangaName.value = ''
      selectedChapterName.value = ''
    } else {
      selectedMangaName.value = mangaName
      selectedChapterName.value = ''
    }
  }

  const selectChapter = (chapterName) => {
    if (selectedChapterName.value === chapterName) {
      selectedChapterName.value = ''
    } else {
      selectedChapterName.value = chapterName
    }
  }

  // ==================== 导入漫画 ====================
  const importManga = async (folders) => {
    try {
      const result = await window.api.importFolders(folders)
      if (result && Array.isArray(result.results)) {
        let successCount = 0
        let failCount = 0
        result.results.forEach((res) => {
          if (res.success) successCount++
          else failCount++
        })
        await fetchAllData()
        ElMessage.success(`导入完成：成功 ${successCount} 个${failCount > 0 ? `，失败 ${failCount} 个` : ''}`)
      }
    } catch (error) {
      ElMessage.error(`导入出错：${error.message}`)
    }
  }

  // ==================== 漫画操作 ====================
  const addChapter = async (mangaName) => {
    try {
      const { value: chapterName } = await ElMessageBox.prompt(
        '请输入新章节名称：',
        '添加章节',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputValidator: (val) => (val ? true : '章节名称不能为空')
        }
      )
      if (!chapterName) return
      const result = await window.api.mangaStore.addChapter(mangaName, chapterName)
      if (result.success) {
        await fetchAllData()
        ElMessage.success(`章节「${chapterName}」已创建`)
      } else {
        ElMessage.error(`创建失败：${result.error}`)
      }
    } catch {
      // 取消
    }
  }

  const addPagesToChapter = async (mangaName, chapterName) => {
    try {
      const result = await window.api.openImageFileDialog()
      if (!result || !Array.isArray(result.filePaths) || result.filePaths.length === 0) return
      const res = await window.api.mangaStore.addPages(mangaName, chapterName, result.filePaths)
      if (res.success) {
        await fetchAllData()
        ElMessage.success(`已添加 ${result.filePaths.length} 张图片到「${chapterName}」`)
      } else {
        ElMessage.error(`添加页面失败：${res.error}`)
      }
    } catch (error) {
      ElMessage.error(`添加页面出错：${error.message}`)
    }
  }

  const addChapterFromDir = async (mangaName) => {
    try {
      const result = await window.api.openFolderDialog()
      if (!result || !Array.isArray(result.filePaths) || result.filePaths.length === 0) return
      for (const dir of result.filePaths) {
        const res = await window.api.mangaStore.addChapterFromDir(mangaName, dir)
        if (!res.success) {
          ElMessage.error(`导入章节失败：${res.error}`)
        }
      }
      await fetchAllData()
      ElMessage.success('章节导入完成')
    } catch (error) {
      ElMessage.error(`导入章节出错：${error.message}`)
    }
  }

  const renameManga = async (mangaName) => {
    try {
      const { value: newName } = await ElMessageBox.prompt(
        '请输入新漫画名称：',
        '重命名漫画',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputValue: mangaName
        }
      )
      if (!newName || newName === mangaName) return
      const result = await window.api.mangaStore.renameManga(mangaName, newName)
      if (result.success) {
        await fetchAllData()
        ElMessage.success(`已重命名为「${newName}」`)
      } else {
        ElMessage.error(`重命名失败：${result.error}`)
      }
    } catch {
      // 取消
    }
  }

  const renameChapter = async (mangaName, chapterName) => {
    try {
      const { value: newName } = await ElMessageBox.prompt(
        '请输入新章节名称：',
        '重命名章节',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputValue: chapterName
        }
      )
      if (!newName || newName === chapterName) return
      const result = await window.api.mangaStore.renameChapter(mangaName, chapterName, newName)
      if (result.success) {
        await fetchAllData()
        ElMessage.success(`章节已重命名为「${newName}」`)
      } else {
        ElMessage.error(`重命名失败：${result.error}`)
      }
    } catch {
      // 取消
    }
  }

  const renamePage = async (mangaName, chapterName, pageName) => {
    try {
      const { value: newName } = await ElMessageBox.prompt(
        '请输入新文件名（只支持数字，如 0001 或 0001.png）：',
        '重命名页面',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputValue: pageName
        }
      )
      if (!newName || newName === pageName) return
      const result = await window.api.mangaStore.renamePage(
        mangaName,
        chapterName,
        pageName,
        newName
      )
      if (result.success) {
        await fetchAllData()
        ElMessage.success(`页面已重命名为「${newName}」`)
      } else {
        ElMessage.error(`重命名失败：${result.error}`)
      }
    } catch {
      // 取消
    }
  }

  const deleteManga = async (mangaName) => {
    try {
      await ElMessageBox.confirm(
        `确定要删除漫画「${mangaName}」吗？此操作不可撤销。`,
        '删除漫画',
        { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
      )
      const result = await window.api.mangaStore.deleteManga(mangaName)
      if (result.success) {
        await fetchAllData()
        ElMessage.success(`漫画「${mangaName}」已删除`)
      } else {
        ElMessage.error(`删除失败：${result.error}`)
      }
    } catch {
      // 取消
    }
  }

  const deleteChapter = async (mangaName, chapterName) => {
    try {
      await ElMessageBox.confirm(
        `确定要删除章节「${chapterName}」吗？该章节下所有图片将被删除。`,
        '删除章节',
        { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
      )
      const result = await window.api.mangaStore.deleteChapter(mangaName, chapterName)
      if (result.success) {
        await fetchAllData()
        ElMessage.success(`章节「${chapterName}」已删除`)
      } else {
        ElMessage.error(`删除失败：${result.error}`)
      }
    } catch {
      // 取消
    }
  }

  const deletePage = async (mangaName, chapterName, pageName) => {
    try {
      await ElMessageBox.confirm(
        `确定要删除页面「${pageName}」吗？`,
        '删除页面',
        { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
      )
      const result = await window.api.mangaStore.deletePage(mangaName, chapterName, pageName)
      if (result.success) {
        await fetchAllData()
        ElMessage.success(`页面「${pageName}」已删除`)
      } else {
        ElMessage.error(`删除失败：${result.error}`)
      }
    } catch {
      // 取消
    }
  }

  const exportManga = async (mangaName) => {
    try {
      const result = await window.api.mangaStore.exportManga(mangaName)
      if (result.success) {
        ElMessage.success(`导出成功：${result.outputPath}`)
      } else {
        ElMessage.error(`导出失败：${result.error}`)
      }
    } catch (error) {
      ElMessage.error(`导出出错：${error.message}`)
    }
  }

  // ==================== 返回 ====================
  return {
    // 状态
    mangaList,
    selectedMangaName,
    selectedChapterName,
    selectedManga,
    chapterList,
    selectedChapter,
    pageList,
    loading,
    importDialogVisible,
    // 数据
    fetchAllData,
    // 选择
    selectManga,
    selectChapter,
    // 导入
    importManga,
    // CRUD
    addChapter,
    addPagesToChapter,
    addChapterFromDir,
    renameManga,
    renameChapter,
    renamePage,
    deleteManga,
    deleteChapter,
    deletePage,
    exportManga
  }
}
