import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { PageWithMenu, PageWithMenuProps } from '@components/pages';
import { NavigationDatabaseStyle } from '@components/database/navigation/NavigationDatabase/NavigationDatabaseStyle';
import { NavigationDatabaseGroup } from '@components/database/navigation/NavigationDatabaseGroup';
import { NavigationDatabaseItem } from '@components/database/navigation/NavigationDatabaseItem';
import { DesignSystem } from './DesignSystem';
import { SelectExamples } from './Select/Examples';

const DesignSystemNavigation = () => {
  return (
    <NavigationDatabaseStyle>
      <NavigationDatabaseGroup title="Inputs">
        <NavigationDatabaseItem path="/designSystem/select" label="Select" />
      </NavigationDatabaseGroup>
      <NavigationDatabaseGroup title="Navigation">
        <NavigationDatabaseItem path="/designSystem/home" label="Design System Home" />
        <NavigationDatabaseItem path="/" label="Pokémon Studio Home" />
      </NavigationDatabaseGroup>
    </NavigationDatabaseStyle>
  );
};

const DesignSystemPageWithMenu = ({ children }: Omit<PageWithMenuProps, 'navigation'>) => (
  <PageWithMenu navigation={<DesignSystemNavigation />}>{children}</PageWithMenu>
);

const DesignSystemRouterComponent = () => {
  return (
    <Routes>
      <Route
        path="/home"
        element={
          <DesignSystemPageWithMenu>
            <DesignSystem />
          </DesignSystemPageWithMenu>
        }
        index
      />
      <Route
        path="select"
        element={
          <DesignSystemPageWithMenu>
            <SelectExamples />
          </DesignSystemPageWithMenu>
        }
      />
    </Routes>
  );
};

export default DesignSystemRouterComponent;
