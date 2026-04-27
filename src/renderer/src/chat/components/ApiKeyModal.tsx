import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const MASKED_KEY = '********'

export function ApiKeyModal(): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [apiBaseUrl, setApiBaseUrl] = useState('https://api.openai.com/v1')
  const [apiModel, setApiModel] = useState('gpt-4o-mini')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const loadConfig = async (): Promise<void> => {
      const cfg = await window.electronAPI.getConfig()
      setApiKey(cfg.apiKey === MASKED_KEY ? '' : cfg.apiKey)
      setApiBaseUrl(cfg.apiBaseUrl)
      setApiModel(cfg.apiModel)
    }

    const openSettings = (): void => {
      void loadConfig()
      setOpen(true)
    }

    window.electronAPI.onChatInitTerm(() => {})
    window.addEventListener('acro:open-api-settings', openSettings)

    return () => {
      window.removeEventListener('acro:open-api-settings', openSettings)
    }
  }, [])

  useEffect(() => {
    const handler = (): void => {
      window.electronAPI.getConfig().then((cfg) => {
        setApiKey(cfg.apiKey === MASKED_KEY ? '' : cfg.apiKey)
        setApiBaseUrl(cfg.apiBaseUrl)
        setApiModel(cfg.apiModel)
        setOpen(true)
      })
    }

    window.electronAPI.onTrayRequestApiKey(handler)
  }, [])

  const handleSave = async (): Promise<void> => {
    setSaving(true)
    try {
      await window.electronAPI.setConfig({
        apiKey: apiKey.trim(),
        apiBaseUrl: apiBaseUrl.trim(),
        apiModel: apiModel.trim()
      })
      setSaved(true)
      setTimeout(() => {
        setSaved(false)
        setOpen(false)
      }, 800)
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="w-[360px] space-y-4 rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-800"
          >
            <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">API Settings</h2>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Base URL
                </label>
                <input
                  type="text"
                  value={apiBaseUrl}
                  onChange={(e) => setApiBaseUrl(e.target.value)}
                  placeholder="https://api.openai.com/v1"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Model
                </label>
                <input
                  type="text"
                  value={apiModel}
                  onChange={(e) => setApiModel(e.target.value)}
                  placeholder="gpt-4o-mini"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                className="flex-1 rounded-lg bg-zinc-100 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                className={`flex-1 rounded-lg py-2 text-sm font-medium text-white transition-all ${
                  saved ? 'bg-green-500' : 'bg-blue-500 hover:bg-blue-600'
                }`}
                onClick={handleSave}
                disabled={saving || !apiKey.trim()}
              >
                {saving ? 'Saving...' : saved ? 'Saved' : 'Save'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
