import type { AiResult, Term } from '../renderer/src/shared/types'

export interface ElectronAPI {
  hideSearch: () => void
  minimizeChat: () => void
  closeChat: () => void
  openChatWithTerm: (term: Term) => void
  onSearchReset: (cb: () => void) => void
  onChatInitTerm: (cb: (term: Term) => void) => void
  aiQuery: (abbr: string) => Promise<AiResult>
  aiChat: (messages: { role: string; content: string }[]) => Promise<void>
  onAiStreamChunk: (cb: (chunk: string) => void) => void
  onAiStreamDone: (cb: () => void) => void
  aiExtractTerm: (content: string) => Promise<AiResult | null>
  getApiKey: () => Promise<string>
  setApiKey: (key: string) => Promise<boolean>
  getConfig: () => Promise<{ apiKey: string; apiBaseUrl: string; apiModel: string }>
  setConfig: (cfg: { apiKey?: string; apiBaseUrl?: string; apiModel?: string }) => Promise<boolean>
  onTrayRequestApiKey: (cb: () => void) => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
