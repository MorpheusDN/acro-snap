import { ipcMain } from 'electron'
import { extractTerm, formatAiError, queryAbbr, streamChat } from './aiService'
import {
  getApiBaseUrl,
  getApiKey,
  getApiModel,
  setApiBaseUrl,
  setApiKey,
  setApiModel
} from './store'
import { getChatWindow, getSearchWindow, showChatWithTerm } from './windowManager'

const MASKED_KEY = '********'

export function registerIpcHandlers(): void {
  ipcMain.on('window:hide-search', () => {
    getSearchWindow()?.hide()
  })

  ipcMain.on('window:set-search-height', (_event, height: number) => {
    const win = getSearchWindow()
    if (!win) return
    const clampedHeight = Math.max(60, Math.min(460, height))
    win.setSize(600, clampedHeight)
  })

  ipcMain.on('window:minimize-chat', () => {
    getChatWindow()?.minimize()
  })

  ipcMain.on('window:close-chat', () => {
    getChatWindow()?.hide()
  })

  ipcMain.on('window:open-chat-with-term', (_event, termJson: string) => {
    showChatWithTerm(termJson)
    getSearchWindow()?.hide()
    getSearchWindow()?.webContents.send('search:reset')
  })

  ipcMain.handle('ai:query', async (_event, abbr: string) => {
    return await queryAbbr(abbr)
  })

  ipcMain.handle('ai:chat', async (_event, messages: { role: 'user' | 'assistant'; content: string }[]) => {
    const chatWin = getChatWindow()
    if (!chatWin) return

    try {
      await streamChat(messages, chatWin)
    } catch (error) {
      chatWin.webContents.send('ai:stream-chunk', `\n\n> 错误：${formatAiError(error)}`)
      chatWin.webContents.send('ai:stream-done')
    }
  })

  ipcMain.handle('ai:extract-term', async (_event, content: string) => {
    return await extractTerm(content)
  })

  ipcMain.handle('store:get-api-key', () => {
    return getApiKey() ? MASKED_KEY : ''
  })

  ipcMain.handle('store:set-api-key', async (_event, key: string) => {
    setApiKey(key)
    return true
  })

  ipcMain.handle('store:get-config', () => ({
    apiKey: getApiKey() ? MASKED_KEY : '',
    apiBaseUrl: getApiBaseUrl(),
    apiModel: getApiModel()
  }))

  ipcMain.handle(
    'store:set-config',
    (_event, cfg: { apiKey?: string; apiBaseUrl?: string; apiModel?: string }) => {
      if (cfg.apiKey !== undefined && cfg.apiKey.trim()) setApiKey(cfg.apiKey.trim())
      if (cfg.apiBaseUrl !== undefined && cfg.apiBaseUrl.trim()) setApiBaseUrl(cfg.apiBaseUrl.trim())
      if (cfg.apiModel !== undefined && cfg.apiModel.trim()) setApiModel(cfg.apiModel.trim())
      return true
    }
  )

  ipcMain.on('data:request-force-sync', () => {
    getSearchWindow()?.webContents.send('data:force-sync')
    getChatWindow()?.webContents.send('data:force-sync')
  })
}
