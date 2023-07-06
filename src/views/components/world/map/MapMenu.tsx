import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { NavigationDatabaseStyle } from '@components/database/navigation/NavigationDatabase/NavigationDatabaseStyle';
import { NavigationDatabaseGroup } from '@components/database/navigation/NavigationDatabaseGroup';
import { SecondaryButtonWithPlusIcon } from '@components/buttons';
import { NavigationDatabaseGroupStyle } from '@components/database/navigation/NavigationDatabaseGroup/NavigationDatabaseGroupStyle';
import { useDialogsRef } from '@utils/useDialogsRef';
import { MapEditorAndDeletionKeys, MapEditorOverlay } from './editors/MapEditorOverlay';
import { MapTree } from './tree/MapTree';

const MapMenuContainer = styled(NavigationDatabaseStyle)`
  height: 100vh;

  ${NavigationDatabaseGroupStyle} {
    gap: 8px;
  }
`;

const MapSubMenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Separator = styled.div`
  display: block;
  height: 1px;
  background-color: ${({ theme }) => theme.colors.dark20};
`;

export const MapMenu = () => {
  const dialogsRef = useDialogsRef<MapEditorAndDeletionKeys>();
  const { t } = useTranslation(['world', 'database_maps']);

  return (
    <MapMenuContainer>
      <NavigationDatabaseGroup title={t('world:maps')}>
        <MapSubMenuContainer>
          <SecondaryButtonWithPlusIcon onClick={() => dialogsRef.current?.openDialog('new')}>{t('database_maps:new')}</SecondaryButtonWithPlusIcon>
          <Separator />
          <MapTree />
        </MapSubMenuContainer>
      </NavigationDatabaseGroup>
      <MapEditorOverlay ref={dialogsRef} />
    </MapMenuContainer>
  );
};
