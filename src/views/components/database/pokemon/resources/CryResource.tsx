import { ClearButtonOnlyIcon, FolderButtonOnlyIcon } from '@components/buttons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as FileDrop } from '@assets/icons/global/drop.svg';
import { ReactComponent as PlayIcon } from '@assets/icons/global/play.svg';
import { ResourcesContainer } from './ResourcesContainer';
import { CreatureFormResourcesPath, formResourcesPath } from '@utils/path';
import { StudioCreatureForm } from '@modelEntities/creature';
import { TitleResource } from './TitleResource';
import { ResourceWrapper } from './ResourceWrapper';
import { useResource } from '@utils/useResource';
import { MusicNoResourceContainer, MusicResourceContainer } from '@components/resources';
import styled from 'styled-components';

const CryResourceContainer = styled(MusicResourceContainer)`
  width: 504px;
  margin: 0 8px 0 8px;
`;

const CryNoResourceContainer = styled(MusicNoResourceContainer)`
  width: 504px;
  margin: 0 8px 0 8px;
`;

const isNoResource = (form: StudioCreatureForm, resource: CreatureFormResourcesPath, isFemale: boolean) => {
  return isFemale ? form.resources[resource] === undefined : form.resources[resource]?.length === 0;
};

type CryResourceProps = {
  form: StudioCreatureForm;
  resource: CreatureFormResourcesPath;
  isFemale: boolean;
  onResourceChoosen: (filePath: string, resource: CreatureFormResourcesPath) => void;
  onResourceClean: (resource: CreatureFormResourcesPath, isFemale: boolean) => void;
};

export const CryResource = ({ form, resource, isFemale, onResourceChoosen, onResourceClean }: CryResourceProps) => {
  const { t } = useTranslation('database_pokemon');
  const { onDrop, onDragOver, onClick, onClickFolder, isDialogOpen } = useResource({
    name: t('cry'),
    path: formResourcesPath(form, resource),
    extensions: ['wav', 'ogg', 'mp3'],
    onResourceChoosen: (resourcePath) => onResourceChoosen(resourcePath, resource),
  });

  return isNoResource(form, resource, isFemale) ? (
    <ResourcesContainer>
      <TitleResource title={t('cry')} />
      <ResourceWrapper>
        <CryNoResourceContainer onDrop={onDrop} onDragOver={onDragOver} onClick={isDialogOpen ? undefined : onClick} disabled={isDialogOpen}>
          <div className="icon-title">
            <div className="no-cry-svg-container">
              <FileDrop />
            </div>
            <span className="title">{t('pokemon_cry')}</span>
          </div>
        </CryNoResourceContainer>
      </ResourceWrapper>
    </ResourcesContainer>
  ) : (
    <ResourcesContainer>
      <TitleResource title={t('cry')} />
      <ResourceWrapper>
        <CryResourceContainer onDrop={onDrop} onDragOver={onDragOver} onClick={isDialogOpen ? undefined : onClick} disabled={isDialogOpen}>
          <div className="icon-title">
            <div className="svg-container">
              <PlayIcon />
            </div>
            <div className="name-cry">
              <span className="title">{t('pokemon_cry')}</span>
              <span>{form.resources[resource]}</span>
            </div>
          </div>
          <div className="buttons">
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
          </div>
        </CryResourceContainer>
      </ResourceWrapper>
    </ResourcesContainer>
  );
};
