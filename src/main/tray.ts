import { Tray, Menu, nativeImage } from 'electron'
import { join } from 'path'
import { getSearchWindow, getChatWindow, toggleSearchWindow, toggleChatWindow } from './windowManager'

let tray: Tray | null = null

export function createTray(): Tray {
  const iconPath = join(__dirname, '../../resources/icon.png')
  const image = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })

  tray = new Tray(image)
  tray.setToolTip('AcroSnap')
  updateContextMenu()

  return tray
}

function updateContextMenu(): void {
  if (!tray) return

  const menu = Menu.buildFromTemplate([
    {
      label: 'AcroSnap',
      enabled: false
    },
    { type: 'separator' },
    {
      label: '搜索窗口 (Alt+1)',
      click: () => toggleSearchWindow()
    },
    {
      label: '问答窗口 (Alt+2)',
      click: () => toggleChatWindow()
    },
    { type: 'separator' },
    {
      label: '设置 API Key',
      click: async () => {
        // Open chat window and send a request to show the API Key input UI
        toggleChatWindow()
        const win = getChatWindow()
        if (win) {
          win.webContents.send('tray:request-api-key')
        }
      }
    },
    {
      label: '强制同步',
      click: () => {
        const searchWin = getSearchWindow()
        const chatWin = getChatWindow()
        searchWin?.webContents.send('data:force-sync')
        chatWin?.webContents.send('data:force-sync')
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      role: 'quit'
    }
  ])

  tray.setContextMenu(menu)
}
