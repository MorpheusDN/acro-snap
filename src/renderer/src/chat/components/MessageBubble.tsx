import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { MarkdownRenderer } from '../../shared/MarkdownRenderer'
import type { ChatMessage } from '../../shared/types'

interface MessageBubbleProps {
  message: ChatMessage
  isStreaming: boolean
  onExtract?: () => void
}

export function MessageBubble({ message, isStreaming, onExtract }: MessageBubbleProps): React.JSX.Element {
  const [extracting, setExtracting] = useState(false)
  const [extracted, setExtracted] = useState(false)
  const isUser = message.role === 'user'

  const handleExtract = async (): Promise<void> => {
    if (!onExtract || extracting || extracted) return
    setExtracting(true)
    try {
      await onExtract()
      setExtracted(true)
    } finally {
      setExtracting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}
    >
      <div
        className={`relative max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-blue-500 text-white rounded-br-sm'
            : 'bg-white/70 dark:bg-zinc-800/70 backdrop-blur-sm text-zinc-800 dark:text-zinc-100 rounded-bl-sm border border-white/20 dark:border-zinc-700/40'
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <>
            <MarkdownRenderer
              content={message.content}
              className="prose prose-sm dark:prose-invert max-w-none"
            />
            {isStreaming && (
              <span className="inline-block w-1 h-4 bg-zinc-400 dark:bg-zinc-500 animate-pulse ml-0.5 align-text-bottom rounded-sm" />
            )}
          </>
        )}

        {/* Extract button for assistant messages */}
        {!isUser && !isStreaming && message.content && onExtract && (
          <button
            className={`absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-all text-xs px-2 py-0.5 rounded-full shadow-sm font-medium ${
              extracted
                ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                : 'bg-white dark:bg-zinc-700 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-zinc-600'
            }`}
            onClick={handleExtract}
            disabled={extracting || extracted}
          >
            {extracting ? '提取中…' : extracted ? '✓ 已入库' : '提取并入库'}
          </button>
        )}
      </div>
    </motion.div>
  )
}
