import { DashboardNavigation } from '@components/dashboard';
import React, { ReactNode } from 'react';
import { Switch, useRouteMatch, Route } from 'react-router';
import styled from 'styled-components';
import { DashboardInfosPage } from './Dashboard.Infos.page';
import { DashboardLanguagePage } from './Dashboard.Language.page';
import { DashboardSettingsPage } from './Dashboard.Settings.page';
import { DashboardDevicesPage } from './Dashboard.Devices.page';
import { DashboardGraphicsPage } from './Dashboard.Graphics.page';
import { DashboardDisplayPage } from './Dashboard.Display.page';
import { DashboardSavePage } from './Dashboard.Save.page';
import { DashboardPage } from './Dashboard.page';

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
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <DashboardPage />
      </Route>
      <Route path={`${path}/infos`}>
        <DashboardPageWithMenu>
          <DashboardInfosPage />
        </DashboardPageWithMenu>
      </Route>
      <Route path={`${path}/language`}>
        <DashboardPageWithMenu>
          <DashboardLanguagePage />
        </DashboardPageWithMenu>
      </Route>
      <Route path={`${path}/settings`}>
        <DashboardPageWithMenu>
          <DashboardSettingsPage />
        </DashboardPageWithMenu>
      </Route>
      <Route path={`${path}/texts`}>
        <DashboardPageWithMenu>
          <div>Texts</div>
        </DashboardPageWithMenu>
      </Route>
      <Route path={`${path}/options`}>
        <DashboardPageWithMenu>
          <div>Options</div>
        </DashboardPageWithMenu>
      </Route>
      <Route path={`${path}/devices`}>
        <DashboardPageWithMenu>
          <DashboardDevicesPage />
        </DashboardPageWithMenu>
      </Route>
      <Route path={`${path}/display`}>
        <DashboardPageWithMenu>
          <DashboardDisplayPage />
        </DashboardPageWithMenu>
      </Route>
      <Route path={`${path}/graphics`}>
        <DashboardPageWithMenu>
          <DashboardGraphicsPage />
        </DashboardPageWithMenu>
      </Route>
      <Route path={`${path}/save`}>
        <DashboardPageWithMenu>
          <DashboardSavePage />
        </DashboardPageWithMenu>
      </Route>
    </Switch>
  );
};

export default DashboardRouterComponent;
