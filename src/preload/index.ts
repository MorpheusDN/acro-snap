import { contextBridge, ipcRenderer } from 'electron'

const electronAPI = {
  // Window control
  hideSearch: (): void => { ipcRenderer.send('window:hide-search') },
  minimizeChat: (): void => { ipcRenderer.send('window:minimize-chat') },
  closeChat: (): void => { ipcRenderer.send('window:close-chat') },

  // Search → Chat handoff
  openChatWithTerm: (term: unknown): void => {
    ipcRenderer.send('window:open-chat-with-term', JSON.stringify(term))
  },

  // Listen for reset signal (search window)
  onSearchReset: (cb: () => void): void => {
    ipcRenderer.on('search:reset', cb)
  },

  // Listen for init term (chat window)
  onChatInitTerm: (cb: (term: unknown) => void): void => {
    ipcRenderer.on('chat:init-term', (_event, term) => cb(term))
  },

  // AI: single query
  aiQuery: (abbr: string): Promise<unknown> => ipcRenderer.invoke('ai:query', abbr),

  // AI: streaming chat
  aiChat: (messages: { role: string; content: string }[]): Promise<void> =>
    ipcRenderer.invoke('ai:chat', messages),

  // AI: stream events
  onAiStreamChunk: (cb: (chunk: string) => void): void => {
    ipcRenderer.on('ai:stream-chunk', (_event, chunk) => cb(chunk))
  },
  onAiStreamDone: (cb: () => void): void => {
    ipcRenderer.on('ai:stream-done', cb)
  },

  // AI: extract term
  aiExtractTerm: (content: string): Promise<unknown> =>
    ipcRenderer.invoke('ai:extract-term', content),

  // Store
  getApiKey: (): Promise<string> => ipcRenderer.invoke('store:get-api-key'),
  setApiKey: (key: string): Promise<boolean> => ipcRenderer.invoke('store:set-api-key', key),
  getConfig: (): Promise<{ apiKey: string; apiBaseUrl: string; apiModel: string }> =>
    ipcRenderer.invoke('store:get-config'),
  setConfig: (cfg: { apiKey?: string; apiBaseUrl?: string; apiModel?: string }): Promise<boolean> =>
    ipcRenderer.invoke('store:set-config', cfg),

  // Tray events
  onTrayRequestApiKey: (cb: () => void): void => {
    ipcRenderer.on('tray:request-api-key', cb)
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', electronAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electronAPI = electronAPI
}
