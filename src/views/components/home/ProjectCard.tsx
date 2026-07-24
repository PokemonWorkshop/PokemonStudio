import { BaseIcon } from '@components/icons/BaseIcon';
import { ActiveContainer } from '@components/ActiveContainer';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useLoaderRef } from '@utils/loaderContext';
import { ClearButtonOnlyIcon, FolderButtonOnlyIcon, SecondaryButton } from '@components/buttons';
import { Code } from '@components/Code';
import { useProjectLoad } from '@hooks/useProjectLoad';
import { Project } from '@utils/projectList';
import { ResourceImage } from '@components/ResourceImage';
import { useShowItemInFolder } from '@hooks/useShowItemInFolder';
import { join } from '@utils/path';
import { playSound } from '@utils/sound';
import { RmxpMigrationDialog } from './RmxpMigrationDialog';

const ProjectCardContainer = styled(ActiveContainer)`
  position: relative;
  width: 237px;
  gap: 12px;

  & img,
  & div:first-child {
    width: 40px;
    height: 40px;
    border-radius: 8px;
  }

  & h2 {
    display: inline-block;
    ${({ theme }) => theme.fonts.titlesHeadline6}
    color: ${({ theme }) => theme.colors.text400};
    height: 44px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    margin: 0 0 4px 0;
    padding: 0;
  }

  & p {
    display: inline-block;
    padding: 0;
    margin: 0;
    ${({ theme }) => theme.fonts.normalRegular}
    color: ${({ theme }) => theme.colors.text400};
  }

  &:hover {
    cursor: pointer;

    & button.clear-button,
    & button.folder-button {
      opacity: 1;
      transform: none;
      pointer-events: auto;
    }
  }

  &[data-disabled='true']:hover {
    cursor: default;
  }

  /*
   * These used to be toggled with display, which is discrete and cannot
   * transition -- so the buttons snapped into existence on hover. Kept laid out
   * and hidden with opacity instead, which can. This is the first screen of
   * every session, so it is worth the polish.
   *
   * The right-anchoring MUST live here in the base rule, not only under :hover.
   * When it was hover-only the idle buttons fell back to their static (left)
   * position, so on hover they visibly slid across to the right as they faded
   * in -- and slid back on leave. Anchored in both states, only opacity and the
   * 2px lift animate.
   */
  & button.clear-button,
  & button.folder-button {
    position: absolute;
    display: inline-block;
    top: 16px;
    height: 50px;
    width: 52px;
    background: none;
    color: inherit;
    border: none;
    font: inherit;
    outline: none;
    opacity: 0;
    transform: translateY(-2px);
    pointer-events: none;
    transition: opacity 140ms ${({ theme }) => theme.motion.easeOut}, transform 140ms ${({ theme }) => theme.motion.easeOut};
  }

  & .clear-button {
    right: 16px;
  }

  & .folder-button {
    right: 60px;
  }

  @media (prefers-reduced-motion: reduce) {
    & button.clear-button,
    & button.folder-button {
      transform: none;
      transition: opacity 140ms ease;
    }
  }

  ${Code} {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    max-width: 171px;
  }
`;

type ProjectCardProps = {
  project: Project | undefined;
  index: number;
  onDeleteProjectToList: (event: React.MouseEvent<HTMLSpanElement>, projectPath: string) => void;
  onUpdateProjectList: (projectPath: string, index: number) => void;
};

export const ProjectCard = ({ project, onDeleteProjectToList, onUpdateProjectList, index }: ProjectCardProps) => {
  const { t } = useTranslation();
  const loaderRef = useLoaderRef();
  const projectLoad = useProjectLoad();
  const navigate = useNavigate();
  const showItemInFolder = useShowItemInFolder();
  const continueRef = useRef<(() => void) | null>(null);
  const [showRmxpDialog, setShowRmxpDialog] = useState(false);

  const handleChangeFileClick = () => {
    return window.api.chooseProjectFileToOpen(
      { fileType: 'studio' },
      ({ dirName }) => {
        onUpdateProjectList(dirName, index);
        loaderRef.current.close();
      },
      () => {}
    );
  };

  const handleClick = async () => {
    if (!project) return;

    projectLoad(
      { projectDirName: project.projectPath },
      () => {
        loaderRef.current.close();
        playSound('sparkle');
        navigate('/dashboard');
      },
      ({ errorMessage }) => {
        // TODO: Make an other way to find out if the project is not found
        if (errorMessage.includes('no such file or directory')) {
          const errorNode = <SecondaryButton onClick={handleChangeFileClick}>{t('browse_my_files')}</SecondaryButton>;
          loaderRef.current.setError('loading_project_error', t('project_studio_not_found'), false, errorNode);
        } else {
          loaderRef.current.setError('loading_project_error', errorMessage);
        }
      },
      (count) => loaderRef.current.setError('loading_project_error', t('integrity_message', { count }), true),
      (onContinue) => {
        continueRef.current = onContinue;
        setShowRmxpDialog(true);
      },
    );
  };

  const onClickFolder = async (path: string, event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    event.stopPropagation();
    if (!path) return;

    showItemInFolder(
      { filePath: join(path, 'project.studio') },
      () => {},
      () => {
        handleClick();
      }
    );
  };

  return (
    <>
      {showRmxpDialog && (
        <RmxpMigrationDialog
          onContinue={() => continueRef.current?.()}
          closeDialog={() => setShowRmxpDialog(false)}
        />
      )}
      {project ? (
        <ProjectCardContainer onClick={handleClick}>
          {project.projectStudio.iconPath ? (
            <ResourceImage imagePathInProject={project.projectStudio.iconPath} projectPath={project.projectPath} />
          ) : (
            <BaseIcon icon="top" size="m" color="" />
          )}
          <h2>{project.projectStudio.title}</h2>
          <p>
            {t('last_edit', {
              date: project.lastEdit.toLocaleDateString(),
            })}
          </p>
          <Code>{`/${project.projectPath.replaceAll('\\', '/').split('/').splice(-1)[0]}`}</Code>
          <button className="folder-button">
            <FolderButtonOnlyIcon onClick={(event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => onClickFolder(project.projectPath, event)} />
          </button>
          <button className="clear-button">
            <ClearButtonOnlyIcon onClick={(event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => onDeleteProjectToList(event, project.projectPath)} />
          </button>
        </ProjectCardContainer>
      ) : (
        <ProjectCardContainer data-disabled="true" />
      )}
    </>
  );
};
