import { IpcMainEvent } from 'electron';
import fs from 'fs';
import path from 'path';
import { stringify } from 'csv-stringify/sync';

export const saveCSV = (projectPath: string, fileId: number, languages: string[]) => {
  const csvPath = path.join(projectPath, 'Data/Text/Studio', `${fileId}.csv`);
  const data = [languages, ['---', '---', '---', '---']];
  if (!fs.existsSync(csvPath)) {
    fs.writeFileSync(csvPath, stringify(data));
  }
};

export const baseForMaps = async (_: IpcMainEvent, projectPath: string) => {
  const languages = ['en', 'fr', 'it', 'es'];
  saveCSV(projectPath, 200002, languages);
  saveCSV(projectPath, 200003, languages);
  if (!fs.existsSync(path.join(projectPath, 'Data/Tiled'))) {
    fs.mkdirSync(path.join(projectPath, 'Data/Tiled'));
  }
  if (fs.existsSync(path.join(projectPath, 'Data/Studio/rmxp_maps.json'))) {
    fs.unlinkSync(path.join(projectPath, 'Data/Studio/rmxp_maps.json'));
  }
};
