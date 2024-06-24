import { ClearButtonOnlyIcon, EditButtonOnlyIcon } from '@components/buttons';
import React, { DragEventHandler, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useChoosefile } from '@hooks/useChooseFile';
import { useCopyFile } from '@hooks/useCopyFile';
import { ReactComponent as ImageIcon } from '@assets/icons/global/image.svg';
import { useGlobalState } from '@src/GlobalStateProvider';
import { basename, join } from '@utils/path';
import { showNotification } from '@utils/showNotification';
import { useTranslation } from 'react-i18next';

const PictureInputContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  user-select: none;

  & div.icon-filename {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  & div.icon {
    display: flex;
    align-items: center;
    width: 40px;
    height: 40px;
    justify-content: center;
    border: 1px solid ${({ theme }) => theme.colors.dark24};
    box-sizing: border-box;
    border-radius: 100%;
    color: ${({ theme }) => theme.colors.text500};
  }

  & span {
    ${({ theme }) => theme.fonts.normalRegular}
    color: ${({ theme }) => theme.colors.text400};
    width: 240px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  & .error {
    color: ${({ theme }) => theme.colors.dangerBase};
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

type PictureInputProps = {
  picturePathInProject: string;
  name: string;
  extensions: string[];
  destFolderToCopy?: string;
  onPictureChoosen: (iconPath: string) => void;
  onPictureClear: () => void;
};

export const PictureInput = ({ picturePathInProject, name, extensions, destFolderToCopy, onPictureChoosen, onPictureClear }: PictureInputProps) => {
  const [state] = useGlobalState();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<boolean>(false);
  const { t } = useTranslation('audio');
  const chooseFile = useChoosefile();
  const copyFile = useCopyFile();

  const onDrop: DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const acceptedFiles = Array.from(event.dataTransfer.files).filter((file) => !extensions || extensions.includes(file.name.split('.').pop() ?? ''));
    if (acceptedFiles.length > 0) {
      if (destFolderToCopy === undefined) {
        onPictureChoosen(acceptedFiles[0].path);
      } else {
        copyFile(
          { srcFile: acceptedFiles[0].path, destFolder: destFolderToCopy },
          ({ destFile }) => {
            setTimeout(() => onPictureChoosen(destFile));
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
          onPictureChoosen(path);
          setIsDialogOpen(false);
        });
      },
      () => setIsDialogOpen(false)
    );
  };

  useEffect(() => {
    if (!state.projectPath) return;

    return window.api.fileExists(
      { filePath: join(state.projectPath, picturePathInProject) },
      ({ result }) => setError(!result),
      ({ errorMessage }) => {
        setError(true);
        showNotification('danger', t('error'), errorMessage);
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picturePathInProject]);

  return (
    <PictureInputContainer onDrop={onDrop} onDragOver={onDragOver}>
      <div className="icon-filename">
        <div className="icon">
          <ImageIcon />
        </div>
        {error ? <span className="error">{t('no_file_found')}</span> : <span>{basename(picturePathInProject)}</span>}
      </div>
      <div className="buttons">
        <EditButtonOnlyIcon disabled={isDialogOpen} onClick={isDialogOpen ? undefined : onClick} />
        <ClearButtonOnlyIcon disabled={isDialogOpen} onClick={isDialogOpen ? undefined : onPictureClear} />
      </div>
    </PictureInputContainer>
  );
};
