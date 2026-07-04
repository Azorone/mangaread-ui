import { getMangaspaceDir, getMangaStoreDir, getScreenshotsDir, getTempDir } from './pathManager.js'
import { loadConfig } from './configManager.js'
import { loadMangaList, initMemoryHistory, flushHistory, getMemoryHistory } from './mangaStore.js'
import { clearScreenshots } from './screenshotManager.js'
import { log } from './logger.js'
import fs from 'fs/promises'

let appConfig = null
let appMangaList = null
let appHistory = null

async function initManga() {
  log.info('[lifecycle] ===== initManga: 初始化项目 =====')

  const mangaspaceDir = getMangaspaceDir()
  const mangaStoreDir = getMangaStoreDir()
  const screenshotsDir = getScreenshotsDir()
  const tempDir = getTempDir()

  await fs.mkdir(mangaspaceDir, { recursive: true })
  await fs.mkdir(mangaStoreDir, { recursive: true })
  await fs.mkdir(screenshotsDir, { recursive: true })
  await fs.mkdir(tempDir, { recursive: true })

  log.info('[lifecycle] mangaspace 目录已创建:', mangaspaceDir)

  appConfig = await loadConfig()
  log.info('[lifecycle] 配置已加载')

  log.info('[lifecycle] ===== initManga 完成 =====')
}

async function loadManga() {
  log.info('[lifecycle] ===== loadManga: 加载项目数据 =====')

  appMangaList = await loadMangaList()
  log.info('[lifecycle] 漫画列表已加载，数量:', appMangaList.mangalist.length)

  await initMemoryHistory()
  appHistory = getMemoryHistory()
  log.info('[lifecycle] 阅读历史已加载，数量:', appHistory.length)

  log.info('[lifecycle] ===== loadManga 完成 =====')
}

async function exitManga() {
  log.info('[lifecycle] ===== exitManga: 项目退出 =====')

  await flushHistory()
  await clearScreenshots()

  const tempDir = getTempDir()
  try {
    const files = await fs.readdir(tempDir)
    for (const file of files) {
      await fs.unlink(`${tempDir}/${file}`)
    }
    log.info('[lifecycle] 临时文件已清理')
  } catch (error) {
    log.error('[lifecycle] 清理临时文件失败:', error)
  }

  log.info('[lifecycle] ===== exitManga 完成 =====')
}

function getAppConfig() {
  return appConfig
}

function getAppMangaList() {
  return appMangaList
}

function getAppHistory() {
  return getMemoryHistory()
}

export { initManga, loadManga, exitManga, getAppConfig, getAppMangaList, getAppHistory }
