import React from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as CopyIcon } from '@assets/icons/global/copy.svg';
import { ReactComponent as DeleteIcon } from '@assets/icons/global/delete-icon.svg';
import { ReactComponent as EditIcon } from '@assets/icons/global/edit-icon.svg';
import { ReactComponent as MapPaddedIcon } from '@assets/icons/global/map-padded.svg';
import { MapDialogsRef } from '../editors/MapEditorOverlay';
import { useMapInfo } from '@utils/useMapInfo';
import { mapInfoDuplicateMap, mapInfoRemoveFolder } from '@utils/MapInfoUtils';
import { StudioMapInfoFolder, StudioMapInfoMap, StudioMapInfoValue } from '@modelEntities/mapInfo';
import { useProjectMaps } from '@utils/useProjectData';
import { createMapInfo, duplicateMap } from '@utils/entityCreation';
import { useGetEntityDescriptionText, useGetEntityNameText, useSetProjectText } from '@utils/ReadingProjectText';
import { MAP_DESCRIPTION_TEXT_ID, MAP_NAME_TEXT_ID } from '@modelEntities/map';
import { useOpenTiled } from '@utils/useOpenTiled';

type MapTreeContextMenuProps = {
  mapInfoValue: StudioMapInfoValue;
  isDeleted: boolean;
  enableRename: () => void;
  dialogsRef: MapDialogsRef;
};

export const MapTreeContextMenu = ({ mapInfoValue, isDeleted, enableRename, dialogsRef }: MapTreeContextMenuProps) => {
  const { t } = useTranslation('database_maps');
  const { mapInfo, isRMXPMode, setMapInfo } = useMapInfo();
  const { projectDataValues: maps, setProjectDataValues: setMap } = useProjectMaps();
  const setText = useSetProjectText();
  const getName = useGetEntityNameText();
  const getDescription = useGetEntityDescriptionText();
  const openTiled = useOpenTiled();
  const hideTiledOption = mapInfoValue.data.klass === 'MapInfoMap' ? !maps[mapInfoValue.data.mapDbSymbol]?.tiledFilename : true || isDeleted;

  const isFolder = mapInfoValue.data.klass === 'MapInfoFolder';
  const onClickDelete = () => {
    if (isFolder) {
      if (mapInfoValue.children.length === 0) {
        setMapInfo(mapInfoRemoveFolder(mapInfo, mapInfoValue as StudioMapInfoFolder));
      } else {
        dialogsRef?.current?.openDialog('deletion_folder', true);
      }
    } else {
      dialogsRef?.current?.openDialog('deletion', true);
    }
  };

  const onClickDuplicate = () => {
    if (mapInfoValue.data.klass !== 'MapInfoMap' || isDeleted) return;

    const mapToDuplicate = maps[mapInfoValue.data.mapDbSymbol];
    const newMap = duplicateMap(maps, mapToDuplicate);
    const dbSymbol = newMap.dbSymbol;
    const newMapInfoMap = createMapInfo(mapInfo, {
      klass: 'MapInfoMap',
      mapDbSymbol: dbSymbol,
      parentId: mapInfoValue.data.parentId,
    }) as StudioMapInfoMap;
    const newMapInfo = mapInfoDuplicateMap(mapInfo, mapInfoValue.data.mapDbSymbol, newMapInfoMap);
    setText(MAP_NAME_TEXT_ID, newMap.id, t('map_copy_name', { name: getName(mapToDuplicate) }));
    setText(MAP_DESCRIPTION_TEXT_ID, newMap.id, getDescription(mapToDuplicate));
    setMap({ [dbSymbol]: newMap }, { map: dbSymbol });
    setMapInfo(newMapInfo);
  };

  const onClickTiled = () => {
    if (mapInfoValue.data.klass !== 'MapInfoMap' || isDeleted) return;

    const tiledFilename = maps[mapInfoValue.data.mapDbSymbol]?.tiledFilename;
    tiledFilename && openTiled(tiledFilename, dialogsRef);
  };

  return (
    <>
      {!isDeleted && !isRMXPMode && (
        <div onClick={() => enableRename()}>
          <span className="icon">
            <EditIcon />
          </span>
          {t('rename')}
        </div>
      )}
      {!isFolder && !isDeleted && !isRMXPMode && (
        <div onClick={onClickDuplicate}>
          <span className="icon">
            <CopyIcon />
          </span>
          {t('duplicate')}
        </div>
      )}
      {!isFolder && !isDeleted && !isRMXPMode && !hideTiledOption && (
        <div onClick={onClickTiled}>
          <span className="icon">
            <MapPaddedIcon />
          </span>
          {t('open_with_tiled')}
        </div>
      )}
      <div className="delete" onClick={onClickDelete}>
        <span className="icon">
          <DeleteIcon />
        </span>
        {t('context_menu_delete')}
      </div>
    </>
  );
};
