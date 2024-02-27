import { ClearButtonOnlyIcon, FolderButtonOnlyIcon } from '@components/buttons';
import React from 'react';
import { ReactComponent as FileDrop } from '@assets/icons/global/drop.svg';
import { ReactComponent as PlayIcon } from '@assets/icons/global/play.svg';
import { basename } from '@utils/path';
import { useResource } from '@utils/useResource';
import { OtherNoResourceContainer, OtherResourceContainer } from './OtherResourceStyle';
import { ResourceImage } from '@components/ResourceImage';

const isNoResource = (resourcePath: string) => resourcePath.endsWith('/');

type OtherResourceProps = {
  type: 'icon' | 'music';
  title: string;
  resourcePath: string;
  extensions: string[];
  onResourceChoosen: (filePath: string) => void;
  onResourceClean: () => void;
};

export const OtherResource = ({ type, title, resourcePath, extensions, onResourceChoosen, onResourceClean }: OtherResourceProps) => {
  const { onDrop, onDragOver, onClick, onClickFolder, isDialogOpen, flipFlap } = useResource({
    name: title,
    path: resourcePath,
    extensions,
    onResourceChoosen,
  });

  return isNoResource(resourcePath) ? (
    <OtherNoResourceContainer onDrop={onDrop} onDragOver={onDragOver} onClick={isDialogOpen ? undefined : onClick} disabled={isDialogOpen}>
      <div className="icon-title">
        <div className="no-resource-svg-container">
          <FileDrop />
        </div>
        <span className="title">{title}</span>
      </div>
    </OtherNoResourceContainer>
  ) : (
    <OtherResourceContainer onDrop={onDrop} onDragOver={onDragOver} onClick={isDialogOpen ? undefined : onClick} disabled={isDialogOpen}>
      <div className="icon-title">
        <div className={`svg-${type}-container`}>
          {type === 'music' ? <PlayIcon /> : <ResourceImage imagePathInProject={resourcePath} versionId={flipFlap ? 2 : 1} />}
        </div>
        {type === 'music' ? (
          <div className="resource-name">
            <span className="title">{title}</span>
            <span>{basename(resourcePath)}</span>
          </div>
        ) : (
          <span className="title">{title}</span>
        )}
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
    </OtherResourceContainer>
  );
};
