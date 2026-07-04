import fs from 'fs/promises'
import { join, basename } from 'path'
import { getMangaStoreDir } from './pathManager.js'
import { get } from './configManager.js'
import { addMangaToList, scanAndGenerateMeta } from './mangaStore.js'
import { log } from './logger.js'

async function importManga(sourcePaths, _importMode) {
  const mode = _importMode || get('importMode') || 'copy'

  if (!Array.isArray(sourcePaths)) {
    sourcePaths = [sourcePaths]
  }

  const destPath = getMangaStoreDir()
  await fs.mkdir(destPath, { recursive: true })

  const results = []
  let hasSuccess = false

  for (const sourcePath of sourcePaths) {
    try {
      const folderName = basename(sourcePath)
      const fullDestPath = join(destPath, folderName)

      if (mode === 'move') {
        await fs.rename(sourcePath, fullDestPath)
        log.info('[mangaImporter] 移动模式导入:', sourcePath, '->', fullDestPath)
      } else {
        await fs.cp(sourcePath, fullDestPath, { recursive: true })
        log.info('[mangaImporter] 拷贝模式导入:', sourcePath, '->', fullDestPath)
      }

      await addMangaToList(folderName)
      await scanAndGenerateMeta(folderName)

      results.push({ success: true, destPath: fullDestPath, source: sourcePath, mode })
      hasSuccess = true
    } catch (error) {
      log.error('[mangaImporter] 导入失败:', sourcePath, error)
      results.push({ success: false, error: error.message, source: sourcePath })
    }
  }

  return { results, hasSuccess }
}

export { importManga }
