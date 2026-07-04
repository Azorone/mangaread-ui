import { app } from 'electron'
import { join, dirname } from 'path'

function isDev() {
  return process.env.NODE_ENV === 'development' || !app.isPackaged
}

function getMangaspaceDir() {
  if (isDev()) {
    return join(process.cwd(), 'mangaspace')
  }
  const exeDir = dirname(app.getPath('exe'))
  return join(dirname(exeDir), 'mangaspace')
}

function getMangaStoreDir() {
  return join(getMangaspaceDir(), 'mangastore')
}

function getScreenshotsDir() {
  return join(getMangaspaceDir(), 'Screenshots')
}

function getTempDir() {
  return join(getMangaStoreDir(), 'temp')
}

function getConfigPath() {
  return join(getMangaspaceDir(), 'config.json')
}

function getMangaListPath() {
  return join(getMangaStoreDir(), 'mangalist.json')
}

function getHistoryPath() {
  return join(getMangaStoreDir(), 'history.json')
}

function getMetaPath(mangaName) {
  return join(getMangaStoreDir(), mangaName, 'meta.json')
}

export {
  isDev,
  getMangaspaceDir,
  getMangaStoreDir,
  getScreenshotsDir,
  getTempDir,
  getConfigPath,
  getMangaListPath,
  getHistoryPath,
  getMetaPath
}
