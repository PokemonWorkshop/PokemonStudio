import { ProjectData, ProjectText, PSDKConfigs } from '@src/GlobalStateProvider';
import { serialize, serializeConfig } from '@utils/SerializationUtils';

export interface SavingPath {
  key: keyof ProjectData;
  id: string;
}

function sp2string(sp: SavingPath): string {
  return `${sp.key}/${sp.id}`;
}

function string2sp(str: string): SavingPath {
  const [key, id] = str.split('/', 2);
  return { key, id };
}

export type SavingAction = 'UPDATE' | 'DELETE';

export type SavingData = {
  savingPath: string;
  data: string | undefined;
  savingAction: SavingAction;
}[];

export class SavingMap {
  map: Map<string, SavingAction>;

  constructor(map?: Map<string, SavingAction>) {
    this.map = !map ? new Map<string, SavingAction>() : new Map(map);
  }

  set(sp: SavingPath, sa: SavingAction): Map<string, SavingAction> {
    return this.map.set(sp2string(sp), sa);
  }

  getSavingData(projectData: ProjectData): SavingData {
    return Array.from(this.map.entries()).map(([sp, sa]) => {
      const savingPath = string2sp(sp);

      return {
        savingPath: sp,
        data: sa == 'DELETE' ? undefined : serialize(projectData[savingPath.key][savingPath.id]),
        savingAction: sa,
      };
    });
  }
}

export type SavingConfigFilename = keyof PSDKConfigs;

export type SavingConfig = {
  savingFilename: string;
  data: string | undefined;
  savingAction: SavingAction;
}[];

export class SavingConfigMap {
  map: Map<string, SavingAction>;

  constructor(map?: Map<string, SavingAction>) {
    this.map = !map ? new Map<string, SavingAction>() : new Map(map);
  }

  set(filename: SavingConfigFilename, sa: SavingAction): Map<string, SavingAction> {
    return this.map.set(filename.toString(), sa);
  }

  getSavingConfig(projectConfig: PSDKConfigs): SavingConfig {
    return Array.from(this.map.entries()).map(([filename, sa]) => {
      return {
        savingFilename: filename,
        data: sa == 'DELETE' ? undefined : serializeConfig(projectConfig[filename as keyof PSDKConfigs]),
        savingAction: sa,
      };
    });
  }
}

export type SavingText = {
  projectTextSave: boolean[];
  projectText: string;
  keys: (keyof ProjectText)[];
};

export type SavingImage = { [path: string]: string };

export type ProjectStudioAction = 'READ' | 'UPDATE' | 'DELETE';
