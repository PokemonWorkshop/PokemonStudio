import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { NavigationDatabaseStyle } from '@components/database/navigation/NavigationDatabase/NavigationDatabaseStyle';
import { NavigationDatabaseItem } from '@components/database/navigation/NavigationDatabaseItem';
import { MapMenu } from './map';
import { useLocation } from 'react-router-dom/dist';
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

export const WorldNavigation = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const getMenuComponent = (pathname: string) => {
    switch (pathname) {
      case '/world/map':
        return <MapMenu />;
      case '/world/maplinks':
        return <MapMenu />;
      case '/world/events':
        return <EventMenu />;
      default:
        return <MapMenu />;
    }
  };

  return (
    <WorldNavigationStyle>
      <WorldBuildingNavigationStyle>
        <WorlMapsEventDiv>
          <NavigationDatabaseItem path="/world/map" label={t('maps')} />
          <NavigationDatabaseItem path="/world/events" label={t('events')} />
        </WorlMapsEventDiv>
        <NavigationDatabaseItem path="/world/maplinks" label={t('maplinks')} />
        {/*<NavigationDatabaseItem path="/world/region" label={t('regions')} />*/}
      </WorldBuildingNavigationStyle>

      {getMenuComponent(location.pathname)}
    </WorldNavigationStyle>
  );
};
