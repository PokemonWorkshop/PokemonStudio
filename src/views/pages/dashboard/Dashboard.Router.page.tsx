import { DashboardNavigation } from '@components/dashboard';
import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { DashboardInfosPage } from './Dashboard.Infos.page';
import { DashboardLanguagePage } from './Dashboard.Language.page';
import { DashboardSettingsPage } from './Dashboard.Settings.page';
import { DashboardDevicesPage } from './Dashboard.Devices.page';
import { DashboardGraphicsPage } from './Dashboard.Graphics.page';
import { DashboardDisplayPage } from './Dashboard.Display.page';
import { DashboardSavePage } from './Dashboard.Save.page';
import { DashboardPage } from './Dashboard.page';
import { DashboardGameStartPage } from './Dashboard.GameStart.page';
import { Route, Routes } from 'react-router-dom';
import { DashboardTextsPage } from './Dashboard.Texts.page';

const DashboardRouterPageStyle = styled.div`
  display: flex;
  flex-direction: row;
`;

type DashboardPageWithMenuProps = {
  children: ReactNode;
};

const DashboardPageWithMenu = ({ children }: DashboardPageWithMenuProps) => {
  return (
    <DashboardRouterPageStyle>
      <DashboardNavigation />
      {children}
    </DashboardRouterPageStyle>
  );
};

const DashboardRouterComponent = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route
        path="infos"
        element={
          <DashboardPageWithMenu>
            <DashboardInfosPage />
          </DashboardPageWithMenu>
        }
      />
      <Route
        path="language"
        element={
          <DashboardPageWithMenu>
            <DashboardLanguagePage />
          </DashboardPageWithMenu>
        }
      />
      <Route
        path="settings"
        element={
          <DashboardPageWithMenu>
            <DashboardSettingsPage />
          </DashboardPageWithMenu>
        }
      />
      <Route
        path="texts"
        element={
          <DashboardPageWithMenu>
            <DashboardTextsPage />
          </DashboardPageWithMenu>
        }
      />
      <Route
        path="options"
        element={
          <DashboardPageWithMenu>
            <div>Options</div>
          </DashboardPageWithMenu>
        }
      />
      <Route
        path="devices"
        element={
          <DashboardPageWithMenu>
            <DashboardDevicesPage />
          </DashboardPageWithMenu>
        }
      />
      <Route
        path="display"
        element={
          <DashboardPageWithMenu>
            <DashboardDisplayPage />
          </DashboardPageWithMenu>
        }
      />
      <Route
        path="graphics"
        element={
          <DashboardPageWithMenu>
            <DashboardGraphicsPage />
          </DashboardPageWithMenu>
        }
      />
      <Route
        path="save"
        element={
          <DashboardPageWithMenu>
            <DashboardSavePage />
          </DashboardPageWithMenu>
        }
      />

      <Route
        path="gameStart"
        element={
          <DashboardPageWithMenu>
            <DashboardGameStartPage />
          </DashboardPageWithMenu>
        }
      />
    </Routes>
  );
};

export default DashboardRouterComponent;
