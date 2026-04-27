import { app, globalShortcut } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import {
  createSearchWindow,
  createChatWindow,
  toggleSearchWindow,
  toggleChatWindow
} from './windowManager'
import { createTray } from './tray'
import { registerIpcHandlers } from './ipcHandlers'

// Prevent multiple instances
if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.acrosnap.app')

  // Pre-create both windows so they hot-start
  createSearchWindow()
  createChatWindow()
  createTray()
  registerIpcHandlers()

  // Global shortcuts
  globalShortcut.register('Alt+1', () => toggleSearchWindow())
  globalShortcut.register('Alt+2', () => toggleChatWindow())

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

// Keep app running when all windows are closed (tray app)
app.on('window-all-closed', () => {
  // Do not quit — stay in tray
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
