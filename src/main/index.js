import { app, shell, BrowserWindow, ipcMain, protocol } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { registerAppHandlers } from './ipc/appHandlers.js'
import { registerMangaHandlers } from './ipc/mangaHandlers.js'
import { registerScreenshotHandlers } from './ipc/screenshotHandlers.js'
import { initManga, loadManga, exitManga } from './services/lifecycle.js'
import { setupLogger, log } from './services/logger.js'
import { getMangaStoreDir } from './services/pathManager.js'

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    const levels = ['VERBOSE', 'INFO', 'WARN', 'ERROR']
    if (level >= 2) {
      log.warn(`[renderer:${levels[level] || '?'}] ${message} (${sourceId}:${line})`)
    }
  })

  mainWindow.webContents.on(
    'did-fail-load',
    (_event, errorCode, errorDescription, validatedURL) => {
      log.error(`[renderer:FAIL] ${errorDescription} (code:${errorCode}) url:${validatedURL}`)
    }
  )

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.electron')

  await initManga()
  setupLogger()

  protocol.registerFileProtocol('manga', (request, callback) => {
    const relativePath = decodeURIComponent(request.url).replace(/^manga:\/*/, '')
    const mangaStorePath = getMangaStoreDir()
    const cleanPath = relativePath.replace(/^mangastore[/\\]/, '')
    const fullPath = join(mangaStorePath, cleanPath)
    callback({ path: fullPath })
  })

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  registerAppHandlers()
  registerMangaHandlers()
  registerScreenshotHandlers()

  await loadManga()

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('before-quit', async (event) => {
  event.preventDefault()
  await exitManga()
  app.exit()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
