/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import { app, BrowserWindow, screen, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';

import Norber from './utils/Norber'

export default class AppUpdater {
  constructor () {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map((name) => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 260,
    height: 320,
    webPreferences:
      (process.env.NODE_ENV === 'development' ||
        process.env.E2E_BUILD === 'true') &&
        process.env.ERB_SECURE !== 'true'
        ? {
          nodeIntegration: true,
        }
        : {
          preload: path.join(__dirname, 'dist/renderer.prod.js'),
        },
  });

  const { x, y, width, height } = mainWindow.getBounds()

  mainWindow.setBounds({
    x: screen.getPrimaryDisplay().bounds.width - (width + 20),
    y: screen.getPrimaryDisplay().bounds.height - (height + 50),
    height,
    width
  })

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      // norber.getCheckpoints().then((checkpoint) => {
      //   console.log("checkpoint", checkpoint)
      //   mainWindow.webContents.send('checkpoint:result', checkpoint)
      // })
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

if (process.env.E2E_BUILD === 'true') {
  // eslint-disable-next-line promise/catch-or-return
  app.whenReady().then(createWindow);
} else {
  app.on('ready', createWindow);
}

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

app.allowRendererProcessReuse = false

ipcMain.on('checkpoint:get', (event, arg) => {
  console.log('checkpoint get')


  const norber = new Norber(arg.user, arg.password, arg.company, arg.url)

  norber.getCheckpoints().then((checkpoint) => {
    mainWindow.webContents.send('checkpoint:getReturn', checkpoint)
  })

})
ipcMain.on('checkpoint:set', (event, arg) => {
  console.log('checkpoint set')

  const norber = new Norber(arg.user, arg.password, arg.company, arg.url)

  norber.checkpoint().then((result) => {
    // event.sender.send('checkpoint:getReturnFromCheckpoint', result)
    norber.getCheckpoints().then((checkpoint) => {
      mainWindow.webContents.send('checkpoint:getReturn', checkpoint)
    })
  })

})