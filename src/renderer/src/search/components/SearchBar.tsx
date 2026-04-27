import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface SearchBarProps {
  query: string
  onChange: (value: string) => void
  onKeyDown: (e: React.KeyboardEvent) => void
  isLoading: boolean
}

export function SearchBar({ query, onChange, onKeyDown, isLoading }: SearchBarProps): React.JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Auto-focus whenever the window becomes visible
    const focus = (): void => {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
    focus()
    window.addEventListener('focus', focus)
    return () => window.removeEventListener('focus', focus)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="flex items-center gap-3 px-4 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-white/10 shadow-2xl"
      style={{ height: 60 }}
    >
      {/* Search icon */}
      <svg
        className="w-5 h-5 text-zinc-400 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
        />
      </svg>

      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="搜索缩写词，如 BERT、LLM…"
        className="flex-1 bg-transparent outline-none text-base text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
        autoComplete="off"
        spellCheck={false}
      />

      {isLoading && (
        <svg
          className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}

      {query && !isLoading && (
        <button
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 flex-shrink-0"
          onClick={() => onChange('')}
          tabIndex={-1}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </motion.div>
  )
}
