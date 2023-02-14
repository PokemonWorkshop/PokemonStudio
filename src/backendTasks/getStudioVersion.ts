import { app, IpcMainEvent } from "electron";

const getStudioVersion = (event: IpcMainEvent) => {
  console.info("get-studio-version");
  try {
    console.info("get-studio-version/success", { studioVersion: app.getVersion() });
    return event.sender.send("get-studio-version/success", { studioVersion: app.getVersion() });
  } catch (error) {
    console.error("get-studio-version/failure", error);
    event.sender.send("get-studio-version/failure", { errorMessage: `${error instanceof Error ? error.message : error}` });
  }
};

export const registergetStudioVersion = (ipcMain: Electron.IpcMain) => {
  ipcMain.on("get-studio-version", getStudioVersion);
};
