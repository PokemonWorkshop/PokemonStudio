import { BaseIcon } from '@components/icons/BaseIcon';
import { ActiveContainer } from '@components/ActiveContainer';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import { useLoaderRef } from '@utils/loaderContext';
import { ClearButtonOnlyIcon } from '@components/buttons';
import { Code } from '@components/Code';
import { useProjectLoad } from '@utils/useProjectLoad';
import { Project } from '@utils/projectList';

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
    overflow-y: hidden;
    text-overflow: ellipsis;
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

  & :hover {
    cursor: pointer;

    & button.clear-button {
      position: absolute;
      display: inline-block;
      top: 16px;
      right: 16px;
      height: 50px;
      width: 52px;
      background: none;
      color: inherit;
      border: none;
      font: inherit;
      outline: inherit;
    }
  }

  &[data-disabled='true']:hover {
    cursor: default;
  }

  & button.clear-button {
    display: none;
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
  onDeleteProjectToList: (event: React.MouseEvent<HTMLSpanElement>, projectPath: string) => void;
};

export const ProjectCard = ({ project, onDeleteProjectToList }: ProjectCardProps) => {
  const { t } = useTranslation(['homepage', 'loader']);
  const loaderRef = useLoaderRef();
  const projectLoad = useProjectLoad();
  const history = useHistory();

  const handleClick = () => {
    if (!project) return;

    projectLoad(
      { projectDirName: project.projectPath },
      () => {
        loaderRef.current.close();
        history.push('/dashboard');
      },
      ({ errorMessage }) => loaderRef.current.setError('loading_project_error', errorMessage),
      (count) => loaderRef.current.setError('loading_project_error', t('loader:integrity_message', { count }), true)
    );
  };

  return project ? (
    <ProjectCardContainer onClick={handleClick}>
      {project.projectStudio.iconPath ? (
        <img src={`file://${project.projectPath}/${project.projectStudio.iconPath}`} />
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
      <button className="clear-button">
        <ClearButtonOnlyIcon onClick={(event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => onDeleteProjectToList(event, project.projectPath)} />
      </button>
    </ProjectCardContainer>
  ) : (
    <ProjectCardContainer data-disabled="true" />
  );
};
