"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const node_path_1 = __importDefault(require("node:path"));
const isDev = Boolean(process.env.VITE_DEV_SERVER_URL);
async function createWindow() {
    const window = new electron_1.BrowserWindow({
        width: 1580,
        height: 980,
        minWidth: 1280,
        minHeight: 820,
        backgroundColor: '#090812',
        title: 'DJ App 2',
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            preload: node_path_1.default.join(__dirname, 'preload.js'),
        },
    });
    if (isDev && process.env.VITE_DEV_SERVER_URL) {
        await window.loadURL(process.env.VITE_DEV_SERVER_URL);
        window.webContents.openDevTools({ mode: 'detach' });
        return;
    }
    await window.loadFile(node_path_1.default.join(__dirname, '..', 'dist', 'index.html'));
}
electron_1.app.whenReady().then(async () => {
    await createWindow();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            void createWindow();
        }
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
//# sourceMappingURL=main.js.map