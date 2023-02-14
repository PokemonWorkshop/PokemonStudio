import { IpcMain, IpcMainEvent } from "electron";
import fs from "fs";
import path from "path";
import { stringify } from "csv-stringify/sync";
import { ProjectText } from "@src/GlobalStateProvider";
import { SavingText } from "@utils/SavingUtils";

const saveProjectTexts = async (event: IpcMainEvent, payload: { path: string; texts: SavingText }) => {
  console.info("save-project-texts", { path: payload.path });
  try {
    const projectTextPath = path.join(payload.path, "Data/Text/Dialogs");
    const projectText = JSON.parse(payload.texts.projectText) as ProjectText;
    Promise.all(
      payload.texts.projectTextSave.map(async (b, i) => {
        if (b) {
          const file = payload.texts.keys[i];
          const filePath = path.join(projectTextPath, file.toString() + ".csv");
          fs.writeFileSync(filePath, stringify(projectText[file]));
        }
      })
    )
      .then(() => {
        console.info("save-project-texts/success");
        return event.sender.send("save-project-texts/success", {});
      })
      .catch((error) => {
        console.error("save-project-texts/failure", error);
        return event.sender.send("save-project-texts/failure", { errorMessage: `${error instanceof Error ? error.message : error}` });
      });
  } catch (error) {
    console.error("save-project-texts/failure", error);
    event.sender.send("save-project-texts/failure", { errorMessage: `${error instanceof Error ? error.message : error}` });
  }
};

export const registerSaveProjectTexts = (ipcMain: IpcMain) => {
  ipcMain.on("save-project-texts", saveProjectTexts);
};
