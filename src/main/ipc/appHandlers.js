import { ipcMain, app } from 'electron'

export function registerAppHandlers() {
  ipcMain.handle('ping', async () => 'pong')
  ipcMain.handle('getAppVersion', async () => app.getVersion())
}
