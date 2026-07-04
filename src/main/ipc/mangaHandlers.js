import { ipcMain, dialog, shell } from 'electron'
import { getMangaStoreDir } from '../services/pathManager.js'
import { importManga } from '../services/mangaImporter.js'
import { exportManga } from '../services/mangaExporter.js'
import {
  loadMangaList,
  loadMeta,
  addChapter,
  addChapterFromDir,
  atomicRenameManga,
  atomicRenameChapter,
  atomicRenamePage,
  deleteManga,
  deleteChapter,
  updateHistory,
  getMemoryHistory,
  flushHistory,
  saveHistory,
  addPages,
  deletePage,
  getAllDetail,
  getDataVersion
} from '../services/mangaStore.js'
import { createManagerWindow } from '../managerWindow.js'

export function registerMangaHandlers() {
  ipcMain.handle('openFolderDialog', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'multiSelections']
    })
    return result
  })

  ipcMain.handle('manga:import', async (_event, targetPaths) => {
    return await importManga(targetPaths)
  })

  ipcMain.handle('manga:export', async (_event, mangaName) => {
    return await exportManga(mangaName)
  })

  ipcMain.handle('getMangaStructure', async () => {
    const list = await loadMangaList()
    const mangas = []
    for (const entry of list.mangalist) {
      const meta = await loadMeta(entry.manganame)
      if (meta) {
        mangas.push({
          name: entry.manganame,
          path: `mangastore/${entry.manganame}`,
          chapters: meta.chapterlist.map((ch) => ({
            name: ch.chaptername,
            path: `mangastore/${entry.manganame}/${ch.chaptername}`,
            images: ch.image.map((img) => ({
              name: img.name,
              path: img.url
            }))
          }))
        })
      }
    }
    return { mangas }
  })

  ipcMain.handle('manga:addChapter', async (_event, mangaName, chapterName) => {
    try {
      await addChapter(mangaName, chapterName)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('manga:addChapterFromDir', async (_event, mangaName, sourceDir) => {
    try {
      await addChapterFromDir(mangaName, sourceDir)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('manga:renameManga', async (_event, oldName, newName) => {
    return await atomicRenameManga(oldName, newName)
  })

  ipcMain.handle('manga:renameChapter', async (_event, mangaName, oldName, newName) => {
    return await atomicRenameChapter(mangaName, oldName, newName)
  })

  ipcMain.handle('manga:renamePage', async (_event, mangaName, chapterName, oldName, newName) => {
    return await atomicRenamePage(mangaName, chapterName, oldName, newName)
  })

  ipcMain.handle('manga:delete', async (_event, mangaName) => {
    try {
      await deleteManga(mangaName)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('manga:deleteChapter', async (_event, mangaName, chapterName) => {
    return await deleteChapter(mangaName, chapterName)
  })

  ipcMain.handle('getHistory', async () => {
    return getMemoryHistory()
  })

  ipcMain.handle('history:update', async (_event, entry) => {
    return updateHistory(entry)
  })

  ipcMain.handle('history:flush', async () => {
    await flushHistory()
    return { success: true }
  })

  ipcMain.handle('saveHistory', async (_event, historyList) => {
    await saveHistory(historyList)
    return { success: true }
  })

  ipcMain.handle('openMangaStoreFolder', async () => {
    try {
      const mangaStoreDir = getMangaStoreDir()
      await fs.mkdir(mangaStoreDir, { recursive: true })
      await shell.openPath(mangaStoreDir)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  // ==================== 管理窗口相关 ====================

  ipcMain.handle('manager:open', async () => {
    createManagerWindow()
    return { success: true }
  })

  ipcMain.handle('getDataVersion', async () => {
    return getDataVersion()
  })

  ipcMain.handle('manga:getAllDetail', async () => {
    return await getAllDetail()
  })

  ipcMain.handle('manga:addPages', async (_event, mangaName, chapterName, sourceFiles) => {
    try {
      await addPages(mangaName, chapterName, sourceFiles)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('manga:deletePage', async (_event, mangaName, chapterName, pageName) => {
    return await deletePage(mangaName, chapterName, pageName)
  })

  ipcMain.handle('image:openDialog', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: '图片文件', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'] }
      ]
    })
    return result
  })
}
