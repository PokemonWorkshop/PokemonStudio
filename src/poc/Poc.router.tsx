import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { PageWithMenu, PageWithMenuProps } from '@components/pages';
import { NavigationDatabaseStyle } from '@components/database/navigation/NavigationDatabase/NavigationDatabaseStyle';
import { NavigationDatabaseGroup } from '@components/database/navigation/NavigationDatabaseGroup';
import { NavigationDatabaseItem } from '@components/database/navigation/NavigationDatabaseItem';
import { EventEditor } from './eventEditor/EventEditor';
import { PocHomePage } from './PocHomePage';
import { ConvertEventsPage } from './ConvertEventsPage';

const PocNavigation = () => {
  return (
    <NavigationDatabaseStyle>
      <NavigationDatabaseGroup title="Events">
        <NavigationDatabaseItem path="/poc/events/eventeditor" label="Event Editor" />
        <NavigationDatabaseItem path="/poc/events/convertevents" label="Convert events" />
      </NavigationDatabaseGroup>
      <NavigationDatabaseGroup title="Navigation">
        <NavigationDatabaseItem path="/poc/home" label="Poc Home" />
      </NavigationDatabaseGroup>
    </NavigationDatabaseStyle>
  );
};

const PocPageWithMenu = ({ children }: Omit<PageWithMenuProps, 'navigation'>) => (
  <PageWithMenu navigation={<PocNavigation />}>{children}</PageWithMenu>
);

const PocRouterComponent = () => {
  return (
    <Routes>
      <Route
        path="/home"
        element={
          <PocPageWithMenu>
            <PocHomePage />
          </PocPageWithMenu>
        }
        index
      />
      <Route
        path="/events/eventeditor"
        element={
          <PocPageWithMenu>
            <EventEditor />
          </PocPageWithMenu>
        }
      />
      <Route
        path="/events/convertevents"
        element={
          <PocPageWithMenu>
            <ConvertEventsPage />
          </PocPageWithMenu>
        }
      />
      <Route path="/" element={<Navigate to="home" />} />
    </Routes>
  );
};

export default PocRouterComponent;
