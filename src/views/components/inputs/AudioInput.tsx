import React, { DragEventHandler, useEffect, useState } from 'react';
import styled from 'styled-components';
import { ClearButtonOnlyIcon, EditButtonOnlyIcon } from '@components/buttons';
import { basename, join } from '@utils/path';
import { showNotification } from '@utils/showNotification';
import { useTranslation } from 'react-i18next';
import { useChoosefile } from '@utils/useChooseFile';
import { ResourceAudio } from '@components/ResourceAudio';
import { useGlobalState } from '@src/GlobalStateProvider';
import { useCopyFile } from '@utils/useCopyFile';

export const AUDIO_EXT = ['ogg', 'mp3', 'midi', 'mid', 'aac', 'wav', 'flac'];

const AudioInputContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  user-select: none;

  & div.audio {
    display: flex;
    flex-direction: row;
    gap: 12px;
    align-items: center;

    & span {
      ${({ theme }) => theme.fonts.normalRegular}
      color: ${({ theme }) => theme.colors.text400};
      width: 240px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;

      @media ${({ theme }) => theme.breakpoints.dataBox422} {
        display: none;
      }
    }

    & .error {
      color: ${({ theme }) => theme.colors.dangerBase};
    }
  }

  & div.buttons {
    display: flex;
    flex-direction: row;
    gap: 4px;
  }
`;

const onDragOver: DragEventHandler<HTMLDivElement> = (event) => {
  event.preventDefault();
  event.stopPropagation();
};

type AudioInputProps = {
  audioPathInProject: string;
  name: string;
  extensions: string[];
  destFolderToCopy?: string;
  onAudioChoosen: (iconPath: string) => void;
  onAudioClear: () => void;
};

export const AudioInput = ({ audioPathInProject, name, extensions, destFolderToCopy, onAudioChoosen, onAudioClear }: AudioInputProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<boolean>(false);
  const { t } = useTranslation('audio');
  const chooseFile = useChoosefile();
  const copyFile = useCopyFile();
  const [state] = useGlobalState();

  const onDrop: DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const acceptedFiles = Array.from(event.dataTransfer.files).filter((file) => !extensions || extensions.includes(file.name.split('.').pop() ?? ''));
    if (acceptedFiles.length > 0) {
      if (destFolderToCopy === undefined) {
        onAudioChoosen(acceptedFiles[0].path);
      } else {
        copyFile(
          { srcFile: acceptedFiles[0].path, destFolder: destFolderToCopy },
          ({ destFile }) => {
            setTimeout(() => onAudioChoosen(destFile));
          },
          ({ errorMessage }) => window.api.log.error(errorMessage)
        );
      }
    }
  };

  const onClick = async () => {
    setIsDialogOpen(true);
    chooseFile(
      { name, extensions, destFolderToCopy },
      ({ path }) => {
        setTimeout(() => {
          onAudioChoosen(path);
          setIsDialogOpen(false);
        });
      },
      () => setIsDialogOpen(false)
    );
  };

  useEffect(() => {
    if (!state.projectPath) return;

    return window.api.fileExists(
      { filePath: join(state.projectPath, audioPathInProject) },
      ({ result }) => setError(!result),
      ({ errorMessage }) => {
        setError(true);
        showNotification('danger', t('error'), errorMessage);
      }
    );
  }, [audioPathInProject]);

  return (
    <AudioInputContainer onDrop={onDrop} onDragOver={onDragOver}>
      <div className="audio">
        <ResourceAudio audioPathInProject={audioPathInProject} />
        {error ? <span className="error">{t('no_file_found')}</span> : <span>{basename(audioPathInProject)}</span>}
      </div>
      <div className="buttons">
        <EditButtonOnlyIcon disabled={isDialogOpen} onClick={isDialogOpen ? undefined : onClick} />
        <ClearButtonOnlyIcon disabled={isDialogOpen} onClick={isDialogOpen ? undefined : onAudioClear} />
      </div>
    </AudioInputContainer>
  );
};
