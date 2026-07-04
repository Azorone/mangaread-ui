import log from 'electron-log'
import { join } from 'path'
import { getMangaspaceDir } from './pathManager.js'

function setupLogger() {
  const logDir = join(getMangaspaceDir(), 'log')
  log.transports.file.resolvePathFn = () => join(logDir, 'main.log')
  log.transports.file.maxSize = 5 * 1024 * 1024
  log.transports.file.level = 'info'
  log.transports.console.level = 'debug'
  log.info('[logger] 日志系统已初始化, 日志目录:', logDir)
}

export { setupLogger, log }
