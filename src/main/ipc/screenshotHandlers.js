import { ipcMain } from 'electron'
import {
  saveCroppedImage,
  clearScreenshots,
  openScreenshotsFolder
} from '../services/screenshotManager.js'

export function registerScreenshotHandlers() {
  ipcMain.handle('saveCroppedImage', async (_event, base64Data, filename) => {
    return await saveCroppedImage(base64Data, filename)
  })

  ipcMain.handle('clearScreenshots', async () => {
    return await clearScreenshots()
  })

  ipcMain.handle('openScreenshotsFolder', async () => {
    return await openScreenshotsFolder()
  })
}
