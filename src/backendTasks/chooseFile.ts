import { IpcMain, dialog, IpcMainEvent, BrowserWindow } from "electron";
import path from "path";

const chooseFile = async (event: IpcMainEvent, payload: { name: string; extensions: string[] }) => {
  console.info("choose-file", payload);
  try {
    const filePaths = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0], {
      properties: ["openFile"],
      filters: [
        {
          name: payload.name,
          extensions: payload.extensions,
        },
      ],
    });

    if (filePaths.canceled) {
      console.info("choose-file/failure", "cancel");
      return event.sender.send("choose-file/failure", { errorMessage: "Pressed cancel" });
    }
    if (filePaths.filePaths.length === 0) {
      console.info("choose-file/failure", "no files");
      return event.sender.send("choose-file/failure", { errorMessage: "No file selected" });
    }
    console.info("choose-file/success", { path: filePaths.filePaths[0], dirName: path.dirname(filePaths.filePaths[0]) });
    event.sender.send("choose-file/success", { path: filePaths.filePaths[0], dirName: path.dirname(filePaths.filePaths[0]) });
  } catch (error) {
    console.error("choose-file/failure", error);
    event.sender.send("choose-file/failure", { errorMessage: `${error instanceof Error ? error.message : error}` });
  }
};

export const registerChooseFile = (ipcMain: IpcMain) => {
  ipcMain.on("choose-file", chooseFile);
};
