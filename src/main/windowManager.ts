import { BrowserWindow, screen } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

let searchWindow: BrowserWindow | null = null
let chatWindow: BrowserWindow | null = null

function getRendererUrl(page: string): string {
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    return `${process.env['ELECTRON_RENDERER_URL']}/${page}`
  }
  return join(__dirname, `../renderer/${page}`)
}

export function createSearchWindow(): BrowserWindow {
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize

  searchWindow = new BrowserWindow({
    width: 600,
    height: 60,
    minWidth: 600,
    minHeight: 60,
    maxHeight: 460,
    x: Math.round((sw - 600) / 2),
    y: Math.round(sh * 0.28),
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  // Hide on blur
  searchWindow.on('blur', () => {
    if (searchWindow?.isVisible()) {
      searchWindow.hide()
      // Signal renderer to clear state
      searchWindow.webContents.send('search:reset')
    }
  })

  if (is.dev) {
    searchWindow.loadURL(getRendererUrl('search.html'))
  } else {
    searchWindow.loadFile(getRendererUrl('search.html'))
  }

  return searchWindow
}

export function createChatWindow(): BrowserWindow {
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize

  chatWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 600,
    minHeight: 400,
    x: Math.round((sw - 800) / 2),
    y: Math.round((sh - 600) / 2),
    frame: false,
    transparent: false,
    resizable: true,
    skipTaskbar: true,
    show: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  // Apply Mica on Windows 11
  if (process.platform === 'win32') {
    try {
      chatWindow.setBackgroundMaterial('mica')
    } catch {
      // Fallback for older Windows
    }
  }

  if (is.dev) {
    chatWindow.loadURL(getRendererUrl('chat.html'))
  } else {
    chatWindow.loadFile(getRendererUrl('chat.html'))
  }

  return chatWindow
}

export function getSearchWindow(): BrowserWindow | null {
  return searchWindow
}

export function getChatWindow(): BrowserWindow | null {
  return chatWindow
}

export function toggleSearchWindow(): void {
  if (!searchWindow) return
  if (searchWindow.isVisible()) {
    searchWindow.hide()
    searchWindow.webContents.send('search:reset')
  } else {
    // Re-center on current display
    const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize
    searchWindow.setPosition(Math.round((sw - 600) / 2), Math.round(sh * 0.28))
    searchWindow.show()
    searchWindow.focus()
  }
}

export function toggleChatWindow(): void {
  if (!chatWindow) return
  if (chatWindow.isVisible()) {
    chatWindow.focus()
  } else {
    chatWindow.show()
    chatWindow.focus()
  }
}

export function showChatWithTerm(termJson: string): void {
  if (!chatWindow) return
  if (!chatWindow.isVisible()) {
    chatWindow.show()
  }
  chatWindow.focus()
  chatWindow.webContents.send('chat:init-term', JSON.parse(termJson))
}
