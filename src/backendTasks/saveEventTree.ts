import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';

export type SaveEventTreeInput = { projectPath: string; eventTree: string };

const saveEventTree = async (payload: SaveEventTreeInput) => {
  log.info('save-event-tree');
  fs.writeFileSync(path.join(payload.projectPath, 'Data', 'Studio', 'event_tree.json'), payload.eventTree);
  log.info('save-event-tree/success');
  return {};
};

export const registerSaveEventTree = defineBackendServiceFunction('save-event-tree', saveEventTree);
