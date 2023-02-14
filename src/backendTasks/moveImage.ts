import { SavingImage } from "@utils/SavingUtils";
import { IpcMain, IpcMainEvent } from "electron";
import fs from "fs";
import path from "path";

const pathsAreEqual = (path1: string, path2: string) => {
  const path1r = path.resolve(path1);
  const path2r = path.resolve(path2);
  if (process.platform == "win32") return path1r.toLowerCase() === path2r.toLowerCase();
  return path1r === path2r;
};

export const moveImage = async (event: IpcMainEvent, payload: { path: string; images: SavingImage }) => {
  console.info("move-image", payload);
  Promise.all(
    Object.entries(payload.images).map(async ([dest, src]) => {
      const fullDest = path.join(payload.path, dest);
      const parsedDest = path.parse(fullDest);
      if (pathsAreEqual(fullDest, src)) return;
      if (fs.existsSync(fullDest)) fs.renameSync(fullDest, path.join(payload.path, parsedDest.name + "_old" + parsedDest.ext));
      fs.copyFileSync(src, fullDest);
      return;
    })
  )
    .then(() => {
      console.info("move-image/success");
      return event.sender.send("move-image/success", {});
    })
    .catch((error) => {
      console.error("move-image/failure", error);
      return event.sender.send("move-image/failure", { errorMessage: `${error instanceof Error ? error.message : error}` });
    });
};

export const registerMoveImage = (ipcMain: IpcMain) => {
  ipcMain.on("move-image", moveImage);
};
