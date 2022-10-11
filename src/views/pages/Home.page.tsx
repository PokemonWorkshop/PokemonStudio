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
import { HomePageNewEditor } from './editors';
import { EditorOverlay } from '@components/editor';
import { deleteProjectToList, getProjectList } from '@utils/projectList';

const HomePageComponent = () => {
  const [currentEditor, setCurrentEditor] = useState<string | undefined>(undefined);
  const [appVersion, setAppVersion] = useState('');
  const [projectList, setProjectList] = useState(getProjectList());

  const onCloseEditor = () => {
    setCurrentEditor(undefined);
  };

  const onDeleteProjectToList = (event: React.MouseEvent<HTMLSpanElement>, projectPath: string) => {
    event.stopPropagation();
    deleteProjectToList(projectPath);
    setProjectList(getProjectList());
  };

  const editors = {
    informationsEditor: <HomePageNewEditor />,
  };

  const { t } = useTranslation(['homepage']);

  useEffect(() => {
    window.api.getAppVersion().then((version) => setAppVersion(version));

    return () => {};
  });

  return (
    <HomePageContainer>
      <Header>
        {t('homepage:version_current_version_editor', {
          current_version_editor: appVersion,
        })}
      </Header>
      <ActionContainer>
        <BrandingActionContainer>
          <BrandingTitleContainer>
            <StudioIcon />
            <BrandingTitle>Pokémon Studio</BrandingTitle>
          </BrandingTitleContainer>
          <LoadProjectButton>{t('homepage:open_a_project')}</LoadProjectButton>
          <PrimaryButton onClick={() => setCurrentEditor('informationsEditor')}>{t('homepage:new_project')}</PrimaryButton>
        </BrandingActionContainer>
        {projectList.length !== 0 && (
          <RecentProjectContainer>
            <div>{t('homepage:recent_projects')}</div>
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
      <EditorOverlay editors={editors} currentEditor={currentEditor} onClose={onCloseEditor} />
    </HomePageContainer>
  );
};

export default HomePageComponent;
