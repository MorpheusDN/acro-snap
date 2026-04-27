export interface Term {
  id: string
  abbr: string
  full_name: string
  zh_meaning: string
  formula?: string | null
  tags: string[]
  related_links: string[]
  created_at: string
  updated_at: string
}

export interface AiResult {
  abbr: string
  full_name: string
  zh_meaning: string
  formula?: string | null
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export type SearchMode = 'idle' | 'searching' | 'ai-loading' | 'ai-result'
