import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { MarkdownRenderer } from '../../shared/MarkdownRenderer'
import type { AiResult } from '../../shared/types'

interface AiCardProps {
  result: AiResult
  onSave: () => Promise<void>
  onDeepDive: () => void
}

export function AiCard({ result, onSave, onDeepDive }: AiCardProps): React.JSX.Element {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async (): Promise<void> => {
    if (saved || saving) return
    setSaving(true)
    try {
      await onSave()
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      className="p-4 space-y-3"
    >
      {/* Header */}
      <div className="flex items-baseline gap-2">
        <span className="font-mono font-bold text-lg text-blue-600 dark:text-blue-400">
          {result.abbr}
        </span>
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
          {result.full_name}
        </span>
      </div>

      {/* Chinese meaning */}
      <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
        {result.zh_meaning}
      </p>

      {/* Formula */}
      {result.formula && (
        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3 overflow-x-auto">
          <MarkdownRenderer
            content={`$$${result.formula}$$`}
            className="text-sm text-zinc-700 dark:text-zinc-200"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
            saved
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40'
          }`}
          onClick={handleSave}
          disabled={saving || saved}
        >
          {saving ? '保存中…' : saved ? '✓ 已保存' : '保存至本地库'}
        </button>
        <button
          className="flex-1 py-1.5 px-3 rounded-lg text-xs font-medium bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-all"
          onClick={onDeepDive}
        >
          深度追问 →
        </button>
      </div>
    </motion.div>
  )
}
