import { contextBridge, ipcRenderer } from 'electron'
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
