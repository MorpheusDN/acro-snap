import React, { useState, useEffect, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { SearchBar } from './components/SearchBar'
import { ResultList } from './components/ResultList'
import { AiCard } from './components/AiCard'
import { loadTerms, searchTerms, isOnline, saveTerm } from '../shared/termStore'
import type { Term, AiResult, SearchMode } from '../shared/types'

export function SearchApp(): React.JSX.Element {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Term[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [mode, setMode] = useState<SearchMode>('idle')
  const [aiResult, setAiResult] = useState<AiResult | null>(null)
  const [offline, setOffline] = useState(!isOnline())

  useEffect(() => {
    loadTerms()
    const handleOnline = (): void => setOffline(false)
    const handleOffline = (): void => setOffline(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Reset state when window is hidden via main process
    window.electronAPI.onSearchReset(() => {
      setQuery('')
      setResults([])
      setMode('idle')
      setAiResult(null)
    })

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value)
      setAiResult(null)
      if (!value.trim()) {
        setResults([])
        setMode('idle')
        setSelectedIndex(0)
        return
      }
      const found = searchTerms(value)
      setResults(found)
      setMode(found.length > 0 ? 'searching' : 'searching')
      setSelectedIndex(0)
    },
    []
  )

  const handleAiQuery = useCallback(async () => {
    if (!query.trim() || !isOnline()) return
    setMode('ai-loading')
    try {
      const result = await window.electronAPI.aiQuery(query.trim())
      setAiResult(result)
      setMode('ai-result')
    } catch {
      setMode('searching')
    }
  }, [query])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setQuery('')
        setResults([])
        setMode('idle')
        setAiResult(null)
        window.electronAPI.hideSearch()
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
        return
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        if (mode === 'ai-result') return
        if (results.length > 0) {
          // term selected — show ai card for it
          const selected = results[selectedIndex]
          setAiResult({
            abbr: selected.abbr,
            full_name: selected.full_name,
            zh_meaning: selected.zh_meaning,
            formula: selected.formula
          })
          setMode('ai-result')
        } else if (query.trim() && isOnline()) {
          handleAiQuery()
        }
      }
    },
    [results, selectedIndex, mode, query, handleAiQuery]
  )

  const handleSave = useCallback(
    async (result: AiResult) => {
      await saveTerm({
        abbr: result.abbr,
        full_name: result.full_name,
        zh_meaning: result.zh_meaning,
        formula: result.formula ?? null,
        tags: [],
        related_links: []
      })
    },
    []
  )

  const handleDeepDive = useCallback(
    (result: AiResult) => {
      const term: Term = {
        id: '',
        abbr: result.abbr,
        full_name: result.full_name,
        zh_meaning: result.zh_meaning,
        formula: result.formula ?? null,
        tags: [],
        related_links: [],
        created_at: '',
        updated_at: ''
      }
      window.electronAPI.openChatWithTerm(term)
      setQuery('')
      setResults([])
      setMode('idle')
      setAiResult(null)
    },
    []
  )

  const hasResults = results.length > 0
  const noMatch = query.trim().length > 0 && results.length === 0 && mode !== 'ai-result' && mode !== 'ai-loading'
  const expanded = hasResults || mode === 'ai-loading' || mode === 'ai-result' || noMatch

  return (
    <div className="flex flex-col items-stretch" style={{ width: 600 }}>
      {offline && (
        <div className="text-xs text-center py-1 px-3 bg-amber-500/80 text-white rounded-t-xl">
          当前离线，AI 解析与同步功能不可用
        </div>
      )}
      <SearchBar
        query={query}
        onChange={handleQueryChange}
        onKeyDown={handleKeyDown}
        isLoading={mode === 'ai-loading'}
      />
      <AnimatePresence>
        {expanded && (
          <div className="bg-white/85 dark:bg-zinc-900/85 backdrop-blur-xl rounded-b-2xl border border-t-0 border-white/30 dark:border-white/10 shadow-2xl overflow-hidden max-h-[340px] overflow-y-auto">
            {mode === 'ai-result' && aiResult ? (
              <AiCard
                result={aiResult}
                onSave={() => handleSave(aiResult)}
                onDeepDive={() => handleDeepDive(aiResult)}
              />
            ) : mode === 'ai-loading' ? (
              <AiSkeleton />
            ) : hasResults ? (
              <ResultList
                results={results}
                selectedIndex={selectedIndex}
                onSelect={(idx) => {
                  const t = results[idx]
                  setAiResult({
                    abbr: t.abbr,
                    full_name: t.full_name,
                    zh_meaning: t.zh_meaning,
                    formula: t.formula
                  })
                  setMode('ai-result')
                }}
              />
            ) : noMatch ? (
              <NoMatch onAiQuery={handleAiQuery} offline={offline} />
            ) : null}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function AiSkeleton(): React.JSX.Element {
  return (
    <div className="p-4 space-y-3">
      <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse w-1/3" />
      <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse w-2/3" />
      <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse w-1/2" />
    </div>
  )
}

function NoMatch({
  onAiQuery,
  offline
}: {
  onAiQuery: () => void
  offline: boolean
}): React.JSX.Element {
  return (
    <div className="p-3 text-sm text-zinc-500 dark:text-zinc-400">
      {offline ? (
        <span>本地词库中未找到该词条</span>
      ) : (
        <button
          className="w-full text-left hover:text-zinc-800 dark:hover:text-zinc-100 transition-colors"
          onClick={onAiQuery}
        >
          未找到匹配词条，按 <kbd className="px-1 py-0.5 bg-zinc-100 dark:bg-zinc-700 rounded text-xs">Enter</kbd> 让 AI 解释
        </button>
      )}
    </div>
  )
}
