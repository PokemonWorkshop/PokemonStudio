import { dialog, BrowserWindow } from 'electron';
import log from 'electron-log';
import path from 'path';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';

/**
 * Fork-only backend task for the event editor's graphic picker: open a native
 * file dialog defaulting to the project's `graphics/characters` folder and
 * return the chosen file as an RMXP-style character name — path relative to
 * graphics/characters, forward slashes, extension stripped (RPG::Cache adds
 * the extension). Errors if the chosen file is outside graphics/characters.
 */

export type ChooseCharacterGraphicInput = { projectPath: string };
export type ChooseCharacterGraphicOutput = { name: string };

const chooseCharacterGraphic = async (payload: ChooseCharacterGraphicInput): Promise<ChooseCharacterGraphicOutput> => {
  log.info('choose-character-graphic');
  const charactersDir = path.join(payload.projectPath, 'graphics', 'characters');
  const result = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0], {
    properties: ['openFile'],
    defaultPath: charactersDir,
    filters: [{ name: 'Character graphic', extensions: ['png', 'gif'] }],
  });
  if (result.canceled || result.filePaths.length === 0) throw 'Pressed cancel';

  const chosen = result.filePaths[0];
  const rel = path.relative(charactersDir, chosen);
  if (rel.startsWith('..') || path.isAbsolute(rel)) throw 'Please pick an image inside graphics/characters';

  const name = rel.replace(/\\/g, '/').replace(/\.(png|gif)$/i, '');
  log.info('choose-character-graphic/success', { name });
  return { name };
};

export const registerChooseCharacterGraphic = defineBackendServiceFunction('choose-character-graphic', chooseCharacterGraphic);
