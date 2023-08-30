import React, { DragEventHandler, useState } from 'react';
import styled from 'styled-components';
import { ReactComponent as FileDrop } from '@assets/icons/global/drop.svg';
import { useTranslation } from 'react-i18next';
import { DropInputContainer } from './DropInput';

const DropInputFolderContainer = styled(DropInputContainer)`
  width: 100%;
  height: 100%;
  justify-content: center;
`;

type LinkContainerProps = {
  disabled: boolean;
};

const LinkContainer = styled.div<LinkContainerProps>`
  color: ${({ theme, disabled }) => (disabled ? theme.colors.text500 : theme.colors.primaryBase)};
  text-align: center;

  :hover {
    cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  }
`;

const onDragOver: DragEventHandler<HTMLDivElement> = (event) => {
  event.preventDefault();
  event.stopPropagation();
};

type DropInputFolderProps = {
  onFolderChoosen: (folderPath: string) => void;
};

export const DropInputFolder = ({ onFolderChoosen }: DropInputFolderProps) => {
  const { t } = useTranslation('drop');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const onDrop: DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const acceptedFiles = Array.from(event.dataTransfer.files).filter((file) => !file.type);
    if (acceptedFiles.length > 0) {
      onFolderChoosen(acceptedFiles[0].path);
    }
  };

  const onClick = async () => {
    setIsDialogOpen(true);
    window.api.chooseFolder(
      {},
      ({ folderPath }) => {
        setTimeout(() => {
          onFolderChoosen(folderPath);
          setIsDialogOpen(false);
        });
      },
      () => setIsDialogOpen(false)
    );
  };

  return (
    <DropInputFolderContainer onDrop={onDrop} onDragOver={onDragOver}>
      <FileDrop />
      <div className="file">
        <span>{t('drop_your_folder_or')}</span>
        <LinkContainer disabled={isDialogOpen} onClick={isDialogOpen ? undefined : onClick}>
          {t('or_explore_your_files')}
        </LinkContainer>
      </div>
    </DropInputFolderContainer>
  );
};
