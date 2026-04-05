const { ipcMain } = require("electron");

export  const  RegisterHandel =function () {
    console.log("RegisterHandel----");
    ipcMain.handle("ping", async () => {
        return "pong";
    });

    ipcMain.handle("getAppVersion", async () => {
        const { app } = require("electron");
        return app.getVersion();
    });

    ipcMain.handle("getAppPath", async () => {
        const { app } = require("electron");
        return app.getAppPath(); 
    });

    ipcMain.handle("getUserDataPath", async () => {
        const { app } = require("electron");
        return app.getPath("userData"); 
    });
}
