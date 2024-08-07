const { app, BrowserWindow, nativeImage, session, ipcMain } = require('electron')
const path = require('node:path')

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 840,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    resizable: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#ff7F00',
      symbolColor: '#000000',
      height: 40
    },
    icon: "./bmd.ico"
  })
  mainWindow.loadFile('index.html')
  // mainWindow.webContents.openDevTools()
  ipcMain.on("command", (event, command) => {
    switch(command + ""){
      case "quit":
        app.quit()
        break;
      default:
        break;
    }
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src 'self'; script-src 'self' cdn.statically.io; style-src 'self' 'unsafe-inline'"]
      }
    })
  })

})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

