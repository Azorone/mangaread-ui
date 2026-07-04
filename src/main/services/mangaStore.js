import fs from 'fs/promises'
import { join, dirname, basename } from 'path'
import {
  getMangaStoreDir,
  getMangaListPath,
  getHistoryPath,
  getMetaPath,
  getTempDir
} from './pathManager.js'
import { log } from './logger.js'

// 数据版本号：每次写操作递增，用于窗口间数据同步
let dataVersion = 0

function bumpVersion() {
  dataVersion++
}

function getDataVersion() {
  return dataVersion
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true })
}

async function readJSON(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8')
    return JSON.parse(data)
  } catch {
    return null
  }
}

async function writeJSON(filePath, data) {
  await ensureDir(dirname(filePath))
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8')
}

async function loadMangaList() {
  const data = await readJSON(getMangaListPath())
  if (!data || !data.mangalist) {
    return { mangalist: [] }
  }
  return data
}

async function saveMangaList(data) {
  await writeJSON(getMangaListPath(), data)
  bumpVersion()
}

async function addMangaToList(mangaName) {
  const list = await loadMangaList()
  const exists = list.mangalist.some((m) => m.manganame === mangaName)
  if (exists) return false
  const metaPath = `${mangaName}/meta.json`
  list.mangalist.push({ manganame: mangaName, meta: metaPath })
  await saveMangaList(list)
  return true
}

async function removeMangaFromList(mangaName) {
  const list = await loadMangaList()
  list.mangalist = list.mangalist.filter((m) => m.manganame !== mangaName)
  await saveMangaList(list)
}

function createDefaultMeta(mangaName) {
  const now = new Date().toLocaleDateString('zh-CN')
  return {
    manganame: mangaName,
    importtime: now,
    updatetime: now,
    chapterlist: [],
    chaptersize: 0
  }
}

async function loadMeta(mangaName) {
  const metaPath = getMetaPath(mangaName)
  const data = await readJSON(metaPath)
  if (!data) return null
  return data
}

async function saveMeta(mangaName, meta) {
  meta.updatetime = new Date().toLocaleDateString('zh-CN')
  const metaPath = getMetaPath(mangaName)
  await writeJSON(metaPath, meta)
  bumpVersion()
  log.debug('[mangaStore] meta.json 已保存:', metaPath)
}

async function scanAndGenerateMeta(mangaName) {
  const mangaDir = join(getMangaStoreDir(), mangaName)
  const entries = await fs.readdir(mangaDir, { withFileTypes: true })
  const chapterFolders = entries.filter((d) => d.isDirectory())

  const meta = createDefaultMeta(mangaName)
  const chapterlist = []

  for (const chapterFolder of chapterFolders) {
    const chapterName = chapterFolder.name
    const chapterPath = join(mangaDir, chapterName)
    const files = await fs.readdir(chapterPath)
    const imageFiles = files
      .filter((f) => /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(f))
      .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))

    const images = imageFiles.map((name) => ({
      name,
      url: `${mangaName}/${chapterName}/${name}`
    }))

    chapterlist.push({
      chaptername: chapterName,
      imagesize: images.length,
      image: images
    })
  }

  chapterlist.sort((a, b) => a.chaptername.localeCompare(b.chaptername, 'en', { numeric: true }))

  meta.chapterlist = chapterlist
  meta.chaptersize = chapterlist.length

  await saveMeta(mangaName, meta)
  return meta
}

async function loadHistory() {
  const data = await readJSON(getHistoryPath())
  if (!data || !Array.isArray(data)) return []
  return data
}

async function saveHistory(historyList) {
  await writeJSON(getHistoryPath(), historyList)
  memoryHistory = historyList
  bumpVersion()
}

let memoryHistory = []

async function initMemoryHistory() {
  memoryHistory = await loadHistory()
  log.info('[mangaStore] 内存历史已初始化，条目:', memoryHistory.length)
}

function getMemoryHistory() {
  return [...memoryHistory]
}

