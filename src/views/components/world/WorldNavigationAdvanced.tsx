import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { NavigationDatabaseStyle } from '@components/database/navigation/NavigationDatabase/NavigationDatabaseStyle';
import { NavigationDatabaseItem } from '@components/database/navigation/NavigationDatabaseItem';
import { MapMenu } from './map';
import { EventMenu } from './event/EventMenu';

const WorldNavigationStyle = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  gap: 2px;
  min-width: 320px;
`;

const WorlMapsEventDiv = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark20};
  padding-bottom: 8px;
`;

const WorldBuildingNavigationStyle = styled(NavigationDatabaseStyle)`
  padding-bottom: 16px;
  gap: 16px;
`;

const routeLinks = {
  events: '/world/events',
  map: '/world/map',
  maplinks: '/world/maplinks',
};

export const WorldNavigationAdvanced = () => {
  const { t } = useTranslation();

  const navigationItems = [
    { path: routeLinks.map, label: t('maps') },
    { path: routeLinks.events, label: t('events') },
    { path: routeLinks.maplinks, label: t('maplinks') },
  ];

  const getMenuComponent = (pathname: string) => {
    switch (pathname) {
      case routeLinks.map:
      case routeLinks.maplinks:
        return <MapMenu />;
      case routeLinks.events:
        return <EventMenu />;
      default:
        return <MapMenu />;
    }
  };

  return (
    <WorldNavigationStyle>
      <WorldBuildingNavigationStyle>
        <WorlMapsEventDiv>
          {navigationItems.map((item) => (
            <NavigationDatabaseItem key={item.path} path={item.path} label={item.label} />
          ))}
        </WorlMapsEventDiv>
      </WorldBuildingNavigationStyle>

      {getMenuComponent(location.pathname)}
    </WorldNavigationStyle>
  );
};
