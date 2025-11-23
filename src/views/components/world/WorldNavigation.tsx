import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { NavigationDatabaseStyle } from '@components/database/navigation/NavigationDatabase/NavigationDatabaseStyle';
import { NavigationDatabaseItem } from '@components/database/navigation/NavigationDatabaseItem';
import { MapMenu } from './map';
import { useProjectStudio } from '@root/src/hooks/useProjectStudio';
import { useLocation } from 'react-router-dom/dist';
import { EventMenu } from './event/EventMenu';

const WorldNavigationStyle = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  gap: 2px;
  min-width: 320px;
`;

const WorlMapsEventDiv = styled.div<{ $showBorder?: boolean }>`
  display: flex;
  flex-direction: row;
  gap: 8px;
  ${({ $showBorder, theme }) =>
    $showBorder &&
    `
    border-bottom: 1px solid ${theme.colors.dark20};
    padding-bottom: 8px;
  `}
`;

const WorldBuildingNavigationStyle = styled(NavigationDatabaseStyle)`
  padding-bottom: 16px;
  gap: 16px;
`;

export const WorldNavigation = () => {
  const { projectStudioValues } = useProjectStudio();
  const { t } = useTranslation();
  const location = useLocation();
  const isTiledMode = projectStudioValues.isTiledMode;
  const isMapPage = !!location.pathname.match(/^\/world\/(map|overview|maplink)/);

  const routeLinks = {
    events: '/world/events',
    map: '/world/map',
    maplink: `/world/maplink${isTiledMode ? '2' : ''}`,
  };

  const getMenuComponent = (pathname: string) => {
    switch (pathname) {
      case routeLinks.map:
      case routeLinks.maplink:
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
        <WorlMapsEventDiv $showBorder={(location.pathname === routeLinks.map || location.pathname === routeLinks.maplink) && !isTiledMode}>
          <NavigationDatabaseItem path={routeLinks.map} label={t('maps')} activeForced={isMapPage} />
          <NavigationDatabaseItem path={routeLinks.events} label={t('events')} />
        </WorlMapsEventDiv>
        {(location.pathname === routeLinks.map || location.pathname === routeLinks.maplink) && !isTiledMode && (
          <NavigationDatabaseItem path={routeLinks.maplink} label={t('maplinks')} />
        )}
      </WorldBuildingNavigationStyle>

      {getMenuComponent(location.pathname)}
    </WorldNavigationStyle>
  );
};
