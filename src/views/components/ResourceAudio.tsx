import { useGlobalState } from '@src/GlobalStateProvider';
import React, { useMemo } from 'react';

// Root URL of all resources (in cas Studio becomes a webapp)
const URL_ROOT = 'project://--/';

const buildAudioSrc = (audioPathInProject: string, projectPath: string, versionId?: number, fallback?: string) => {
  const audioUrl = new URL(audioPathInProject, URL_ROOT);
  audioUrl.searchParams.append('projectPath', projectPath);
  audioUrl.searchParams.append('type', 'audio');
  if (versionId) audioUrl.searchParams.append('versionId', versionId.toString());
  if (fallback) audioUrl.searchParams.append('fallbacks', fallback);
  return audioUrl.toString();
};

type Props = {
  audioPathInProject: string;
  className?: string;
  versionId?: number; // Optional version id to update the resource played when it gets updated
  fallback?: string; // Optional fallback
  projectPath?: string; // Optional projectPath, use this only to load an audio coming from outside the current project
};

export const ResourceAudio = ({ audioPathInProject, versionId, className, fallback, projectPath }: Props) => {
  const [{ projectPath: currentProjectPath }] = useGlobalState();
  // fallback is not added to deps on purpose: there's no reason to update fallback if wanted audio did not update
  const audioSrc = useMemo(
    () => buildAudioSrc(audioPathInProject, projectPath || currentProjectPath || '', versionId, fallback),
    [audioPathInProject, versionId, currentProjectPath, projectPath]
  );

  return <audio controls src={audioSrc} className={className} />;
};

export const useResourceAudioSrc = (audioPathInProject: string, versionId?: number, fallback?: string, projectPath?: string) => {
  const [{ projectPath: currentProjectPath }] = useGlobalState();
  // fallback is not added to deps on purpose: there's no reason to update fallback if wanted audio did not update
  return useMemo(
    () => buildAudioSrc(audioPathInProject, projectPath || currentProjectPath || '', versionId, fallback),
    [audioPathInProject, currentProjectPath, projectPath]
  );
};
