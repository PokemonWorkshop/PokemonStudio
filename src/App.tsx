import React, { Suspense } from 'react';
import { render } from 'react-dom';
import { ReactNotifications } from 'react-notifications-component';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import GlobalStyle from './AppGlobalStyle';
import theme from './AppTheme';
import { GlobalStateProvider } from './GlobalStateProvider';
import { NavigationBarComponent } from './views/components/navigation/NavigationBar';
import HomePage from './views/pages/Home.page';
import DatabasePage from './views/pages/database/Database/Database.page';
import PSDKUpdatePage from './views/pages/PSDKUpdate.page';
import MapLinkPage from './views/pages/mapLink/MapLink.page';
import DashboardRouter from '@pages/dashboard/Dashboard.Router.page';
import { Loader } from '@components/Loader';
import { LoaderContextProvider } from '@utils/loaderContext';
import { UnsavedWarningModal } from '@components/modals/UnsavedWarningModal';
import { TitleBar } from '@components/titleBar/TitleBar';

import './i18n';

const App = () => {
  return (
    <GlobalStateProvider>
      <LoaderContextProvider>
        <ThemeProvider theme={theme}>
          <GlobalStyle />
          <UnsavedWarningModal />
          <MemoryRouter>
            <NavigationBarComponent />
            <Routes>
              <Route path="/home" element={<HomePage />} />
              <Route path="/dashboard/*" element={<DashboardRouter />} />
              <Route path="/psdkupdate" element={<PSDKUpdatePage />} />
              <Route path="/database/*" element={<DatabasePage />} />
              <Route path="/map" element={<MapLinkPage />} />
              <Route path="/code" />
              <Route path="/help" />
              <Route path="/settings" />
              <Route path="/account" />
              <Route path="/" element={<Navigate to="/home" />} />
            </Routes>
          </MemoryRouter>
          <Loader />
          <ReactNotifications />
        </ThemeProvider>
      </LoaderContextProvider>
    </GlobalStateProvider>
  );
};

render(
  <Suspense fallback={null}>
    <App />
  </Suspense>,
  document.getElementById('root')
);

const TitleBarApp = () => {
  return (
    <ThemeProvider theme={theme}>
      <TitleBar />
    </ThemeProvider>
  );
};

render(
  <Suspense fallback={null}>
    <TitleBarApp />
  </Suspense>,
  document.getElementById('titlebar')
);
