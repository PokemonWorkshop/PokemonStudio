import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { NavigationDatabaseStyle } from '@components/database/navigation/NavigationDatabase/NavigationDatabaseStyle';
import { NavigationDatabaseGroup } from '@components/database/navigation/NavigationDatabaseGroup';
import { NavigationDatabaseItem } from '@components/database/navigation/NavigationDatabaseItem';
import { MapMenu } from './map';

const WorldNavigationStyle = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  gap: 2px;
  min-width: 238px;
`;

const WorldBuildingNavigationStyle = styled(NavigationDatabaseStyle)`
  padding-bottom: 16px;
`;

export const WorldNavigation = () => {
  const { t } = useTranslation('world');
  return (
    <WorldNavigationStyle>
      <WorldBuildingNavigationStyle>
        <NavigationDatabaseGroup title={t('world_building')}>
          <NavigationDatabaseItem path="/world/maplink" label={t('maplinks')} />
          {/*<NavigationDatabaseItem path="/world/region" label={t('regions')} />*/}
        </NavigationDatabaseGroup>
      </WorldBuildingNavigationStyle>
      <MapMenu />
    </WorldNavigationStyle>
  );
};
