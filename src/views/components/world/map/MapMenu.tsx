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
import { useMapUpdate } from '@hooks/useMapUpdate';
import { useLoaderRef } from '@utils/loaderContext';
import { getSetting } from '@utils/settings';
import { showNotification } from '@utils/showNotification';
import theme from '@src/AppTheme';
import { createMapInfo } from '@utils/entityCreation';
import { addNewMapInfo, findMapInfoMap } from '@utils/MapInfoUtils';
import { useSetProjectText } from '@utils/ReadingProjectText';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { DbSymbol } from '../../../../models/entities/dbSymbol';
import { MapEditorAndDeletionKeys, MapEditorOverlay } from './editors/MapEditorOverlay';
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

/** Yellow-tinted variant of UpdateMapButton used when modified maps exist. */
const ModifiedUpdateMapButton = styled(UpdateMapButton)`
  background-color: ${theme.colors.warningSoft};
  border: 1px solid ${theme.colors.warningBase};
  &:hover { background-color: ${theme.colors.warningBase}; }
`;

export const MapMenu = () => {
  const dialogsRef = useDialogsRef<MapEditorAndDeletionKeys>();
  const { mapInfo, setMapInfo } = useMapInfo();
  const { selectedDataIdentifier: currentMap } = useProjectMaps();
  const { hasMapModified } = useMapPage();
  const mapUpdate = useMapUpdate();
  const loaderRef = useLoaderRef();
  const setText = useSetProjectText();
  const { t } = useTranslation();
  const tiledPathMissing = !getSetting('tiledPath');

  const handleUpdateAll = () => {
    if (!hasMapModified) {
      // No modifications — preserve old behavior of opening the full-update
      // confirmation dialog so the user can still trigger a force-rebuild.
      dialogsRef.current?.openDialog('full_update', true);
      return;
    }
    mapUpdate(
      { type: 'auto_detection' },
      () => {
        loaderRef.current.close();
        showNotification('success', t('update_maps'), t('update_maps_success'));
      },
      (error, genericError) => {
        if (error.length !== 0) {
          error.forEach((err) => window.api.log.error(`[Map update] ${err.filename}.tmx:`, err.errorMessage));
          loaderRef.current.setError('updating_maps_error', t('update_maps_error_convert'), true);
        } else {
          loaderRef.current.setError('updating_maps_error', genericError || t('update_maps_error_generic'), true);
        }
      },
    );
  };

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
            {hasMapModified ? (
              <ModifiedUpdateMapButton
                onClick={handleUpdateAll}
                disabled={tiledPathMissing}
                data-tooltip={tiledPathMissing ? t('map_process_disabled') : t('update_maps')}
              />
            ) : (
              <UpdateMapButton onClick={handleUpdateAll} data-tooltip={t('update_maps')} />
            )}
          </div>
          <SeparatorGreyLine />
          <MapTree />
        </MapSubMenuContainer>
      </NavigationDatabaseGroup>
      <MapEditorOverlay ref={dialogsRef} mapInfoValue={currentFolderInfo} />
    </MapMenuContainer>
  );
};
