import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { NavigationDatabaseStyle } from '@components/database/navigation/NavigationDatabase/NavigationDatabaseStyle';
import { NavigationDatabaseGroup } from '@components/database/navigation/NavigationDatabaseGroup';
import { NewFolderButtonOnlyIcon, SecondaryButtonWithPlusIcon } from '@components/buttons';
import { NavigationDatabaseGroupStyle } from '@components/database/navigation/NavigationDatabaseGroup/NavigationDatabaseGroupStyle';
import { useDialogsRef } from '@utils/useDialogsRef';
import { MapEditorAndDeletionKeys, MapEditorOverlay } from './editors/MapEditorOverlay';
import { useMapInfo } from '@utils/useMapInfo';
import { createMapInfo } from '@utils/entityCreation';
import { MAP_INFO_FOLDER_NAME_TEXT_ID, StudioMapInfoFolder } from '@modelEntities/mapInfo';
import { useSetProjectText } from '@utils/ReadingProjectText';
import { SeparatorGreyLine } from '@components/separators/SeparatorGreyLine';
import { MapTree } from './tree/MapTree';
import { addNewMapInfo } from '@utils/MapInfoUtils';
import { useToolTip } from '@utils/useToolTip';

const MapMenuContainer = styled(NavigationDatabaseStyle)`
  ${NavigationDatabaseGroupStyle} {
    gap: 8px;
  }
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
  const { mapInfo, isRMXPMode, setMapInfo } = useMapInfo();
  const setText = useSetProjectText();
  const { buildOnMouseEnter, onMouseLeave, renderToolTip } = useToolTip();
  const { t } = useTranslation(['world', 'database_maps']);

  const handleNewFolder = () => {
    const newFolder = createMapInfo(mapInfo, { klass: 'MapInfoFolder' }) as StudioMapInfoFolder;

    const newMapInfo = addNewMapInfo(mapInfo, newFolder);
    setText(MAP_INFO_FOLDER_NAME_TEXT_ID, newFolder.data.textId, t('database_maps:new_folder'));
    setMapInfo(newMapInfo);
  };

  return (
    <MapMenuContainer>
      <NavigationDatabaseGroup title={t('world:maps')}>
        <MapSubMenuContainer>
          <div className="buttons">
            <SecondaryButtonWithPlusIcon className="new" onClick={() => dialogsRef.current?.openDialog('new')} disabled={isRMXPMode}>
              {t('database_maps:new')}
            </SecondaryButtonWithPlusIcon>
            <NewFolderButtonOnlyIcon
              onClick={handleNewFolder}
              onMouseLeave={onMouseLeave}
              onMouseEnter={buildOnMouseEnter(t('database_maps:new_folder'), 'top-begin')}
              disabled={isRMXPMode}
            />
          </div>
          <SeparatorGreyLine />
          <MapTree />
        </MapSubMenuContainer>
      </NavigationDatabaseGroup>
      <MapEditorOverlay ref={dialogsRef} />
      {renderToolTip()}
    </MapMenuContainer>
  );
};
