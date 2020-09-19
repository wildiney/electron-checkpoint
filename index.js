const { app, BrowserWindow, ipcMain, Tray, Menu, screen } = require('electron')
const path = require('path')
const Norber = require('./src/helpers/norber')

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 260,
        height: 320,
        frame: false,
        show: true,
        alwaysOnTop: true,
        darkTheme: true,
        skipTaskbar: true,
        webPreferences: {
            nodeIntegration: true
        }
    })
    const { x, y, height, width } = mainWindow.getBounds()

    mainWindow.setBounds({
        x: screen.getPrimaryDisplay().bounds.width - (width + 20),
        y: screen.getPrimaryDisplay().bounds.height - (height + 50),
        height,
        width
    })

    mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'))
    mainWindow.webContents.openDevTools({ detached: true })

}

app.on('ready', () => {
    createWindow();
    const norber = new Norber()
    norber.getCheckpoints().then((checkpoint) => {
        console.log("checkpoint", checkpoint)
        mainWindow.webContents.send('checkpoint:result', checkpoint)
    })

    if (app.dock) app.dock.hide()

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Quit',
            acelerator: 'Ctrl+Q',
            click: () => { app.quit() }
        }
    ])

    tray = new Tray(path.join(__dirname, 'src', 'assets', 'img', 'clock.png'));
    tray.setToolTip('Checkpoint');
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
    const norber = new Norber()

    norber.checkpoint().then((result) => {
        event.sender.send('checkpoint:return', result)

        norber.getCheckpoints().then((checkpoint) => {
            console.log("checkpoint", checkpoint)
            mainWindow.webContents.send('checkpoint:result', checkpoint)
        })
    })


})

setInterval(() => {
    console.log("interval")
    const norber = new Norber()
    norber.getCheckpoints().then((checkpoint) => {
        console.log("checkpoint", checkpoint)
        mainWindow.webContents.send('checkpoint:result', checkpoint)
    })
}, 20 * 60 * 1000)