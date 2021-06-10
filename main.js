const {app, globalShortcut, BrowserWindow, ipcMain, Tray} = require('electron')
const path = require('path')

const assetsDirectory = path.join(__dirname, 'assets')

let tray = undefined
let window = undefined

app.dock && app.dock.hide()

ipcMain.on('toggle-window', (event, arg) => {
  toggleWindow()
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('ready', () => {
  const ret = globalShortcut.register('CommandOrControl+Shift+Space', () => {
    toggleWindow()
  })

  createTray()
  createWindow()
})

// Quit the app when the window is closed
app.on('window-all-closed', () => {
  app.quit()
})

const createTray = () => {
  tray = new Tray(path.join(assetsDirectory, 'sunTemplate.png'))
  tray.on('right-click', toggleWindow)
  tray.on('double-click', toggleWindow)
  tray.on('click', function (event) {
    toggleWindow()
  })
}

const getWindowPosition = () => {
  const windowBounds = window.getBounds()
  const trayBounds = tray.getBounds()

  const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2))
  const y = Math.round(trayBounds.y + trayBounds.height + 4)

  return {x: x, y: y}
}

const createWindow = () => {
  window = new BrowserWindow({
    width: 300,
    height: 600,
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      backgroundThrottling: false
    }
  })

  window.loadURL(`file://${path.join(__dirname, 'page/index.html')}`)

  // Hide the window when it loses focus
  window.on('blur', () => {
    window.hide()
  })

  // Show devtools when command clicked
  // if (window.isVisible() && process.defaultApp && event.metaKey) {
    window.openDevTools({mode: 'detach'})
  // }

  window.on('show', () => {
    try {
      window.webContents.executeJavaScript(`
      var event = new Event('show')
      document.dispatchEvent(event)
      `)
    } catch (err) {}
  })
}

function toggleWindow () {
  if (window.isVisible()) {
    window.hide()
  } else {
    showWindow()
  }
}

const showWindow = () => {
  const position = getWindowPosition()
  window.setPosition(position.x, position.y, false)
  window.show()
  window.focus()
}

ipcMain.on('show-window', () => {
  showWindow()
})
