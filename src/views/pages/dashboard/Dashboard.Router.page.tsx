import { DashboardNavigation } from '@components/dashboard';
import React, { ReactNode } from 'react';
import { Switch, useRouteMatch, Route } from 'react-router';
import styled from 'styled-components';
import { DashboardInfosPage } from './Dashboard.Infos.page';
import { DashboardLanguagePage } from './Dashboard.Language.page';
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
          <div>Settings</div>
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
          <div>Devices</div>
        </DashboardPageWithMenu>
      </Route>
    </Switch>
  );
};

export default DashboardRouterComponent;
