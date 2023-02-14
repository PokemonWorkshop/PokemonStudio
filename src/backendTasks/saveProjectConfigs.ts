import { IpcMain, IpcMainEvent } from "electron";
import fs from "fs";
import { SavingConfig } from "@utils/SavingUtils";
import path from "path";

const saveProjectConfigs = async (event: IpcMainEvent, payload: { path: string; configs: SavingConfig }) => {
  console.info("save-project-configs", {
    ...payload,
    configs: payload.configs.map(({ savingFilename, savingAction }) => ({ savingFilename, savingAction })),
  });
  const configsPath = path.join(payload.path, "Data/configs");
  Promise.all(
    payload.configs.map(async (sd) => {
      const filePath = path.join(configsPath, sd.savingFilename + ".json");
      if (sd.savingAction === "DELETE" && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      } else if (sd.data !== undefined) {
        fs.writeFileSync(filePath, sd.data);
      }
    })
  )
    .then(() => {
      console.info("save-project-configs/success");
      return event.sender.send("save-project-configs/success", {});
    })
    .catch((error) => {
      console.error("save-project-configs/failure", error);
      return event.sender.send("save-project-configs/failure", { errorMessage: `${error instanceof Error ? error.message : error}` });
    });
};

export const registerSaveProjectConfigs = (ipcMain: IpcMain) => {
  ipcMain.on("save-project-configs", saveProjectConfigs);
};
