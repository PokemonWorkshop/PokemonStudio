import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { Navigate, Route, Routes } from 'react-router-dom';
import { SettingsNavigation } from '@components/settings';
import { SettingsMapsPage } from './Settings.maps.page';

const SettingsRouterPageStyle = styled.div`
  display: flex;
  flex-direction: row;
`;

type SettingsPageWithMenuProps = {
  children: ReactNode;
};

const SettingsPageWithMenu = ({ children }: SettingsPageWithMenuProps) => {
  return (
    <SettingsRouterPageStyle>
      <SettingsNavigation />
      {children}
    </SettingsRouterPageStyle>
  );
};

const SettingsRouterComponent = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="maps" />} />
      <Route
        path="maps"
        element={
          <SettingsPageWithMenu>
            <SettingsMapsPage />
          </SettingsPageWithMenu>
        }
      />
    </Routes>
  );
};

export default SettingsRouterComponent;
