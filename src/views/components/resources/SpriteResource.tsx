import { ClearButtonOnlyIcon, FolderButtonOnlyIcon } from '@components/buttons';
import { ResourceImage } from '@components/ResourceImage';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as FileDrop } from '@assets/icons/global/drop.svg';
import { LinkContainer, SpriteNoResourceContainer, SpriteResourceContainer, SpriteResourceType } from '@components/resources';
import { useResource } from '@hooks/useResource';

const isNoResource = (resourcePath: string) => resourcePath.endsWith('/');

type SpriteResourceProps = {
  type: SpriteResourceType;
  title: string;
  resourcePath: string;
  extensions: string[];
  onResourceChoosen: (filePath: string) => void;
  onResourceClean: () => void;
};

export const SpriteResource = ({ type, title, resourcePath, extensions, onResourceChoosen, onResourceClean }: SpriteResourceProps) => {
  const { t } = useTranslation('drop');
  const { onDrop, onDragOver, onClick, onClickFolder, isDialogOpen, flipFlap } = useResource({
    name: title,
    path: resourcePath,
    extensions,
    onResourceChoosen,
  });

  return isNoResource(resourcePath) ? (
    <SpriteNoResourceContainer onDrop={onDrop} onDragOver={onDragOver} type={type}>
      <div className="drag-and-drop">
        <FileDrop />
        <div className="file">
          <span>{t('drop_your_file_or')}</span>
          <LinkContainer disabled={isDialogOpen} onClick={isDialogOpen ? undefined : onClick}>
            {t('or_explore_your_files')}
          </LinkContainer>
        </div>
      </div>
      <span className="title">{title}</span>
    </SpriteNoResourceContainer>
  ) : (
    <SpriteResourceContainer onDrop={onDrop} onDragOver={onDragOver} onClick={isDialogOpen ? undefined : onClick} disabled={isDialogOpen} type={type}>
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
      <div className="image-container">
        <ResourceImage imagePathInProject={resourcePath} versionId={flipFlap ? 2 : 1} />
      </div>
      <span className="title">{title}</span>
    </SpriteResourceContainer>
  );
};
