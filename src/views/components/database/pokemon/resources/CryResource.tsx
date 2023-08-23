import { ClearButtonOnlyIcon, FolderButtonOnlyIcon } from '@components/buttons';
import React, { DragEventHandler, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ReactComponent as FileDrop } from '@assets/icons/global/drop.svg';
import { ReactComponent as PlayIcon } from '@assets/icons/global/play.svg';
import { useShowItemInFolder } from '@utils/useShowItemInFolder';
import { useGlobalState } from '@src/GlobalStateProvider';
import { useCopyFile } from '@utils/useCopyFile';
import { ResourceContainer } from './ResourcesContainer';
import { ResourcesContainer } from './ResourcesContainer';
import { CreatureFormResourcesPath, dirname, formResourcesPath, join, stripExtension } from '@utils/path';
import { useChoosefile } from '@utils/useChooseFile';
import { StudioCreatureForm } from '@modelEntities/creature';
import { TitleResource } from './TitleResource';
import { ResourceWrapper } from './ResourceWrapper';

const CryResourceContainer = styled(ResourceContainer)`
  flex-direction: row;
  padding: 16px 16px 16px 24px;
  width: 504px;
  height: 80px;

  .svg-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    width: 40px;
    border-radius: 8px;
    color: ${({ theme }) => theme.colors.text400};
    background-color: ${({ theme }) => theme.colors.dark18};
  }

  &:hover {
    padding: 15px 15px 15px 23px;
    cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  }

  & img {
    height: 32px;
    width: 32px;
    object-position: 0 100%;
  }

  & div.icon-title {
    display: flex;
    gap: 16px;
    ${({ theme }) => theme.fonts.normalMedium}
  }

  & div.buttons {
    display: flex;
    gap: 4px;
  }

  & span.title {
    display: flex;
    align-items: center;
  }

  & div.name-cry {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
`;

const CryNoResourceContainer = styled(CryResourceContainer)`
  display: flex;
  border: 1px dashed ${({ theme }) => theme.colors.dark20};
  background-color: inherit;

  .no-cry-svg-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    width: 40px;
  }

  :hover {
    background-color: inherit;
    border: 1px dashed ${({ theme }) => theme.colors.dark20};
    padding: 16px 16px 16px 24px;
    cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  }
`;

const onDragOver: DragEventHandler<HTMLDivElement> = (event) => {
  event.preventDefault();
  event.stopPropagation();
};

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
  const [state] = useGlobalState();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [flipFlap, setFlipFlap] = useState(false);
  const { t } = useTranslation('database_pokemon');
  const showItemInFolder = useShowItemInFolder();
  const copyFile = useCopyFile();
  const chooseFile = useChoosefile();

  const onDrop: DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const extensions = ['wav', 'ogg', 'mp3'];
    const acceptedFiles = Array.from(event.dataTransfer.files).filter((file) => extensions.includes(file.name.split('.').pop() ?? ''));
    if (acceptedFiles.length > 0) {
      copyFile(
        { srcFile: acceptedFiles[0].path, destFolder: dirname(formResourcesPath(form, resource)) },
        () =>
          setTimeout(() => {
            onResourceChoosen(acceptedFiles[0].path, resource);
            setFlipFlap((last) => !last);
          }),
        ({ errorMessage }) => window.api.log.error(errorMessage)
      );
    }
  };

  const onClick = async () => {
    setIsDialogOpen(true);
    const extensions = ['wav', 'ogg', 'mp3'];
    chooseFile(
      { name: t(resource), extensions, destFolderToCopy: dirname(formResourcesPath(form, resource)) },
      ({ path: resourcePath }) => {
        setTimeout(() => {
          onResourceChoosen(resourcePath, resource);
          setFlipFlap((last) => !last);
          setIsDialogOpen(false);
        });
      },
      () => setIsDialogOpen(false)
    );
  };

  const onClickFolder = async (filePath: string, event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    event.stopPropagation();
    if (!state.projectPath) return;

    showItemInFolder(
      { filePath: stripExtension(join(state.projectPath, filePath)), extensions: ['.wav', '.ogg', '.mp3'] },
      () => {},
      () => {}
    );
  };

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
