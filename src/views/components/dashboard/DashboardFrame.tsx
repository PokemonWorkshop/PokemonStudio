import {
  DataBlockContainer,
  DataGrid,
  DataInfoContainer,
  DataInfoContainerHeader,
  DataInfoContainerHeaderTitle,
  DataSpriteContainer,
} from '@components/database/dataBlocks';
import { useGlobalState } from '@src/GlobalStateProvider';
import { useConfigInfos } from '@utils/useProjectConfig';
import { useProjectStudio } from '@utils/useProjectStudio';
import path from 'path';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Code } from '@components/Code';

const ProjectVersionContainer = styled.div`
  color: ${({ theme }) => theme.colors.text400};
  ${({ theme }) => theme.fonts.normalRegular};
`;

export const DashboardFrame = () => {
  const [state] = useGlobalState();
  const { projectStudioValues: projectStudio } = useProjectStudio();
  const { projectConfigValues: infos } = useConfigInfos();
  const { t } = useTranslation('dashboard');
  return (
    <DataBlockContainer size="full" data-disabled={true}>
      <DataGrid columns="160px minmax(min-content, 1024px)" gap="24px">
        <DataSpriteContainer type="sprite">
          <img
            alt="project icon"
            src={state.projectPath ? path.join(state.projectPath, projectStudio.iconPath) : 'https://www.pokepedia.fr/images/8/87/Pok%C3%A9_Ball.png'}
          />
        </DataSpriteContainer>
        <DataInfoContainer>
          <DataInfoContainerHeader>
            <DataInfoContainerHeaderTitle>
              <h1>{projectStudio.title}</h1>
            </DataInfoContainerHeaderTitle>
            <ProjectVersionContainer>{t('project_version', { project_version: infos.gameVersion })}</ProjectVersionContainer>
          </DataInfoContainerHeader>
          <Code>{`/${state.projectPath?.replaceAll('\\', '/').split('/').splice(-1)[0]}`}</Code>
        </DataInfoContainer>
      </DataGrid>
    </DataBlockContainer>
  );
};
