import ProjectStudioModel from '@modelEntities/ProjectStudio.model';
import IpcService from '@services/IPC/ipc.service';
import { ProjectType } from '@services/project.open.channel.service';
import { ProjectData, ProjectText, PSDKConfigs } from '@src/GlobalStateProvider';

export type IPCError = { error: string };
export type ProjectOpenReturnValue = { projectPath: string } | IPCError;
export type ProjectStudioReturnValue = { projectStudio: string } | IPCError;
export type ProjectLoadingReturnValue = { projectData: ProjectData } | IPCError;
export type ProjectTextReturnValue = { projectText: ProjectText } | IPCError;
export type GetFilePathReturnValue = { filePath: string } | IPCError;
export type VersionsReturnValue = { psdkVersion: string; studioVersion: string } | IPCError;
export type FileExistsReturnValue = { fileExists: boolean } | IPCError;
export type PSDKConfigsLoadingReturnValue = { projectConfig: PSDKConfigs } | IPCError;

export const getProjectPath = (IPC: IpcService, projectType: ProjectType) => IPC.send<ProjectOpenReturnValue>('project-open', { projectType });
export const loadProjectData = (IPC: IpcService, path: string) => IPC.send<ProjectLoadingReturnValue>('project-loading', { path });
export const loadProjectText = (IPC: IpcService, path: string) => IPC.send<ProjectTextReturnValue>('text-loading', { path });
export const getFilePath = (IPC: IpcService, name: string, extensions: string[]) =>
  IPC.send<GetFilePathReturnValue>('file-open', { name, extensions });
export const loadPSDKConfigs = (IPC: IpcService, path: string) => IPC.send<PSDKConfigsLoadingReturnValue>('psdk-configs-loading', { path });

/**
 * @deprecated
 */
export const getProjectStudio = (IPC: IpcService, path: string) => {
  throw new Error('deprecated');
};

/**
 * @deprecated
 */
export const updateProjectStudio = async (IPC: IpcService, path: string | null, data: ProjectStudioModel) => {
  throw new Error('deprecated');
};

// probably useless
export const getVersions = async (IPC: IpcService, path: string | null) => IPC.send<VersionsReturnValue>('versions', { path });

export const importProjectDialog = async (ipc: IpcService) => {
  const projectPathValue = await getProjectPath(ipc, 'rxproj');
  if ('error' in projectPathValue) throw new Error(projectPathValue.error);
  return { projectPath: projectPathValue.projectPath };
};

export const fileExists = async (IPC: IpcService, filePath: string) => IPC.send<FileExistsReturnValue>('file-exists', { filePath });
