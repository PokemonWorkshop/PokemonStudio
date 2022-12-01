import React, { DragEventHandler, useEffect, useState } from 'react';
import styled from 'styled-components';
import { ClearButtonOnlyIcon, EditButtonOnlyIcon } from '@components/buttons';
import path from 'path';
import { showNotification } from '@utils/showNotification';
import { useTranslation } from 'react-i18next';
import { useChoosefile } from '@utils/useChooseFile';

const AudioInputContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  user-select: none;

  & div.music {
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
  musicPath: string;
  name: string;
  extensions: string[];
  onMusicChoosen: (iconPath: string) => void;
  onMusicClear: () => void;
};

export const AudioInput = ({ musicPath, name, extensions, onMusicChoosen, onMusicClear }: AudioInputProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<boolean>(false);
  const { t } = useTranslation('audio');
  const chooseFile = useChoosefile();

  const onDrop: DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const acceptedFiles = Array.from(event.dataTransfer.files).filter((file) => !extensions || extensions.includes(file.name.split('.').pop() ?? ''));
    if (acceptedFiles.length > 0) onMusicChoosen(acceptedFiles[0].path);
  };

  const onClick = async () => {
    setIsDialogOpen(true);
    chooseFile(
      { name, extensions },
      ({ path }) => {
        onMusicChoosen(path);
        setIsDialogOpen(false);
      },
      () => setIsDialogOpen(false)
    );
  };

  useEffect(() => {
    window.api.fileExists(
      { filePath: musicPath },
      ({ result }) => setError(!result),
      ({ errorMessage }) => {
        setError(true);
        showNotification('danger', t('error'), errorMessage);
      }
    );
    return () => window.api.cleanupFileExists();
  }, [musicPath]);

  return (
    <AudioInputContainer onDrop={onDrop} onDragOver={onDragOver}>
      <div className="music">
        <audio controls src={musicPath} />
        {error ? <span className="error">{t('no_file_found')}</span> : <span>{path.basename(musicPath)}</span>}
      </div>
      <div className="buttons">
        <EditButtonOnlyIcon disabled={isDialogOpen} onClick={isDialogOpen ? undefined : onClick} />
        <ClearButtonOnlyIcon disabled={isDialogOpen} onClick={isDialogOpen ? undefined : onMusicClear} />
      </div>
    </AudioInputContainer>
  );
};
