import { ClearButtonOnlyIcon, FolderButtonOnlyIcon } from '@components/buttons';
import React from 'react';
import { ReactComponent as FileDrop } from '@assets/icons/global/drop.svg';
import { ReactComponent as PlayIcon } from '@assets/icons/global/play.svg';
import { basename } from '@utils/path';
import { useResource } from '@utils/useResource';
import { MusicNoResourceContainer, MusicResourceContainer } from './MusicResourceStyle';

const isNoResource = (resourcePath: string) => resourcePath.endsWith('/');

type MusicResourceProps = {
  title: string;
  resourcePath: string;
  extensions: string[];
  onResourceChoosen: (filePath: string) => void;
  onResourceClean: () => void;
};

export const MusicResource = ({ title, resourcePath, extensions, onResourceChoosen, onResourceClean }: MusicResourceProps) => {
  const { onDrop, onDragOver, onClick, onClickFolder, isDialogOpen } = useResource({
    name: title,
    path: resourcePath,
    extensions,
    onResourceChoosen,
  });

  return isNoResource(resourcePath) ? (
    <MusicNoResourceContainer onDrop={onDrop} onDragOver={onDragOver} onClick={isDialogOpen ? undefined : onClick} disabled={isDialogOpen}>
      <div className="icon-title">
        <div className="no-music-svg-container">
          <FileDrop />
        </div>
        <span className="title">{title}</span>
      </div>
    </MusicNoResourceContainer>
  ) : (
    <MusicResourceContainer onDrop={onDrop} onDragOver={onDragOver} onClick={isDialogOpen ? undefined : onClick} disabled={isDialogOpen}>
      <div className="icon-title">
        <div className="svg-container">
          <PlayIcon />
        </div>
        <div className="music-name">
          <span className="title">{title}</span>
          <span>{basename(resourcePath)}</span>
        </div>
      </div>
      <div className="buttons">
        <button className="folder-button">
          <FolderButtonOnlyIcon onClick={(event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => onClickFolder(resourcePath, event)} />
        </button>
        <button className="clear-button">
          <ClearButtonOnlyIcon
            onClick={(event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
              event.stopPropagation();
              onResourceClean();
            }}
          />
        </button>
      </div>
    </MusicResourceContainer>
  );
};
