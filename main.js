const {app, BrowserWindow, Menu, dialog, ipcMain} = require('electron');

let mainWindow = null;

ipcMain.on("test", (event, test) => {
    console.log(test);
})

app.on('ready', () => {
    // Menu.setApplicationMenu(appMenu);
    mainWindowOptions = {
        // autoHideMenuBar: true,
        webPreferences: {
        //     // preload: path.resolve(__dirname, 'preload.js'),
            contextIsolation: false,
            sandbox: true
        },
        // show: false,
        // titleBarStyle: 'hidden',
        webPreferences: {
            contextIsolation: false,
            enableRemoteModule: true,
            nodeIntegration: true,
            // nodeIntegrationInWorker: true,
        },
    }
    mainWindow = new BrowserWindow(mainWindowOptions);
    mainWindow.webContents.loadFile('ui/index.html');
    // mainWindow.webContents.loadURL('http://127.0.0.1:5500/ui/'); // 调试时候用Live Server自动重整
    // mainWindow.on('ready-to-show', () => mainWindow.show());
});
