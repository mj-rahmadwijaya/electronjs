console.log('run away------')
const { Notification } = require('electron')
const { app, BrowserWindow, ipcMain, dialog, Menu, nativeTheme, globalShortcut } = require('electron/main')
const path = require('node:path')

const { addRxPlugin } = require('rxdb');
const { createRxDatabase } = require('rxdb');
const { wrappedValidateAjvStorage } = require('rxdb/plugins/validate-ajv');
const { getRxStorageMemory } = require('rxdb/plugins/storage-memory');
const { RxDBDevModePlugin } = require('rxdb/plugins/dev-mode');

addRxPlugin(RxDBDevModePlugin);

const initDatabase = async () => {
    const myDatabase = await createRxDatabase({
        name: 'db-electron',
        storage: wrappedValidateAjvStorage({
            storage: getRxStorageMemory()
        })
    });

    await myDatabase.addCollections({
        todos: {
            schema: {
                version: 0,
                primaryKey: 'id',
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        maxLength: 100 // <- the primary key must have maxLength
                    },
                    name: {
                        type: 'string'
                    },
                    done: {
                        type: 'boolean'
                    }
                },
                required: ['id', 'name', 'done']
            }
        }
    });

    return myDatabase
}


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
async function cretedDbRxDB() {
    global.db = await initDatabase();
}

async function insertToDB(item) {
    await db.todos.insert(item);
}

app.whenReady().then(() => {
    createWindow()
    cretedDbRxDB()
    // new Notification({ title: "Show notification", body: "Check logs! bla bla bla" }).show();

    globalShortcut.register('Alt+CommandOrControl+I', () => {
        console.log('Electron loves global shortcuts!')
    })
    ipcMain.on('counter-value', (_event, value) => {
        console.log(value) // will print value to Node console
    })
    ipcMain.handle('dialog:openFile', handleFileOpen)

    ipcMain.handle('fetch-product-category-list', fetchProductCategoryList)
    ipcMain.handle('fetch-product-by-category', async (event, category) => {
        return await fetchProductByCategory(category);
    })

    ipcMain.handle('get-item-db', async () => {
        const x = await db.todos.find().exec();
        return JSON.stringify(x);
    })
    ipcMain.handle('insert-to-db', async (event, item) => {
        await insertToDB(item);
    })
    ipcMain.handle('update-item-db', async (event, item) => {
        const todo = await db.todos.findOne(item.id).exec()
        await todo.patch({
            name: item.name
        })
    })
    ipcMain.handle('delete-item-db', async (event, id) => {
        const todo = await db.todos.findOne(id).exec()
        await todo.remove();
    })
    ipcMain.handle('subscribe-item-db', async () => {
        const x = await db.todos.find().$.subscribe(results => {
            console.log('----', results.length);
        })
        return '';
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

