import { ClearButtonOnlyIcon, FolderButtonOnlyIcon } from '@components/buttons';
import { DropInputContainer } from '@components/inputs/DropInput';
import { ResourceImage } from '@components/ResourceImage';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ReactComponent as FileDrop } from '@assets/icons/global/drop.svg';
import { ResourceContainer } from './ResourcesContainer';
import { CreatureFormResourcesPath, formResourcesPath } from '@utils/path';
import { StudioCreatureForm } from '@modelEntities/creature';
import { useResource } from '@utils/useResource';

type SpriteResourceContainerProps = {
  isCharacter: boolean;
};

const SpriteResourceContainer = styled(ResourceContainer)<SpriteResourceContainerProps>`
  position: relative;
  flex-direction: column;
  padding: 24px 24px 16px;
  width: 244px;
  height: ${({ isCharacter }) => (isCharacter ? '244px' : '270px')};

  &:hover {
    padding: 23px 23px 15px;
    cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};

    & button {
      position: absolute;
    }

    & button.clear-button {
      top: 6px;
      right: 6px;
    }

    & button.folder-button {
      top: 6px;
      right: 50px;
    }
  }

  & img {
    height: ${({ isCharacter }) => (isCharacter ? '128px' : '192px')};
    width: ${({ isCharacter }) => (isCharacter ? '128px' : '192px')};
  }

  & span.title {
    width: 100%;
  }

  & div.image-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 160px;
    min-height: 160px;
  }
`;

type SpriteNoResourceContainerProps = SpriteResourceContainerProps;

const SpriteNoResourceContainer = styled(DropInputContainer)<SpriteNoResourceContainerProps>`
  display: flex;
  padding: 24px 24px 16px;
  margin: 0 8px 0 8px;
  width: 244px;
  height: ${({ isCharacter }) => (isCharacter ? '244px' : '270px')};
  border: 1px dashed ${({ theme }) => theme.colors.dark20};
  background-color: inherit;
  gap: ${({ isCharacter }) => (isCharacter ? '16px' : '24px')};

  & .drag-and-drop {
    display: flex;
    gap: 8px;
    height: ${({ isCharacter }) => (isCharacter ? '174px' : '192px')};
    justify-content: center;
  }

  & span.title {
    ${({ theme }) => theme.fonts.titlesOverline}
    color: ${({ theme }) => theme.colors.text400};
    letter-spacing: 1.5px;
    text-transform: uppercase;
    width: 100%;
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

const isNoRessource = (form: StudioCreatureForm, resource: CreatureFormResourcesPath, isFemale: boolean) => {
  return isFemale ? form.resources[resource] === undefined : form.resources[resource]?.length === 0;
};

const isCharacterResource = (resource: CreatureFormResourcesPath) => {
  return resource.startsWith('character');
};

type SpriteResourceProps = {
  form: StudioCreatureForm;
  resource: CreatureFormResourcesPath;
  isFemale: boolean;
  disableGif?: true;
  onResourceChoosen: (filePath: string, resource: CreatureFormResourcesPath) => void;
  onResourceClean: (resource: CreatureFormResourcesPath, isFemale: boolean) => void;
};

export const SpriteResource = ({ form, resource, isFemale, disableGif, onResourceChoosen, onResourceClean }: SpriteResourceProps) => {
  const { t } = useTranslation(['database_pokemon', 'drop']);
  const { onDrop, onDragOver, onClick, onClickFolder, isDialogOpen, flipFlap } = useResource({
    name: t(`database_pokemon:${resource}`),
    path: formResourcesPath(form, resource),
    extensions: disableGif ? ['png'] : ['png', 'gif'],
    onResourceChoosen: (resourcePath) => onResourceChoosen(resourcePath, resource),
  });

  return isNoRessource(form, resource, isFemale) ? (
    <SpriteNoResourceContainer onDrop={onDrop} onDragOver={onDragOver} isCharacter={isCharacterResource(resource)}>
      <div className="drag-and-drop">
        <FileDrop />
        <div className="file">
          <span>{t('drop:drop_your_file_or')}</span>
          <LinkContainer disabled={isDialogOpen} onClick={isDialogOpen ? undefined : onClick}>
            {t('drop:or_explore_your_files')}
          </LinkContainer>
        </div>
      </div>
      <span className="title">{t(`database_pokemon:${resource}`)}</span>
    </SpriteNoResourceContainer>
  ) : (
    <SpriteResourceContainer
      onDrop={onDrop}
      onDragOver={onDragOver}
      onClick={isDialogOpen ? undefined : onClick}
      disabled={isDialogOpen}
      isCharacter={isCharacterResource(resource)}
    >
      <button className="folder-button">
        <FolderButtonOnlyIcon
          onClick={(event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => onClickFolder(formResourcesPath(form, resource), event)}
        />
      </button>
      <button className="clear-button">
        <ClearButtonOnlyIcon
          onClick={(event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
            event.stopPropagation();
            onResourceClean(resource, isFemale);
          }}
        />
      </button>
      <div className="image-container">
        <ResourceImage imagePathInProject={formResourcesPath(form, resource)} versionId={flipFlap ? 2 : 1} />
      </div>
      <span className="title">{t(`database_pokemon:${resource}`)}</span>
    </SpriteResourceContainer>
  );
};
