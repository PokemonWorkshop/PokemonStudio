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
import { deleteProjectToList, getProjectList, updateProjectPath } from '@utils/projectList';
import { useDialogsRef } from '@hooks/useDialogsRef';
import { useNavigate } from 'react-router-dom';

import { useUnsavedWarning } from '@components/modals/unsavedWarningContext';
import { useSaveProjectAction } from '@src/hooks/useProjectSave/useSaveProjectAction';
import { useGlobalState } from '../../GlobalStateProvider'; // adapte si besoin
// eslint-disable-next-line react-hooks/rules-of-hooks

const HomePageComponent = () => {
  const dialogsRef = useDialogsRef<HomeEditorAndDeletionKeys>();
  const [appVersion, setAppVersion] = useState('');
  const [projectList, setProjectList] = useState(getProjectList());
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const { openModal, setOnConfirmQuit } = useUnsavedWarning();
  const { handleSave, isDataToSave } = useSaveProjectAction();
  const [state] = useGlobalState();

  const onDeleteProjectToList = (event: React.MouseEvent<HTMLSpanElement>, projectPath: string) => {
    event.stopPropagation();
    deleteProjectToList(projectPath);
    setProjectList(getProjectList());
  };

  const onUpdateProjectList = (projectPath: string, index: number) => {
    updateProjectPath(projectPath, index);
    setProjectList(getProjectList());
  };

  const handleOpenNewProject = () => {
    if (isDataToSave && state.projectData) {
      setOnConfirmQuit(async () => {
        await handleSave();
        dialogsRef.current?.openDialog('new_project');
      });
      openModal();
    } else {
      dialogsRef.current?.openDialog('new_project');
    }
  };

  const handleOpenProject = () => {
    if (isDataToSave && state.projectData) {
      setOnConfirmQuit(async () => {
        await handleSave();
        window.api.chooseProjectFileToOpen(
          { fileType: 'studio' },
          () => {},
          () => {}
        );
      });
      openModal();
    } else {
      window.api.chooseProjectFileToOpen(
        { fileType: 'studio' },
        () => {},
        () => {}
      );
    }
  };

  useEffect(() => {
    window.api.getAppVersion().then((version) => setAppVersion(version));
    window.api.synchronizeLanguage(
      { language: i18n.language },
      () => {},
      () => {}
    );
    window.api.getCompilationConfig(
      {},
      (result) => {
        const configuration = result.configuration;
        if (configuration) navigate('/compilation', { state: { configuration } });
      },
      () => {}
    );

    return () => {};
  }, []);

  const handleOpenProjectWrapper = () => {
    if (isDataToSave && state.projectData) {
      setOnConfirmQuit(async () => {
        await handleSave();
        handleOpenProject();
      });
      openModal();
    } else {
      handleOpenProject();
    }
  };

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
          <LoadProjectButton onClick={handleOpenProjectWrapper}>{t('open_a_project')}</LoadProjectButton>
          <PrimaryButton onClick={handleOpenNewProject}>{t('new_project')}</PrimaryButton>
        </BrandingActionContainer>
        {projectList.length !== 0 && (
          <RecentProjectContainer>
            <div>{t('recent_projects')}</div>
            <ProjectCardContainer>
              <ProjectCard
                project={projectList[0]}
                onDeleteProjectToList={onDeleteProjectToList}
                onUpdateProjectList={onUpdateProjectList}
                index={0}
              />
              <ProjectCard
                project={projectList[1]}
                onDeleteProjectToList={onDeleteProjectToList}
                onUpdateProjectList={onUpdateProjectList}
                index={1}
              />
              <ProjectCard
                project={projectList[2]}
                onDeleteProjectToList={onDeleteProjectToList}
                onUpdateProjectList={onUpdateProjectList}
                index={2}
              />
              <ProjectCard
                project={projectList[3]}
                onDeleteProjectToList={onDeleteProjectToList}
                onUpdateProjectList={onUpdateProjectList}
                index={3}
              />
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
