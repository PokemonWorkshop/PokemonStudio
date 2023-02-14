import { IpcMainEvent } from "electron";
import path from "path";
import fs from "fs";
import { PSDKConfigs, psdkConfigKeys } from "@src/GlobalStateProvider";

export type ProjectConfigsFromBackEnd = Record<keyof PSDKConfigs, string>;

const readProjectConfigs = async (event: IpcMainEvent, payload: { path: string }) => {
  console.info("read-project-configs");
  try {
    const projectConfigs = psdkConfigKeys.reduce((prev, curr, index) => {
      event.sender.send("read-project-configs/progress", { step: index + 1, total: psdkConfigKeys.length, stepText: curr });
      const fileData = fs.readFileSync(path.join(payload.path, "Data/configs", `${curr}.json`), { encoding: "utf-8" });
      return { ...prev, [curr]: fileData };
    }, {} as ProjectConfigsFromBackEnd);
    console.info("read-project-configs/success");
    event.sender.send("read-project-configs/success", projectConfigs);
  } catch (error) {
    console.error("read-project-configs/failure", error);
    event.sender.send("read-project-configs/failure", { errorMessage: `${error instanceof Error ? error.message : error}` });
  }
};

export const registerReadProjectConfigs = (ipcMain: Electron.IpcMain) => {
  ipcMain.on("read-project-configs", readProjectConfigs);
};
