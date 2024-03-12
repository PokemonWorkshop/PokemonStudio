import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
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
import TextsRouter from '@pages/texts/Texts.Router.page';
import DashboardRouter from '@pages/dashboard/Dashboard.Router.page';
import { Loader } from '@components/Loader';
import { LoaderContextProvider } from '@utils/loaderContext';
import { UnsavedWarningModal } from '@components/modals/UnsavedWarningModal';
import { TitleBar } from '@components/titleBar/TitleBar';
import WorldRouter from '@pages/world/World.Router.page';
import SettingsRouter from '@pages/settings/Settings.Router.page';

import './i18n';
import DesignSystemRouterComponent from '@ds/DesignSystem.router';
import { ToolTipContext } from '@ds/ToolTip/ToolTipContext';

const App = () => {
  return (
    <ToolTipContext>
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
                <Route path="/world/*" element={<WorldRouter />} />
                <Route path="/texts/*" element={<TextsRouter />} />
                <Route path="/code" />
                <Route path="/help" />
                <Route path="/settings/*" element={<SettingsRouter />} />
                <Route path="/account" />
                <Route path="/designSystem/*" element={<DesignSystemRouterComponent />} />
                <Route path="/" element={<Navigate to="/home" />} />
              </Routes>
            </MemoryRouter>
            <Loader />
            <ReactNotifications />
          </ThemeProvider>
        </LoaderContextProvider>
      </GlobalStateProvider>
    </ToolTipContext>
  );
};

const TitleBarApp = () => {
  return (
    <ThemeProvider theme={theme}>
      <TitleBar />
    </ThemeProvider>
  );
};

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <Suspense fallback={null}>
    <App />
  </Suspense>
);

const titlebar = createRoot(document.getElementById('titlebar') as HTMLElement);
titlebar.render(
  <Suspense fallback={null}>
    <TitleBarApp />
  </Suspense>
);
