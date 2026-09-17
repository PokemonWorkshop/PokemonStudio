import { PageWithMenu, PageWithMenuProps } from '@components/pages';
import { SettingsNavigation } from '@components/settings';
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { SettingsLanguagePage } from './Settings.language.page';
import { SettingsMapsPage } from './Settings.maps.page';
import { SettingsShortcutsPage } from './Settings.shortcuts.page';

const SettingsPageWithMenu = ({ children }: Omit<PageWithMenuProps, 'navigation'>) => (
  <PageWithMenu navigation={<SettingsNavigation />}>{children}</PageWithMenu>
);

const SettingsRouterComponent = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="language" />} />
      <Route
        path="language"
        element={
          <SettingsPageWithMenu>
            <SettingsLanguagePage />
          </SettingsPageWithMenu>
        }
      />
      <Route
        path="maps"
        element={
          <SettingsPageWithMenu>
            <SettingsMapsPage />
          </SettingsPageWithMenu>
        }
      />
      <Route
        path="shortcuts"
        element={
          <SettingsPageWithMenu>
            <SettingsShortcutsPage />
          </SettingsPageWithMenu>
        }
      />
    </Routes>
  );
};

export default SettingsRouterComponent;
