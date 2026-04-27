import React, { useState, useEffect, useRef, useCallback } from 'react'
import { WindowControls } from './components/WindowControls'
import { MessageBubble } from './components/MessageBubble'
import { ChatInput } from './components/ChatInput'
import { ApiKeyModal } from './components/ApiKeyModal'
import { loadTerms, isOnline, saveTerm } from '../shared/termStore'
import type { ChatMessage, Term } from '../shared/types'

export function ChatApp(): React.JSX.Element {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [streaming, setStreaming] = useState(false)
  const [offline, setOffline] = useState(!isOnline())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const streamBufferRef = useRef('')

  useEffect(() => {
    loadTerms()
    const onOnline = (): void => setOffline(false)
    const onOffline = (): void => setOffline(true)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)

    // Listen for init term from Search window
    window.electronAPI.onChatInitTerm((term: Term) => {
      const initMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: `请详细解释 **${term.abbr}**（${term.full_name}）的含义、应用场景以及相关概念。`,
        timestamp: Date.now()
      }
      setMessages([initMsg])
      sendToAi([initMsg])
    })

    // Listen for stream chunks
    window.electronAPI.onAiStreamChunk((chunk: string) => {
      streamBufferRef.current += chunk
      setMessages((prev) => {
        const last = prev[prev.length - 1]
        if (last?.role === 'assistant') {
          return [
            ...prev.slice(0, -1),
            { ...last, content: streamBufferRef.current }
          ]
        }
        return [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: streamBufferRef.current,
            timestamp: Date.now()
          }
        ]
      })
    })

    // Listen for stream done
    window.electronAPI.onAiStreamDone(() => {
      streamBufferRef.current = ''
      setStreaming(false)
    })

    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendToAi = useCallback(
    async (msgs: ChatMessage[]) => {
      if (!isOnline()) return
      setStreaming(true)
      streamBufferRef.current = ''
      // Add empty assistant placeholder
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content: '', timestamp: Date.now() }
      ])
      await window.electronAPI.aiChat(msgs.map((m) => ({ role: m.role, content: m.content })))
    },
    []
  )

  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim() || streaming) return
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: text,
        timestamp: Date.now()
      }
      setMessages((prev) => {
        const next = [...prev, userMsg]
        sendToAi(next)
        return next
      })
    },
    [streaming, sendToAi]
  )

  const handleExtract = useCallback(
    async (content: string) => {
      if (!isOnline()) return
      try {
        const result = await window.electronAPI.aiExtractTerm(content)
        if (result) {
          await saveTerm({
            abbr: result.abbr,
            full_name: result.full_name,
            zh_meaning: result.zh_meaning,
            formula: result.formula ?? null,
            tags: [],
            related_links: []
          })
        }
      } catch (e) {
        console.error('Extract failed', e)
      }
    },
    []
  )

  return (
    <div className="flex flex-col h-screen bg-transparent text-zinc-800 dark:text-zinc-100">
      {/* Custom title bar */}
      <WindowControls title="AcroSnap" />

      {/* Offline banner */}
      {offline && (
        <div className="text-xs text-center py-1 px-3 bg-amber-500/80 text-white">
          当前离线，AI 解析与同步功能不可用
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-zinc-400 dark:text-zinc-500 gap-2">
            <svg className="w-10 h-10 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm">按 Alt+2 唤起，或从查询窗口点击「深度追问」</p>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isStreaming={streaming && msg === messages[messages.length - 1] && msg.role === 'assistant'}
            onExtract={msg.role === 'assistant' ? () => handleExtract(msg.content) : undefined}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={streaming || offline} />

      {/* API Key Settings Modal */}
      <ApiKeyModal />
    </div>
  )
}
