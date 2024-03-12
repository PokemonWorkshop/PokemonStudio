import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ProjectCard } from '../components/home/ProjectCard';
import { LoadProjectButton, PrimaryButton } from '@components/buttons';
import {
  HomePageContainer,
  Header,
  Footer,
  ActionContainer,
  BrandingActionContainer,
  BrandingTitleContainer,
  BrandingTitle,
  ProjectCardContainer,
} from '@components/home';
import { ReactComponent as StudioIcon } from '@assets/icons/global/StudioIcon.svg';
import { RecentProjectContainer } from '@components/home/ActionContainer';
import { HomeEditorAndDeletionKeys, HomeEditorOverlay } from '@components/home/editors/HomeEditorOverlay';
import { deleteProjectToList, getProjectList } from '@utils/projectList';
import { useDialogsRef } from '@utils/useDialogsRef';
import { useNavigate } from 'react-router-dom';

const HomePageComponent = () => {
  const dialogsRef = useDialogsRef<HomeEditorAndDeletionKeys>();
  const [appVersion, setAppVersion] = useState('');
  const [projectList, setProjectList] = useState(getProjectList());
  const { t } = useTranslation('homepage');
  const navigate = useNavigate();

  const onDeleteProjectToList = (event: React.MouseEvent<HTMLSpanElement>, projectPath: string) => {
    event.stopPropagation();
    deleteProjectToList(projectPath);
    setProjectList(getProjectList());
  };

  useEffect(() => {
    window.api.getAppVersion().then((version) => setAppVersion(version));

    return () => {};
  });

  return (
    <HomePageContainer>
      <Header>
        {t('version_current_version_editor', {
          current_version_editor: appVersion,
        })}
      </Header>
      <ActionContainer>
        <BrandingActionContainer>
          <BrandingTitleContainer onClick={() => window.api.isDev && navigate('/designSystem/home')}>
            <StudioIcon />
            <BrandingTitle>Pokémon Studio</BrandingTitle>
          </BrandingTitleContainer>
          <LoadProjectButton>{t('open_a_project')}</LoadProjectButton>
          <PrimaryButton onClick={() => dialogsRef.current?.openDialog('new_project')}>{t('new_project')}</PrimaryButton>
        </BrandingActionContainer>
        {projectList.length !== 0 && (
          <RecentProjectContainer>
            <div>{t('recent_projects')}</div>
            <ProjectCardContainer>
              <ProjectCard project={projectList[0]} onDeleteProjectToList={onDeleteProjectToList} />
              <ProjectCard project={projectList[1]} onDeleteProjectToList={onDeleteProjectToList} />
              <ProjectCard project={projectList[2]} onDeleteProjectToList={onDeleteProjectToList} />
              <ProjectCard project={projectList[3]} onDeleteProjectToList={onDeleteProjectToList} />
            </ProjectCardContainer>
          </RecentProjectContainer>
        )}
      </ActionContainer>
      <Footer />
      <HomeEditorOverlay ref={dialogsRef} />
    </HomePageContainer>
  );
};

export default HomePageComponent;
