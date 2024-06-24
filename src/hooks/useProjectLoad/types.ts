import type { DbSymbol } from '@modelEntities/dbSymbol';
import type { StudioProject } from '@modelEntities/project';
import type { PSDKVersion } from '@services/getPSDKVersion';
import type { PSDKConfigs, ProjectText, State } from '@src/GlobalStateProvider';
import type { ProjectDataFromBackEnd } from '@src/backendTasks/readProjectData';

export type PreGlobalState = Omit<
  State,
  | 'selectedDataIdentifier'
  | 'savingData'
  | 'savingConfig'
  | 'savingText'
  | 'savingProjectStudio'
  | 'currentPSDKVersion'
  | 'lastPSDKVersion'
  | 'projectPath'
  | 'savingLanguage'
  | 'savingTextInfos'
  | 'savingMapInfo'
  | 'mapsModified'
> & { projectPath: string };
export type ProjectLoadFailureCallback = (error: { errorMessage: string }) => void;
export type ProjectLoadSuccessCallback = (payload: Record<string, never>) => void;
export type ProjectLoadIntegrityFailureCallback = (count: number) => void;
export type ProjectLoadStateObject =
  | { state: 'done' }
  | { state: 'choosingProjectFile' }
  | { state: 'readingVersion'; projectDirName: string }
  | { state: 'readProjectMetadata'; projectDirName: string; studioVersion: string }
  | { state: 'migrateProjectData'; projectDirName: string; studioVersion: string; projectVersion: string }
  | { state: 'writeProjectMetadata'; projectDirName: string; studioVersion: string; projectMetaData: StudioProject }
  | { state: 'updateTextInfos'; projectDirName: string; studioVersion: string; projectMetaData: StudioProject }
  | { state: 'RMXP2StudioMapsSync'; projectDirName: string; studioVersion: string; projectMetaData: StudioProject }
  | { state: 'readProjectConfigs'; projectDirName: string; studioVersion: string; projectMetaData: StudioProject }
  | {
      state: 'readProjectData';
      projectDirName: string;
      studioVersion: string;
      projectMetaData: StudioProject;
      projectConfigs: PSDKConfigs;
    }
  | {
      state: 'readProjectText';
      projectDirName: string;
      studioVersion: string;
      projectMetaData: StudioProject;
      projectConfigs: PSDKConfigs;
      projectData: ProjectDataFromBackEnd;
    }
  | {
      state: 'deserializeProjectData';
      projectDirName: string;
      studioVersion: string;
      projectMetaData: StudioProject;
      projectConfigs: PSDKConfigs;
      projectData: ProjectDataFromBackEnd;
      projectTexts: ProjectText;
    }
  | { state: 'checkMapsModified'; preState: PreGlobalState }
  | { state: 'readCurrentPSDKVersion'; preState: PreGlobalState; mapsModified: DbSymbol[] }
  | {
      state: 'checkLastPSDKVersion';
      preState: PreGlobalState;
      mapsModified: DbSymbol[];
      currentPSDKVersion: PSDKVersion;
    }
  | {
      state: 'finalizeGlobalState';
      preState: PreGlobalState;
      mapsModified: DbSymbol[];
      currentPSDKVersion: PSDKVersion;
      lastPSDKVersion: PSDKVersion;
    }
  | { state: 'openProject' };
export type ProjectLoadFunctionBinding = {
  onSuccess: ProjectLoadSuccessCallback;
  onFailure: ProjectLoadFailureCallback;
  onIntegrityFailure: ProjectLoadIntegrityFailureCallback;
};
