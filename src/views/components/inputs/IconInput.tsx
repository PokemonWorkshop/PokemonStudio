import { ClearButtonOnlyIcon, EditButtonOnlyIcon } from '@components/buttons';
import React, { DragEventHandler, useState } from 'react';
import styled from 'styled-components';
import { useChoosefile } from '@utils/useChooseFile';
import { ResourceImage } from '@components/ResourceImage';
import { useCopyFile } from '@utils/useCopyFile';

type IconInputContainerProps = {
  borderless: boolean;
};

const IconInputContainer = styled.div<IconInputContainerProps>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  user-select: none;

  & div.icon {
    display: flex;
    align-items: center;
    width: 40px;
    height: 40px;
    justify-content: center;

    ${({ theme, borderless }) =>
      !borderless &&
      `
      border: 1px solid ${theme.colors.dark24};
      box-sizing: border-box;
      border-radius: 100%;
    `}
  }

  & div.icon > img {
    max-width: 100%;
    max-height: 100%;
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

type IconInputProps = {
  iconPathInProject: string;
  name: string;
  extensions: string[];
  borderless?: boolean;
  destFolderToCopy?: string;
  projectPath?: string;
  onIconChoosen: (iconPath: string) => void;
  onIconClear: () => void;
};

export const IconInput = ({
  iconPathInProject,
  name,
  extensions,
  borderless,
  destFolderToCopy,
  projectPath,
  onIconChoosen,
  onIconClear,
}: IconInputProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [flipFlap, setFlipFlap] = useState(false);
  const chooseFile = useChoosefile();
  const copyFile = useCopyFile();

  const onDrop: DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const acceptedFiles = Array.from(event.dataTransfer.files).filter((file) => !extensions || extensions.includes(file.name.split('.').pop() ?? ''));
    if (acceptedFiles.length > 0) {
      if (destFolderToCopy === undefined) {
        onIconChoosen(acceptedFiles[0].path);
      } else {
        copyFile(
          { srcFile: acceptedFiles[0].path, destFolder: destFolderToCopy },
          ({ destFile }) => {
            setTimeout(() => {
              onIconChoosen(destFile);
              setFlipFlap((last) => !last);
            });
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
          onIconChoosen(path);
          setFlipFlap((last) => !last);
          setIsDialogOpen(false);
        });
      },
      () => setIsDialogOpen(false)
    );
  };

  return (
    <IconInputContainer onDrop={onDrop} onDragOver={onDragOver} borderless={borderless || false}>
      <div className="icon">
        <ResourceImage imagePathInProject={iconPathInProject} versionId={flipFlap ? 2 : 1} projectPath={projectPath} />
      </div>
      <div className="buttons">
        <EditButtonOnlyIcon disabled={isDialogOpen} onClick={isDialogOpen ? undefined : onClick} />
        <ClearButtonOnlyIcon disabled={isDialogOpen} onClick={isDialogOpen ? undefined : onIconClear} />
      </div>
    </IconInputContainer>
  );
};
