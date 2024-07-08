import { BaseIcon } from '@components/icons/BaseIcon';
import { ActiveContainer } from '@components/ActiveContainer';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useLoaderRef } from '@utils/loaderContext';
import { ClearButtonOnlyIcon, FolderButtonOnlyIcon } from '@components/buttons';
import { Code } from '@components/Code';
import { useProjectLoad } from '@hooks/useProjectLoad';
import { Project } from '@utils/projectList';
import { ResourceImage } from '@components/ResourceImage';
import { useShowItemInFolder } from '@hooks/useShowItemInFolder';
import { join } from '@utils/path';

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
    margin: 0;
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
    }
    .clear-button {
      right: 16px;
    }

    .folder-button {
      right: 60px;
    }
  }

  &[data-disabled='true']:hover {
    cursor: default;
  }

  & button.clear-button {
    display: none;
  }

  & button.folder-button {
    display: none;
  }

  ${Code} {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow-x: hidden;
    max-width: 171px;
  }
`;

type ProjectCardProps = {
  project: Project | undefined;
  onDeleteProjectToList: (event: React.MouseEvent<HTMLSpanElement>, projectPath: string) => void;
};

export const ProjectCard = ({ project, onDeleteProjectToList }: ProjectCardProps) => {
  const { t } = useTranslation(['homepage', 'loader']);
  const loaderRef = useLoaderRef();
  const projectLoad = useProjectLoad();
  const navigate = useNavigate();
  const showItemInFolder = useShowItemInFolder();

  const handleClick = async () => {
    if (!project) return;

    projectLoad(
      { projectDirName: project.projectPath },
      () => {
        loaderRef.current.close();
        navigate('/dashboard');
      },
      ({ errorMessage }) => loaderRef.current.setError('loading_project_error', errorMessage),
      (count) => loaderRef.current.setError('loading_project_error', t('loader:integrity_message', { count }), true)
    );
  };

  const onClickFolder = async (path: string, event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    event.stopPropagation();
    if (!path) return;

    showItemInFolder(
      { filePath: join(path, 'project.studio') },
      () => {},
      () => {}
    );
  };

  return project ? (
    <ProjectCardContainer onClick={handleClick}>
      {project.projectStudio.iconPath ? (
        <ResourceImage imagePathInProject={project.projectStudio.iconPath} projectPath={project.projectPath} />
      ) : (
        <BaseIcon icon="top" size="m" color="" />
      )}
      <h2>{project.projectStudio.title}</h2>
      <p>
        {t('homepage:last_edit', {
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
  );
};
