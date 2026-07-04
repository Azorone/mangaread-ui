import fs from 'fs/promises'
import path from 'path'
import { getScreenshotsDir } from './pathManager.js'

async function saveCroppedImage(base64Data, filename) {
  try {
    const screenshotsDir = getScreenshotsDir()
    await fs.mkdir(screenshotsDir, { recursive: true })

    const base64Image = base64Data.replace(/^data:image\/png;base64,/, '')
    const imageBuffer = Buffer.from(base64Image, 'base64')

    const filePath = path.join(screenshotsDir, filename)
    await fs.writeFile(filePath, imageBuffer)

    return { success: true, filePath }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function clearScreenshots() {
  try {
    const screenshotsDir = getScreenshotsDir()
    try {
      await fs.access(screenshotsDir)
    } catch {
      return { success: true, message: 'Screenshots directory does not exist' }
    }

    const files = await fs.readdir(screenshotsDir)
    for (const file of files) {
      const filePath = path.join(screenshotsDir, file)
      const stat = await fs.stat(filePath)
      if (stat.isFile()) {
        await fs.unlink(filePath)
      }
    }
    return { success: true, message: `Cleared ${files.length} files` }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function openScreenshotsFolder() {
  try {
    const { shell } = await import('electron')
    const screenshotsDir = getScreenshotsDir()
    await fs.mkdir(screenshotsDir, { recursive: true })
    await shell.openPath(screenshotsDir)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export { saveCroppedImage, clearScreenshots, openScreenshotsFolder }
