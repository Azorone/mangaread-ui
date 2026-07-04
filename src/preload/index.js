import { contextBridge, ipcRenderer, webUtils } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  getAppVersion: async () => await ipcRenderer.invoke('getAppVersion'),

  openFolderDialog: async () => await ipcRenderer.invoke('openFolderDialog'),

  importFolders: async (folders) => await ipcRenderer.invoke('manga:import', folders),

  getMangaStructure: async () => await ipcRenderer.invoke('getMangaStructure'),

  // Screenshot (preserve existing functionality)
  saveCroppedImage: async (base64Data, filename) =>
    await ipcRenderer.invoke('saveCroppedImage', base64Data, filename),
  clearScreenshots: async () => await ipcRenderer.invoke('clearScreenshots'),
  openScreenshotsFolder: async () => await ipcRenderer.invoke('openScreenshotsFolder'),
  openMangaStoreFolder: async () => await ipcRenderer.invoke('openMangaStoreFolder'),

  getPathForFile: async (file) => webUtils.getPathForFile(file),

  // History
  getHistory: async () => await ipcRenderer.invoke('getHistory'),
  updateHistory: async (entry) => await ipcRenderer.invoke('history:update', entry),
  saveHistory: async (historyList) => await ipcRenderer.invoke('saveHistory', historyList),

  // 数据版本号（窗口同步用）
  getDataVersion: async () => await ipcRenderer.invoke('getDataVersion'),

  // 管理窗口
  openManagerWindow: async () => await ipcRenderer.invoke('manager:open'),

  // 文件选择器（管理窗口用）
  openImageFileDialog: async () => await ipcRenderer.invoke('image:openDialog'),

  // Manga CRUD
  mangaStore: {
    addChapter: async (mangaName, chapterName) =>
      await ipcRenderer.invoke('manga:addChapter', mangaName, chapterName),
    addChapterFromDir: async (mangaName, sourceDir) =>
      await ipcRenderer.invoke('manga:addChapterFromDir', mangaName, sourceDir),
    addPages: async (mangaName, chapterName, sourceFiles) =>
      await ipcRenderer.invoke('manga:addPages', mangaName, chapterName, sourceFiles),
    deletePage: async (mangaName, chapterName, pageName) =>
      await ipcRenderer.invoke('manga:deletePage', mangaName, chapterName, pageName),
    renameManga: async (oldName, newName) =>
      await ipcRenderer.invoke('manga:renameManga', oldName, newName),
    renameChapter: async (mangaName, oldName, newName) =>
      await ipcRenderer.invoke('manga:renameChapter', mangaName, oldName, newName),
    renamePage: async (mangaName, chapterName, oldName, newName) =>
      await ipcRenderer.invoke('manga:renamePage', mangaName, chapterName, oldName, newName),
    deleteManga: async (mangaName) => await ipcRenderer.invoke('manga:delete', mangaName),
    deleteChapter: async (mangaName, chapterName) =>
      await ipcRenderer.invoke('manga:deleteChapter', mangaName, chapterName),
    exportManga: async (mangaName) => await ipcRenderer.invoke('manga:export', mangaName),
    getAllDetail: async () => await ipcRenderer.invoke('manga:getAllDetail')
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
