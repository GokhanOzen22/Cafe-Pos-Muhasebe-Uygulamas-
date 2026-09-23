const { contextBridge, ipcRenderer } = require('electron');

// Expose safe API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  
  // Direct silent print without showing Windows print dialog
  printDirect: (options = {}) => ipcRenderer.invoke('print-direct', options),
  
  // Get all installed printers on the Windows system (e.g. POS-80C)
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  
  // Toggle fullscreen/kiosk
  toggleFullScreen: () => ipcRenderer.invoke('toggle-fullscreen'),
});
