import Electron, { IpcMainEvent } from "electron";
import { mkdirSync } from "fs";
import { getAppRootPath } from "./getAppRootPath";
import path from "path";
import extract from "extract-zip";
import { ZipFile } from "yauzl";

const PSDK_PROJECT_PATH = "new-project.zip";

const extractNewProject = async (event: IpcMainEvent, payload: { projectDirName: string }) => {
  console.info("extract-new-project", payload);
  const countEntry = { value: 1 };
  try {
    console.info("extract-new-project/creating directory");
    mkdirSync(payload.projectDirName);
    console.info("extract-new-project/extract");
    await extract(path.join(getAppRootPath(), PSDK_PROJECT_PATH), {
      dir: payload.projectDirName,
      onEntry: (_, zipFile: ZipFile) => {
        const progress = ((countEntry.value / zipFile.entryCount) * 100).toFixed(1);
        event.sender.send("extract-new-project/progress", { step: progress, total: 100, stepText: "" });
        countEntry.value++;
      },
    });
    return event.sender.send("extract-new-project/success", {});
  } catch (error) {
    console.error("extract-new-project/failure", error);
    event.sender.send("extract-new-project/failure", { errorMessage: `${error instanceof Error ? error.message : error}` });
  }
};

export const registerExtractNewProject = (ipcMain: Electron.IpcMain) => {
  ipcMain.on("extract-new-project", extractNewProject);
};
