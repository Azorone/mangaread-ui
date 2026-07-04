import fs from 'fs/promises'
import { getConfigPath } from './pathManager.js'
import { log } from './logger.js'

const DEFAULT_CONFIG = {
  importMode: 'copy',
  version: '1.0.0',
  windowWidth: 900,
  windowHeight: 670
}

let config = { ...DEFAULT_CONFIG }

async function loadConfig() {
  try {
    const data = await fs.readFile(getConfigPath(), 'utf8')
    const parsed = JSON.parse(data)
    config = { ...DEFAULT_CONFIG, ...parsed }
    log.info('[configManager] 配置加载成功:', getConfigPath())
  } catch {
    log.info('[configManager] 配置文件不存在，使用默认配置')
    config = { ...DEFAULT_CONFIG }
    await saveConfig()
  }
  return config
}

async function saveConfig() {
  try {
    const { mkdir } = await import('fs/promises')
    const { dirname } = await import('path')
    const configPath = getConfigPath()
    await mkdir(dirname(configPath), { recursive: true })
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8')
    log.info('[configManager] 配置保存成功:', configPath)
  } catch (error) {
    log.error('[configManager] 配置保存失败:', error)
  }
}

function get(key) {
  return config[key]
}

function set(key, value) {
  config[key] = value
}

function getAll() {
  return { ...config }
}

export { loadConfig, saveConfig, get, set, getAll }