async function flushHistory() {
  await saveHistory(memoryHistory)
  log.info('[mangaStore] 历史已写入磁盘，条目:', memoryHistory.length)
}

function updateHistory(entry) {
  const idx = memoryHistory.findIndex((h) => h.manganame === entry.manganame)
  const record = {
    ...entry,
    timestamp: new Date().toLocaleString('zh-CN')
  }
  if (idx !== -1) {
    memoryHistory.splice(idx, 1)
  }
  memoryHistory.unshift(record)

  const maxItems = 50
  if (memoryHistory.length > maxItems) {
    memoryHistory.length = maxItems
  }
  bumpVersion()
  return [...memoryHistory]
}

async function addChapter(mangaName, chapterName) {
  const mangaDir = join(getMangaStoreDir(), mangaName)
  const chapterDir = join(mangaDir, chapterName)
  await ensureDir(chapterDir)

  const meta = await loadMeta(mangaName)
  if (!meta) throw new Error(`漫画 ${mangaName} 的 meta.json 不存在`)

  meta.chapterlist.push({
    chaptername: chapterName,
    imagesize: 0,
    image: []
  })
  meta.chaptersize = meta.chapterlist.length
  meta.chapterlist.sort((a, b) =>
    a.chaptername.localeCompare(b.chaptername, 'en', { numeric: true })
  )

  await saveMeta(mangaName, meta)
  return meta
}

async function addChapterFromDir(mangaName, sourceDir) {
  const chapterName = basename(sourceDir)
  const mangaDir = join(getMangaStoreDir(), mangaName)
  const chapterDir = join(mangaDir, chapterName)

  await fs.cp(sourceDir, chapterDir, { recursive: true })
  log.info('[mangaStore] 章节导入:', chapterName, '->', chapterDir)

  const files = await fs.readdir(chapterDir)
  const imageFiles = files
    .filter((f) => /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))

  const images = imageFiles.map((name) => ({
    name,
    url: `${mangaName}/${chapterName}/${name}`
  }))

  const meta = await loadMeta(mangaName)
  if (!meta) throw new Error(`漫画 ${mangaName} 的 meta.json 不存在`)

  meta.chapterlist.push({
    chaptername: chapterName,
    imagesize: images.length,
    image: images
  })
  meta.chapterlist.sort((a, b) =>
    a.chaptername.localeCompare(b.chaptername, 'en', { numeric: true })
  )
  meta.chaptersize = meta.chapterlist.length

  await saveMeta(mangaName, meta)
  return meta
}

async function atomicRenameManga(oldName, newName) {
  const backupFile = await createBackup('rename_manga', oldName, { oldName, newName })

  try {
    const oldDir = join(getMangaStoreDir(), oldName)
    const newDir = join(getMangaStoreDir(), newName)

    await fs.rename(oldDir, newDir)

    const list = await loadMangaList()
    const entry = list.mangalist.find((m) => m.manganame === oldName)
    if (entry) {
      entry.manganame = newName
      entry.meta = `${newName}/meta.json`
    }
    await saveMangaList(list)

    const meta = await loadMeta(newName)
    if (meta) {
      meta.manganame = newName
      meta.chapterlist.forEach((ch) => {
        ch.image.forEach((img) => {
          img.url = img.url.replace(`${oldName}/`, `${newName}/`)
        })
      })
      await saveMeta(newName, meta)
    }

    await removeBackup(backupFile)
    return { success: true }
  } catch (error) {
    await restoreFromBackup(backupFile)
    return { success: false, error: error.message }
  }
}

