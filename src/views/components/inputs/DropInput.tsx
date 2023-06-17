import React, { DragEventHandler, useState } from 'react';
import styled from 'styled-components';
import { ReactComponent as FileDrop } from '@assets/icons/global/drop.svg';
import { useTranslation } from 'react-i18next';
import { useChoosefile } from '@utils/useChooseFile';
import { useCopyFile } from '@utils/useCopyFile';

export const DropInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;

  gap: 8px;
  background-color: ${({ theme }) => theme.colors.dark16};
  border: 1px dashed ${({ theme }) => theme.colors.dark24};
  box-sizing: border-box;
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.text400};
  ${({ theme }) => theme.fonts.normalMedium}
  user-select: none;

  & div {
    display: flex;
    flex-direction: column;
    align-items: center;
    span {
      text-align: center;
    }
  }

  & div.recommanded-size {
    padding-top: 4px;
  }

  & div.file {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    column-gap: 3px;
    color: ${({ theme }) => theme.colors.text100};
  }
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

const getFormatsList = (extensions: string[]) => {
  const formats = extensions.map((ext) => `.${ext}`);
  return formats.toString().replaceAll(',', ', ');
};

type DropInputProps = {
  imageWidth?: number;
  imageHeight?: number;
  multipleFiles?: boolean;
  destFolderToCopy?: string;
  name: string;
  extensions: string[];
  showAcceptedFormat?: true;
  onFileChoosen: (filePath: string) => void;
};

export const DropInput = ({
  imageWidth,
  imageHeight,
  multipleFiles,
  destFolderToCopy,
  name,
  extensions,
  showAcceptedFormat,
  onFileChoosen,
}: DropInputProps) => {
  const { t } = useTranslation('drop');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const chooseFile = useChoosefile();
  const copyFile = useCopyFile();

  const onDrop: DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const acceptedFiles = Array.from(event.dataTransfer.files).filter((file) => !extensions || extensions.includes(file.name.split('.').pop() ?? ''));
    if (acceptedFiles.length > 0) {
      if (destFolderToCopy === undefined) {
        onFileChoosen(acceptedFiles[0].path);
      } else {
        copyFile(
          { srcFile: acceptedFiles[0].path, destFolder: destFolderToCopy },
          ({ destFile }) => {
            setTimeout(() => onFileChoosen(destFile));
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
          onFileChoosen(path);
          if (multipleFiles) setIsDialogOpen(false);
        });
      },
      () => setIsDialogOpen(false)
    );
  };

  return (
    <DropInputContainer onDrop={onDrop} onDragOver={onDragOver}>
      <FileDrop />
      <div className="file">
        <span>{multipleFiles ? t('drop_your_files_or') : t('drop_your_file_or')}</span>
        <LinkContainer disabled={isDialogOpen} onClick={isDialogOpen ? undefined : onClick}>
          {t('or_explore_your_files')}
        </LinkContainer>
      </div>
      {imageWidth && imageHeight && (
        <div className="recommanded-size">
          <span>{t('recommanded_size', { width: imageWidth, height: imageHeight })}</span>
        </div>
      )}
      {showAcceptedFormat && (
        <div className="recommanded-size">
          <span>{t(extensions.length > 1 ? 'accepted_formats' : 'accepted_format', { formats: getFormatsList(extensions) })}</span>
        </div>
      )}
    </DropInputContainer>
  );
};
