import { BrowserWindow, app } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

let managerWindow = null

export function createManagerWindow() {
  if (managerWindow && !managerWindow.isDestroyed()) {
    managerWindow.focus()
    return managerWindow
  }

  managerWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    show: false,
    autoHideMenuBar: true,
    title: '漫画管理',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  managerWindow.on('ready-to-show', () => {
    managerWindow.show()
  })

  managerWindow.on('closed', () => {
    managerWindow = null
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    managerWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#/manager`)
    managerWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    managerWindow.loadFile(join(__dirname, '../renderer/index.html'), {
      hash: '/manager'
    })
  }

  return managerWindow
}

export function focusManagerWindow() {
  if (managerWindow && !managerWindow.isDestroyed()) {
    managerWindow.focus()
    return true
  }
  return false
}

export function closeManagerWindow() {
  if (managerWindow && !managerWindow.isDestroyed()) {
    managerWindow.close()
    managerWindow = null
  }
}
