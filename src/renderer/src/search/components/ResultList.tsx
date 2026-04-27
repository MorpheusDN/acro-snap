import React from 'react'
import { motion } from 'framer-motion'
import type { Term } from '../../shared/types'

interface ResultListProps {
  results: Term[]
  selectedIndex: number
  onSelect: (index: number) => void
}

export function ResultList({ results, selectedIndex, onSelect }: ResultListProps): React.JSX.Element {
  return (
    <motion.ul
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
      className="py-1"
    >
      {results.map((term, idx) => (
        <li
          key={term.id || term.abbr}
          className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
            idx === selectedIndex
              ? 'bg-blue-500/10 dark:bg-blue-400/10'
              : 'hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60'
          }`}
          onClick={() => onSelect(idx)}
          onMouseEnter={() => onSelect(idx)}
        >
          <span className="font-mono font-semibold text-sm text-blue-600 dark:text-blue-400 w-16 flex-shrink-0 truncate">
            {term.abbr}
          </span>
          <span className="flex-1 text-sm text-zinc-700 dark:text-zinc-200 truncate">
            {term.full_name}
          </span>
          <span className="text-xs text-zinc-400 dark:text-zinc-500 flex-shrink-0 max-w-[140px] truncate">
            {term.zh_meaning}
          </span>
        </li>
      ))}
    </motion.ul>
  )
}
