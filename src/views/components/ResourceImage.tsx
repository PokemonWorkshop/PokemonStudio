import { useGlobalState } from '@src/GlobalStateProvider';
import React, { useMemo } from 'react';

// Root URL of all resources (in cas Studio becomes a webapp)
const URL_ROOT = 'project://--/';

const buildImageSrc = (imagePathInProject: string, projectPath: string, versionId?: number, fallback?: string) => {
  const imageUrl = new URL(imagePathInProject, URL_ROOT);
  imageUrl.searchParams.append('projectPath', projectPath);
  imageUrl.searchParams.append('type', 'image');
  if (versionId) imageUrl.searchParams.append('versionId', versionId.toString());
  if (fallback) imageUrl.searchParams.append('fallbacks', fallback);
  return imageUrl.toString();
};

type Props = {
  imagePathInProject: string;
  className?: string;
  versionId?: number; // Optional version id to update the resource display when it gets updated
  fallback?: string; // Optional fallback
  projectPath?: string; // Optional projectPath, use this only to load an image coming from outside the current project
};

export const ResourceImage = ({ imagePathInProject, versionId, className, fallback, projectPath }: Props) => {
  const [{ projectPath: currentProjectPath }] = useGlobalState();
  // fallback is not added to deps on purpose: there's no reason to update fallback if wanted image did not update
  const imageSrc = useMemo(
    () => buildImageSrc(imagePathInProject, projectPath || currentProjectPath || '', versionId, fallback),
    [imagePathInProject, versionId, currentProjectPath, projectPath]
  );

  return <img src={imageSrc} className={className} draggable="false" />;
};

export const useResourceImageSrc = (imagePathInProject: string, versionId?: number, fallback?: string, projectPath?: string) => {
  const [{ projectPath: currentProjectPath }] = useGlobalState();
  // fallback is not added to deps on purpose: there's no reason to update fallback if wanted image did not update
  return useMemo(
    () => buildImageSrc(imagePathInProject, projectPath || currentProjectPath || '', versionId, fallback),
    [imagePathInProject, versionId, currentProjectPath, projectPath]
  );
};
