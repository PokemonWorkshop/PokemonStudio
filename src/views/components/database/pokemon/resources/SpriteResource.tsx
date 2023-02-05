import { ClearButtonOnlyIcon, FolderButtonOnlyIcon } from '@components/buttons';
import { DropInputContainer } from '@components/inputs/DropInput';
import { ResourceImage } from '@components/ResourceImage';
import React, { DragEventHandler, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ReactComponent as FileDrop } from '@assets/icons/global/drop.svg';
import { useChoosefile } from '@utils/useChooseFile';
import { useGlobalState } from '@src/GlobalStateProvider';
import { useShowItemInFolder } from '@utils/useShowItemInFolder';
import { useCopyFile } from '@utils/useCopyFile';
import { ResourceContainer } from './ResourcesContainer';
import { CreatureFormResourcesPath, dirname, formResourcesPath, join } from '@utils/path';
import { StudioCreatureForm } from '@modelEntities/creature';

const SpriteResourceContainer = styled(ResourceContainer)`
  position: relative;
  flex-direction: column;
  padding: 24px 24px 16px;
  width: 244px;
  height: 244px;

  & :hover {
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
    height: 160px;
    width: 160px;
  }

  & span.title {
    width: 100%;
  }
`;

const SpriteNoResourceContainer = styled(DropInputContainer)`
  display: flex;
  padding: 24px 24px 16px;
  margin: 0 8px 0 8px;
  width: 244px;
  height: 244px;
  border: 1px dashed ${({ theme }) => theme.colors.dark20};
  background-color: inherit;
  justify-content: space-between;

  & .drag-and-drop {
    display: flex;
    gap: 8px;
    height: 174px;
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

const onDragOver: DragEventHandler<HTMLDivElement> = (event) => {
  event.preventDefault();
  event.stopPropagation();
};

const isNoRessource = (form: StudioCreatureForm, resource: CreatureFormResourcesPath, isFemale: boolean) => {
  return isFemale ? form.resources[resource] === undefined : form.resources[resource]?.length === 0;
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
  const [state] = useGlobalState();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [flipFlap, setFlipFlap] = useState(false);
  const { t } = useTranslation(['database_pokemon', 'drop']);
  const chooseFile = useChoosefile();
  const copyFile = useCopyFile();
  const showItemInFolder = useShowItemInFolder();

  const onDrop: DragEventHandler<HTMLDivElement> = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const extensions = disableGif ? ['png'] : ['png', 'gif'];
    const acceptedFiles = Array.from(event.dataTransfer.files).filter((file) => extensions.includes(file.name.split('.').pop() ?? ''));
    if (acceptedFiles.length > 0) {
      copyFile(
        { srcFile: acceptedFiles[0].path, destFolder: dirname(formResourcesPath(form, resource)) },
        ({ destFile }) =>
          setImmediate(() => {
            onResourceChoosen(destFile, resource);
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
      { name: t(`database_pokemon:${resource}`), extensions, destFolderToCopy: dirname(formResourcesPath(form, resource)) },
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
      { filePath: join(state.projectPath, filePath) },
      () => {},
      () => {}
    );
  };

  return isNoRessource(form, resource, isFemale) ? (
    <SpriteNoResourceContainer onDrop={onDrop} onDragOver={onDragOver}>
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
    <SpriteResourceContainer onDrop={onDrop} onDragOver={onDragOver} onClick={isDialogOpen ? undefined : onClick} disabled={isDialogOpen}>
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
      <ResourceImage imagePathInProject={formResourcesPath(form, resource)} versionId={flipFlap ? 2 : 1} />
      <span className="title">{t(`database_pokemon:${resource}`)}</span>
    </SpriteResourceContainer>
  );
};
