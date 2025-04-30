const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
  setData: (data) => ipcRenderer.send('set-data', data),
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  onUpdateCounter: (callback) => ipcRenderer.on('update-counter', (_event, value) => callback(value)),
  counterValue: (value) => ipcRenderer.send('counter-value', value),
  toggleMode: () => ipcRenderer.invoke('dark-mode:toggle'),
  fetchProductCategoryList: () => ipcRenderer.invoke('fetch-product-category-list'),
  fetchProductByCategory: (category) => ipcRenderer.invoke('fetch-product-by-category', category), 
})