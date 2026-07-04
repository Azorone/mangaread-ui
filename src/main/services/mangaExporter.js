import { execSync } from 'child_process'
import { join } from 'path'
import { getMangaStoreDir } from './pathManager.js'
import { log } from './logger.js'
import os from 'os'

async function exportManga(mangaName) {
  return new Promise((resolve) => {
    try {
      const mangaStoreDir = getMangaStoreDir()
      const mangaDir = join(mangaStoreDir, mangaName)
      const outputPath = join(mangaStoreDir, `${mangaName}.zip`)

      if (os.platform() === 'win32') {
        execSync(
          `powershell -Command "Compress-Archive -Path '${mangaDir}' -DestinationPath '${outputPath}' -Force"`,
          { stdio: 'pipe' }
        )
      } else {
        const parentDir = mangaStoreDir
        execSync(`cd "${parentDir}" && tar -acf "${outputPath}" -C "${parentDir}" "${mangaName}"`, {
          stdio: 'pipe',
          shell: true
        })
      }

      log.info('[mangaExporter] 导出成功:', outputPath)
      resolve({ success: true, outputPath })
    } catch (error) {
      log.error('[mangaExporter] 导出失败:', error)
      resolve({ success: false, error: error.message })
    }
  })
}

export { exportManga }
