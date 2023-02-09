import { ClearButtonOnlyIcon, FolderButtonOnlyIcon } from '@components/buttons';
import { ResourceImage } from '@components/ResourceImage';
import React, { DragEventHandler, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ReactComponent as FileDrop } from '@assets/icons/global/drop.svg';
import { useShowItemInFolder } from '@utils/useShowItemInFolder';
import { useGlobalState } from '@src/GlobalStateProvider';
import { useCopyFile } from '@utils/useCopyFile';
import { ResourceContainer } from './ResourcesContainer';
import { CreatureFormResourcesPath, dirname, formResourcesPath, join } from '@utils/path';
import { useChoosefile } from '@utils/useChooseFile';
import { StudioCreatureForm } from '@modelEntities/creature';

const IconResourceContainer = styled(ResourceContainer)`
  flex-direction: row;
  padding: 16px 16px 16px 24px;
  width: 504px;
  height: 80px;

  & :hover {
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
    gap: 24px;
  }

  & div.buttons {
    display: flex;
    gap: 4px;
  }

  & span.title {
    display: flex;
    align-items: center;
  }
`;

const IconNoResourceContainer = styled(IconResourceContainer)`
  display: flex;
  border: 1px dashed ${({ theme }) => theme.colors.dark20};
  background-color: inherit;

  .svg-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    width: 32px;
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

const isNoRessource = (form: StudioCreatureForm, resource: CreatureFormResourcesPath, isFemale: boolean) => {
  return isFemale ? form.resources[resource] === undefined : form.resources[resource]?.length === 0;
};

type IconResourceProps = {
  form: StudioCreatureForm;
  resource: CreatureFormResourcesPath;
  isFemale: boolean;
  disableGif?: true;
  onResourceChoosen: (filePath: string, resource: CreatureFormResourcesPath) => void;
  onResourceClean: (resource: CreatureFormResourcesPath, isFemale: boolean) => void;
};

export const IconResource = ({ form, resource, isFemale, disableGif, onResourceChoosen, onResourceClean }: IconResourceProps) => {
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
    const extensions = disableGif ? ['png'] : ['png', 'gif'];
    const acceptedFiles = Array.from(event.dataTransfer.files).filter((file) => extensions.includes(file.name.split('.').pop() ?? ''));
    if (acceptedFiles.length > 0) {
      copyFile(
        { srcFile: acceptedFiles[0].path, destFolder: dirname(formResourcesPath(form, resource)) },
        () =>
          setImmediate(() => {
            onResourceChoosen(acceptedFiles[0].path, resource);
            setFlipFlap((last) => !last);
          }),
        ({ errorMessage }) => console.log(errorMessage)
      );
    }
  };

  const onClick = async () => {
    setIsDialogOpen(true);
    const extensions = disableGif ? ['png'] : ['png', 'gif'];
    chooseFile(
      { name: t(resource), extensions, destFolderToCopy: dirname(formResourcesPath(form, resource)) },
      ({ path: resourcePath }) => {
        setImmediate(() => {
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
      { filePath: join(state.projectPath, filePath), extensions: ['.gif', '.png'] },
      () => {},
      () => {}
    );
  };

  return isNoRessource(form, resource, isFemale) ? (
    <IconNoResourceContainer onDrop={onDrop} onDragOver={onDragOver} onClick={isDialogOpen ? undefined : onClick} disabled={isDialogOpen}>
      <div className="icon-title">
        <div className="svg-container">
          <FileDrop />
        </div>
        <span className="title">{t(resource)}</span>
      </div>
    </IconNoResourceContainer>
  ) : (
    <IconResourceContainer onDrop={onDrop} onDragOver={onDragOver} onClick={isDialogOpen ? undefined : onClick} disabled={isDialogOpen}>
      <div className="icon-title">
        <ResourceImage imagePathInProject={formResourcesPath(form, resource)} versionId={flipFlap ? 2 : 1} />
        <span className="title">{t(resource)}</span>
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
    </IconResourceContainer>
  );
};
