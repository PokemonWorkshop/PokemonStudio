import { BaseIcon } from '@components/icons/BaseIcon';
import { ActiveContainer } from '@components/ActiveContainer';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import ProjectStudioModel from '@modelEntities/ProjectStudio.model';
import { useHistory } from 'react-router-dom';
import { useLoaderRef } from '@utils/loaderContext';
import { ClearButtonOnlyIcon } from '@components/buttons';
import { Code } from '@components/Code';
import { useProjectLoadV2 } from '@utils/useProjectLoadV2';

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
  projectStudio: ProjectStudioModel;
  projectPath: string;
  lastEdit: Date;
  onDeleteProjectToList: (event: React.MouseEvent<HTMLSpanElement>, projectPath: string) => void;
};

export const ProjectCard = ({ projectStudio, lastEdit, projectPath, onDeleteProjectToList }: ProjectCardProps) => {
  const { t } = useTranslation(['homepage']);
  const loaderRef = useLoaderRef();
  const projectLoadV2 = useProjectLoadV2();
  const history = useHistory();

  const handleClick = () => {
    projectLoadV2(
      { projectDirName: projectPath },
      () => {
        loaderRef.current.close();
        history.push('/dashboard');
      },
      ({ errorMessage }) => loaderRef.current.setError('loading_project_error', errorMessage)
    );
  };

  return (
    <ProjectCardContainer onClick={handleClick}>
      {projectStudio.iconPath ? <img src={`file://${projectPath}/${projectStudio.iconPath}`} /> : <BaseIcon icon="top" size="m" color="" />}
      <h2>{projectStudio.title}</h2>
      <p>
        {t('homepage:last_edit', {
          date: lastEdit.toLocaleDateString(),
        })}
      </p>
      <Code>{`/${projectPath.replaceAll('\\', '/').split('/').splice(-1)[0]}`}</Code>
      <button className="clear-button">
        <ClearButtonOnlyIcon onClick={(event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => onDeleteProjectToList(event, projectPath)} />
      </button>
    </ProjectCardContainer>
  );
};
