const { app, BrowserWindow, ipcMain, Tray, Menu, screen } = require('electron')
const path = require('path')
const debug = require('electron-debug')
const Scrapper = require('./src/helpers/scrapper')

debug({
  devToolsMode: 'detach',
  showDevTools: true
})

let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 260,
    height: 350,
    frame: false,
    show: true,
    alwaysOnTop: true,
    darkTheme: true,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    }
  })
  const { height, width } = mainWindow.getBounds()

  mainWindow.setBounds({
    x: screen.getPrimaryDisplay().bounds.width - (width + 20),
    y: screen.getPrimaryDisplay().bounds.height - (height + 50),
    height,
    width
  })

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'))
  mainWindow.webContents.openDevTools({ mode: 'detach' })
}

app.on('ready', () => {
  createWindow()
  // if (app.dock) app.dock.hide()

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Quit',
      acelerator: 'Ctrl+Q',
      click: () => { app.quit() }
    }
  ])

  const tray = new Tray(path.join(__dirname, 'src', 'assets', 'img', 'clock.png'))
  tray.setToolTip('Checkpoint')
  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow.show()
    }
  })
  tray.setContextMenu(contextMenu)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

ipcMain.on('checkpoint:add', (event, arg) => {
  console.log('recebido')
  const scrapper = new Scrapper(arg.user, arg.password, arg.company, arg.url)

  scrapper.checkpoint().then((result) => {
    event.sender.send('checkpoint:return', result)

    scrapper.getCheckpoints().then((checkpoint) => {
      console.log('checkpoint', checkpoint)
      mainWindow.webContents.send('checkpoint:result', checkpoint)
    })
  })
})

ipcMain.on('checkpoint:get', (event, arg) => {
  console.log('checkpoint:get')
  const scrapper = new Scrapper(arg.user, arg.password, arg.company, arg.url)

  scrapper
    .getCheckpoints()
    .then((result) => {
      console.log('index.ts - results: ', result)
      event.sender.send('checkpoint:return', result)
    })
    .catch((e) => e.message)
})
