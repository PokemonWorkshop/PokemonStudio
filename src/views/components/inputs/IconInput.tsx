import { ClearButtonOnlyIcon, EditButtonOnlyIcon } from '@components/buttons';
import React, { DragEventHandler, useState } from 'react';
import styled from 'styled-components';
import { ReloadableImage } from '@components/ReloadableImage';
import { useChoosefile } from '@utils/useChooseFile';

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
  iconPath: string;
  name: string;
  extensions: string[];
  borderless?: boolean;
  onIconChoosen: (iconPath: string) => void;
  onIconClear: () => void;
};

export const IconInput = ({ iconPath, name, extensions, borderless, onIconChoosen, onIconClear }: IconInputProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const chooseFile = useChoosefile();

  const onDrop: DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const acceptedFiles = Array.from(event.dataTransfer.files).filter((file) => !extensions || extensions.includes(file.name.split('.').pop() ?? ''));
    if (acceptedFiles.length > 0) onIconChoosen(acceptedFiles[0].path);
  };

  const onClick = async () => {
    setIsDialogOpen(true);
    chooseFile(
      { name, extensions },
      ({ path }) => {
        onIconChoosen(path);
        setIsDialogOpen(false);
      },
      () => setIsDialogOpen(false)
    );
  };

  return (
    <IconInputContainer onDrop={onDrop} onDragOver={onDragOver} borderless={borderless || false}>
      <div className="icon">
        <ReloadableImage src={iconPath} draggable="false" />
      </div>
      <div className="buttons">
        <EditButtonOnlyIcon disabled={isDialogOpen} onClick={isDialogOpen ? undefined : onClick} />
        <ClearButtonOnlyIcon disabled={isDialogOpen} onClick={isDialogOpen ? undefined : onIconClear} />
      </div>
    </IconInputContainer>
  );
};
