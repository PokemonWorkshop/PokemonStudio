import { StudioProject } from '@modelEntities/project';
import { parseJSON } from './json/parse';

export type Project = {
  projectStudio: StudioProject;
  projectPath: string;
  lastEdit: Date;
};

export const getProjectList = (): Project[] => {
  const projectJson = localStorage.getItem('projectList');
  if (!projectJson) return [];

  return parseJSON<Project[]>(projectJson, 'projectList from local storage').map((project: Project) => ({ ...project, lastEdit: new Date(project.lastEdit) }));
};

export const addProjectToList = (project: Project) => {
  const projectList = getProjectList();

  localStorage.setItem(
    'projectList',
    JSON.stringify([project, ...projectList.filter(({ projectPath }) => projectPath !== project.projectPath).slice(0, 3)])
  );
};

export const updateProjectEditDate = (projectPath: string) => {
  const projectList = getProjectList();
  const project = projectList.find((p) => p.projectPath === projectPath);
  if (!project) return;

  project.lastEdit = new Date();
  localStorage.setItem('projectList', JSON.stringify(projectList));
};

export const updateProjectStudio = (projectPath: string, projectStudio: StudioProject) => {
  const projectList = getProjectList();
  const project = projectList.find((p) => p.projectPath === projectPath);
  if (!project) return;

  project.projectStudio = projectStudio;
  localStorage.setItem('projectList', JSON.stringify(projectList));
};

export const deleteProjectToList = (projectPath: string) => {
  const projectList = getProjectList();
  const projectIndex = projectList.findIndex((project) => project.projectPath === projectPath);
  if (projectIndex === -1) return;

  projectList.splice(projectIndex, 1);
  localStorage.setItem('projectList', JSON.stringify(projectList));
};
