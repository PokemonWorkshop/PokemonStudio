import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/home/Header';
import { ProjectCard } from '../components/home/ProjectCard';
import { Footer } from '../components/home/Footer';
import HomeStyle from './HomeStyle';
import { SecondaryButton } from '../components/buttons/SecondaryButton';
import { LoadProjectButton } from '../components/buttons/LoadProjectButton';
import { useGlobalState } from '../../GlobalStateProvider';

const HomePageComponent: FunctionComponent = () => {
  const { t } = useTranslation(['homepage']);
  const [state, setState] = useGlobalState();
  return (
    <HomeStyle>
      <Header />
      <div id="main">
        <div id="appName">
          <h1>Pokémon Studio</h1>
        </div>
        <div id="buttons">
          <button type="button" onClick={() => console.log(state)}>
            test
          </button>
          <LoadProjectButton text={t('homepage:import_a_project')} />
          <SecondaryButton text={t('homepage:new_project')} />
        </div>
        <div id="recentProjects">
          <span>{t('homepage:recent_projects')}</span>
          <div id="recentProjectsRow">
            <ProjectCard projectId="1" />
            <ProjectCard projectId="2" />
          </div>
        </div>
      </div>
      <Footer />
    </HomeStyle>
  );
};

export default HomePageComponent;
