console.log('run away------')
const { Notification } = require('electron')
const { app, BrowserWindow, ipcMain, dialog, Menu, nativeTheme, globalShortcut } = require('electron/main')
const path = require('node:path')

const createWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    ipcMain.on('set-data', (event, data) => {
        const webContents = event.sender;
        const win = BrowserWindow.fromWebContents(webContents);
        console.log(data);
    })

    const menu = Menu.buildFromTemplate([
        {
            label: 'Counter',
            submenu: [
                {
                    click: () => mainWindow.webContents.send('update-counter', 1),
                    label: 'Increment'
                },
                {
                    click: () => mainWindow.webContents.send('update-counter', -1),
                    label: 'Decrement'
                },
            ]
        }, {
            label: 'Helper',
            submenu: [
                {
                    role: 'help',
                    accelerator: process.platform === 'darwin' ? 'Alt+Cmd+O' : 'Alt+Shift+O',
                    click: () => { console.log('Electron rocks!') }
                }
            ]
        }
    ])
      
    ///menu bar
    // Menu.setApplicationMenu(menu)

    // mainWindow.loadFile('index.html')
    mainWindow.loadURL('http://localhost:3001')
    
}

async function handleFileOpen() {
    const { canceled, filePaths } = await dialog.showOpenDialog()
    if (!canceled) {
        return filePaths[0]
    }
}

ipcMain.handle('dark-mode:toggle', () => {
    if (nativeTheme.shouldUseDarkColors) {
        nativeTheme.themeSource = 'light'
    } else {
        nativeTheme.themeSource = 'dark'
    }
    return nativeTheme.shouldUseDarkColors
})

async function fetchProductCategoryList() {
    const response = await fetch('https://dummyjson.com/products/category-list')
    const data = await response.json();
    return data
}
 
async function fetchProductByCategory(category) {
    const response = await fetch(`https://dummyjson.com/products/category/${category}`)
    const data = await response.json();
    return data
}

app.whenReady().then(() => {
    
    // new Notification({ title: "Show notification", body: "Check logs! bla bla bla" }).show();

    globalShortcut.register('Alt+CommandOrControl+I', () => {
        console.log('Electron loves global shortcuts!')
      })
    ipcMain.on('counter-value', (_event, value) => {
        console.log(value) // will print value to Node console
    })
    ipcMain.handle('dialog:openFile', handleFileOpen)
    createWindow()
    ipcMain.handle('fetch-product-category-list', fetchProductCategoryList)
    ipcMain.handle('fetch-product-by-category', async (event, category) => {
        return await fetchProductByCategory(category);
    })
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

