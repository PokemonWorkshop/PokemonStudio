import { NewFolderButtonOnlyIcon, SecondaryButtonWithPlusIcon } from '@components/buttons';
import { UpdateMapButton } from '@components/buttons/UpdateMapButton';
import { NavigationDatabaseStyle } from '@components/database/navigation/NavigationDatabase/NavigationDatabaseStyle';
import { NavigationDatabaseGroup } from '@components/database/navigation/NavigationDatabaseGroup';
import { NavigationDatabaseGroupStyle } from '@components/database/navigation/NavigationDatabaseGroup/NavigationDatabaseGroupStyle';
import { SeparatorGreyLine } from '@components/separators/SeparatorGreyLine';
import { useDialogsRef } from '@hooks/useDialogsRef';
import { useMapInfo } from '@hooks/useMapInfo';
import { useProjectMaps } from '@hooks/useProjectData';
import { MAP_INFO_FOLDER_NAME_TEXT_ID, StudioMapInfoFolder } from '@modelEntities/mapInfo';
import { useMapPage } from '@root/src/hooks/usePage';
import { createMapInfo } from '@utils/entityCreation';
import { addNewMapInfo, findMapInfoMap } from '@utils/MapInfoUtils';
import { useSetProjectText } from '@utils/ReadingProjectText';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { DbSymbol } from '../../../../models/entities/dbSymbol';
import { MapEditorAndDeletionKeys, MapEditorOverlay } from './editors/MapEditorOverlay';
import { MapUpdate } from './MapUpdate';
import { MapTree } from './tree/MapTree';

const MapMenuContainer = styled(NavigationDatabaseStyle)`
  ${NavigationDatabaseGroupStyle} {
    gap: 8px;
  }
  height: 100vh;
`;

const MapSubMenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  .buttons {
    display: flex;
    gap: 8px;

    .new {
      width: 100%;
    }
  }
`;

export const MapMenu = () => {
  const dialogsRef = useDialogsRef<MapEditorAndDeletionKeys>();
  const { mapInfo, setMapInfo } = useMapInfo();
  const { selectedDataIdentifier: currentMap } = useProjectMaps();
  const { hasMapModified } = useMapPage();
  const setText = useSetProjectText();
  const { t } = useTranslation();

  const currentMapInfo = currentMap ? findMapInfoMap(mapInfo, currentMap as DbSymbol) : undefined;
  const currentFolderInfo = currentMapInfo?.data.parentId && currentMapInfo.data.parentId !== 0 ? mapInfo[currentMapInfo.data.parentId] : undefined;

  const handleNewFolder = () => {
    const newFolder = createMapInfo(mapInfo, { klass: 'MapInfoFolder' }) as StudioMapInfoFolder;

    const newMapInfo = addNewMapInfo(mapInfo, newFolder);
    setText(MAP_INFO_FOLDER_NAME_TEXT_ID, newFolder.data.textId, t('new_folder'));
    setMapInfo(newMapInfo);
  };

  return (
    <MapMenuContainer>
      <NavigationDatabaseGroup title={t('maps')}>
        <MapSubMenuContainer>
          <div className="buttons">
            <SecondaryButtonWithPlusIcon className="new" onClick={() => dialogsRef.current?.openDialog('new')}>
              {t('new_map')}
            </SecondaryButtonWithPlusIcon>
            <NewFolderButtonOnlyIcon onClick={handleNewFolder} data-tooltip={t('new_folder')} />
            <UpdateMapButton onClick={() => dialogsRef.current?.openDialog('full_update', true)} data-tooltip={t('update_maps')} />
          </div>
          <SeparatorGreyLine />
          <MapTree />
          {hasMapModified && <MapUpdate />}
        </MapSubMenuContainer>
      </NavigationDatabaseGroup>
      <MapEditorOverlay ref={dialogsRef} mapInfoValue={currentFolderInfo} />
    </MapMenuContainer>
  );
};
