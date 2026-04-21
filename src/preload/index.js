import { contextBridge, ipcRenderer,webUtils } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  ping: async () => {
    const response = await ipcRenderer.invoke('ping')
    console.log(response) // Should print "pong"
  },
  getAppVersion: async () => {
    const version = await ipcRenderer.invoke('getAppVersion')
    console.log('App Version:', version)
    return version
  },
  getAppPath: async () => {
    const appPath = await ipcRenderer.invoke('getAppPath')
    console.log('App Path:', appPath)
    return appPath
  },
  getUserDataPath: async () => {
    const userDataPath = await ipcRenderer.invoke('getUserDataPath')
    console.log('User Data Path:', userDataPath)
    return userDataPath
  },
  openFolderDialog: async () => {
    const result = await ipcRenderer.invoke('openFolderDialog')
    console.log('Open folder dialog result:', result)
    return result
  },
  importFolders: async (folders) => {
    const result = await ipcRenderer.invoke('importFolders', folders)
    console.log('Import folders result:', result)
    return result
  },
  getMangaList: async () => {
    const result = await ipcRenderer.invoke('getMangaList')
    console.log('Get manga list result:', result)
    return result
  },
  getMangaImages: async (mangaId) => {
    const result = await ipcRenderer.invoke('getMangaImages', mangaId)
    console.log('Get manga images result:', result)
    return result
  },
  getMangaStructure: async () => {
    const result = await ipcRenderer.invoke('getMangaStructure')
    console.log('Get manga structure result:', result)
    return result
  },
  getPathForFile: async (file) =>{ const s = webUtils.getPathForFile(file)
    console.log('获取文件路径：', s);
    return s
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
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