async function atomicRenameChapter(mangaName, oldChapterName, newChapterName) {
  const backupFile = await createBackup('rename_chapter', `${mangaName}_${oldChapterName}`, {
    mangaName,
    oldChapterName,
    newChapterName
  })

  try {
    const mangaDir = join(getMangaStoreDir(), mangaName)
    const oldChapterDir = join(mangaDir, oldChapterName)
    const newChapterDir = join(mangaDir, newChapterName)

    await fs.rename(oldChapterDir, newChapterDir)

    const meta = await loadMeta(mangaName)
    if (!meta) throw new Error(`漫画 ${mangaName} 的 meta.json 不存在`)

    const chapter = meta.chapterlist.find((c) => c.chaptername === oldChapterName)
    if (!chapter) throw new Error(`章节 ${oldChapterName} 不存在`)

    chapter.chaptername = newChapterName
    chapter.image.forEach((img) => {
      img.url = img.url.replace(
        `${mangaName}/${oldChapterName}/`,
        `${mangaName}/${newChapterName}/`
      )
    })

    await saveMeta(mangaName, meta)
    await removeBackup(backupFile)
    return { success: true }
  } catch (error) {
    await restoreFromBackup(backupFile)
    return { success: false, error: error.message }
  }
}

async function atomicRenamePage(mangaName, chapterName, oldPageName, newPageName) {
  if (!/^\d+(\.(jpg|jpeg|png|gif|bmp|webp))?$/i.test(newPageName)) {
    return { success: false, error: '图片名称只支持数字（如 0001、0001.png）' }
  }

  const backupFile = await createBackup(
    'rename_page',
    `${mangaName}_${chapterName}_${oldPageName}`,
    {
      mangaName,
      chapterName,
      oldPageName,
      newPageName
    }
  )

  try {
    const chapterDir = join(getMangaStoreDir(), mangaName, chapterName)
    const oldPath = join(chapterDir, oldPageName)
    const newPath = join(chapterDir, newPageName)

    await fs.rename(oldPath, newPath)

    const meta = await loadMeta(mangaName)
    if (!meta) throw new Error(`漫画 ${mangaName} 的 meta.json 不存在`)

    const chapter = meta.chapterlist.find((c) => c.chaptername === chapterName)
    if (!chapter) throw new Error(`章节 ${chapterName} 不存在`)

    const page = chapter.image.find((img) => img.name === oldPageName)
    if (!page) throw new Error(`页面 ${oldPageName} 不存在`)

    page.name = newPageName
    page.url = page.url.replace(oldPageName, newPageName)

    await saveMeta(mangaName, meta)
    await removeBackup(backupFile)
    return { success: true }
  } catch (error) {
    await restoreFromBackup(backupFile)
    return { success: false, error: error.message }
  }
}

async function createBackup(operation, identifier, data) {
  ensureDir(getTempDir())
  const timestamp = Date.now()
  const filename = `${operation}_${identifier}_${timestamp}.json`
  const filePath = join(getTempDir(), filename)
  await writeJSON(filePath, data)
  return filePath
}

async function removeBackup(filePath) {
  try {
    await fs.unlink(filePath)
  } catch {
    // 忽略删除失败
  }
}

async function restoreFromBackup(backupFile) {
  log.error('[mangaStore] 操作失败，尝试从备份恢复:', backupFile)
  try {
    const backup = await readJSON(backupFile)
    if (!backup) return
    log.error('[mangaStore] 备份数据:', JSON.stringify(backup))
  } catch (error) {
    log.error('[mangaStore] 恢复失败:', error)
  }
}

async function deleteChapter(mangaName, chapterName) {
  const chapterDir = join(getMangaStoreDir(), mangaName, chapterName)
  try {
    await fs.rm(chapterDir, { recursive: true, force: true })
    log.info('[mangaStore] 已删除章节目录:', chapterDir)
  } catch (error) {
    log.error('[mangaStore] 删除章节目录失败:', error)
    return { success: false, error: error.message }
  }

  const meta = await loadMeta(mangaName)
  if (!meta) return { success: false, error: `漫画 ${mangaName} 的 meta.json 不存在` }

  meta.chapterlist = meta.chapterlist.filter((c) => c.chaptername !== chapterName)
  meta.chaptersize = meta.chapterlist.length
  await saveMeta(mangaName, meta)
  return { success: true }
}

async function deleteManga(mangaName) {
  const mangaDir = join(getMangaStoreDir(), mangaName)
  try {
    await fs.rm(mangaDir, { recursive: true, force: true })
  } catch (error) {
    log.error('[mangaStore] 删除漫画目录失败:', error)
  }
  await removeMangaFromList(mangaName)
  return { success: true }
}

