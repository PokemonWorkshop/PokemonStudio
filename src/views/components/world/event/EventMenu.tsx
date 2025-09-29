import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { NavigationDatabaseStyle } from '@components/database/navigation/NavigationDatabase/NavigationDatabaseStyle';
import { NavigationDatabaseGroup } from '@components/database/navigation/NavigationDatabaseGroup';
import { NewFolderButtonOnlyIcon, SecondaryButtonWithPlusIcon } from '@components/buttons';
import { NavigationDatabaseGroupStyle } from '@components/database/navigation/NavigationDatabaseGroup/NavigationDatabaseGroupStyle';
import { useDialogsRef } from '@hooks/useDialogsRef';
import { useMapInfo } from '@hooks/useMapInfo';
import { createMapInfo } from '@utils/entityCreation';
import { MAP_INFO_FOLDER_NAME_TEXT_ID, StudioMapInfoFolder } from '@modelEntities/mapInfo';
import { useSetProjectText } from '@utils/ReadingProjectText';
import { SeparatorGreyLine } from '@components/separators/SeparatorGreyLine';
import { addNewMapInfo } from '@utils/MapInfoUtils';
import { MapEditorAndDeletionKeys } from '../map/editors/MapEditorOverlay';
import { EventTree } from './EventTree';

const EventMenuContainer = styled(NavigationDatabaseStyle)`
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

export const EventMenu = () => {
  const dialogsRef = useDialogsRef<MapEditorAndDeletionKeys>();
  const { mapInfo, isRMXPMode, setMapInfo } = useMapInfo();
  const setText = useSetProjectText();
  const { t } = useTranslation();

  // TODO: Replace MapInfo by EventInfo. Actually, handleNewFolder creates a MapInfoFolder.
  const handleNewFolder = () => {
    const newFolder = createMapInfo(mapInfo, { klass: 'MapInfoFolder' }) as StudioMapInfoFolder;

    const newMapInfo = addNewMapInfo(mapInfo, newFolder);
    setText(MAP_INFO_FOLDER_NAME_TEXT_ID, newFolder.data.textId, t('new_folder'));
    setMapInfo(newMapInfo);
  };

  // TODO: Remove isDev condition once events tree is finished.
  return (
    <EventMenuContainer>
      <NavigationDatabaseGroup title={t('events')}>
        <MapSubMenuContainer>
          <div className="buttons">
            <SecondaryButtonWithPlusIcon className="new" onClick={() => dialogsRef.current?.openDialog('new')} disabled={!window.api.isDev}>
              {t('new_event')}
            </SecondaryButtonWithPlusIcon>
            <NewFolderButtonOnlyIcon onClick={handleNewFolder} data-tooltip={t('new_folder')} disabled={!window.api.isDev} />
          </div>
          <SeparatorGreyLine />
          <EventTree />
        </MapSubMenuContainer>
      </NavigationDatabaseGroup>
    </EventMenuContainer>
  );
};
