import React from 'react'

interface WindowControlsProps {
  title: string
}

export function WindowControls({ title }: WindowControlsProps): React.JSX.Element {
  return (
    <div
      className="flex items-center justify-between px-4 py-3 flex-shrink-0"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-300 select-none">
        {title}
      </span>
      <div
        className="flex items-center gap-1.5"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <button
          className="w-3 h-3 rounded-full bg-yellow-400 hover:bg-yellow-500 transition-colors flex items-center justify-center group"
          onClick={() => window.electronAPI.minimizeChat()}
          title="最小化"
        >
          <span className="hidden group-hover:block text-yellow-900 text-[7px] leading-none">─</span>
        </button>
        <button
          className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-500 transition-colors flex items-center justify-center group"
          onClick={() => window.electronAPI.closeChat()}
          title="关闭"
        >
          <span className="hidden group-hover:block text-red-900 text-[7px] leading-none">✕</span>
        </button>
      </div>
    </div>
  )
}