/**
 * 向指定章节添加图片文件
 * @param {string} mangaName - 漫画名称
 * @param {string} chapterName - 章节名称
 * @param {string[]} sourceFiles - 源文件路径数组
 */
async function addPages(mangaName, chapterName, sourceFiles) {
  const chapterDir = join(getMangaStoreDir(), mangaName, chapterName)
  await ensureDir(chapterDir)

  const meta = await loadMeta(mangaName)
  if (!meta) throw new Error(`漫画 ${mangaName} 的 meta.json 不存在`)

  const chapter = meta.chapterlist.find((c) => c.chaptername === chapterName)
  if (!chapter) throw new Error(`章节 ${chapterName} 不存在`)

  // 复制每个源文件到章节目录
  for (const srcPath of sourceFiles) {
    const fileName = basename(srcPath)
    const destPath = join(chapterDir, fileName)
    await fs.cp(srcPath, destPath)
    log.info('[mangaStore] 添加页面:', srcPath, '->', destPath)
  }

  // 重新扫描章节目录获取最新图片列表
  const files = await fs.readdir(chapterDir)
  const imageFiles = files
    .filter((f) => /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))

  const images = imageFiles.map((name) => ({
    name,
    url: `${mangaName}/${chapterName}/${name}`
  }))

  chapter.image = images
  chapter.imagesize = images.length

  await saveMeta(mangaName, meta)
  return meta
}

/**
 * 删除指定章节中的单页图片
 * @param {string} mangaName - 漫画名称
 * @param {string} chapterName - 章节名称
 * @param {string} pageName - 页面文件名
 */
async function deletePage(mangaName, chapterName, pageName) {
  const chapterDir = join(getMangaStoreDir(), mangaName, chapterName)
  const pagePath = join(chapterDir, pageName)

  try {
    await fs.unlink(pagePath)
    log.info('[mangaStore] 已删除页面文件:', pagePath)
  } catch (error) {
    log.error('[mangaStore] 删除页面文件失败:', error)
    return { success: false, error: error.message }
  }

  const meta = await loadMeta(mangaName)
  if (!meta) return { success: false, error: `漫画 ${mangaName} 的 meta.json 不存在` }

  const chapter = meta.chapterlist.find((c) => c.chaptername === chapterName)
  if (!chapter) return { success: false, error: `章节 ${chapterName} 不存在` }

  chapter.image = chapter.image.filter((img) => img.name !== pageName)
  chapter.imagesize = chapter.image.length

  await saveMeta(mangaName, meta)
  return { success: true }
}

/**
 * 获取完整的漫画管理数据（含统计信息）
 * 返回格式适用于管理窗口表格展示
 */
async function getAllDetail() {
  const list = await loadMangaList()
  const mangas = []
  for (const entry of list.mangalist) {
    const meta = await loadMeta(entry.manganame)
    mangas.push({
      manganame: entry.manganame,
      importtime: meta ? meta.importtime : '',
      updatetime: meta ? meta.updatetime : '',
      chaptersize: meta ? meta.chaptersize : 0,
      chapterlist: meta
        ? meta.chapterlist.map((ch) => ({
            chaptername: ch.chaptername,
            imagesize: ch.imagesize,
            image: ch.image.map((img) => ({
              name: img.name,
              url: img.url
            }))
          }))
        : []
    })
  }
  return { mangas }
}

export {
  loadMangaList,
  saveMangaList,
  addMangaToList,
  removeMangaFromList,
  loadMeta,
  saveMeta,
  scanAndGenerateMeta,
  createDefaultMeta,
  loadHistory,
  saveHistory,
  initMemoryHistory,
  getMemoryHistory,
  flushHistory,
  updateHistory,
  addChapter,
  addChapterFromDir,
  atomicRenameManga,
  atomicRenameChapter,
  atomicRenamePage,
  deleteChapter,
  deleteManga,
  addPages,
  deletePage,
  getAllDetail,
  getDataVersion
}
