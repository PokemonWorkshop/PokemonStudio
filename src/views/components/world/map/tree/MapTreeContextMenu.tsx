import React from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as CopyIcon } from '@assets/icons/global/copy.svg';
import { ReactComponent as DeleteIcon } from '@assets/icons/global/delete-icon.svg';
import { ReactComponent as EditIcon } from '@assets/icons/global/edit-icon.svg';
import { MapDialogsRef } from '../editors/MapEditorOverlay';
import { useMapInfo } from '@utils/useMapInfo';
import { mapInfoDuplicateMap, mapInfoRemoveFolder } from '@utils/MapInfoUtils';
import { StudioMapInfo, StudioMapInfoMap } from '@modelEntities/mapInfo';
import { useProjectMaps } from '@utils/useProjectData';
import { createMapInfo, duplicateMap } from '@utils/entityCreation';
import { useGetEntityDescriptionText, useGetEntityNameText, useSetProjectText } from '@utils/ReadingProjectText';
import { MAP_DESCRIPTION_TEXT_ID, MAP_NAME_TEXT_ID } from '@modelEntities/map';

type MapTreeContextMenuProps = {
  mapInfo: StudioMapInfo;
  isDeleted: boolean;
  enableRename: () => void;
  dialogsRef?: MapDialogsRef;
};

export const MapTreeContextMenu = ({ mapInfo, isDeleted, enableRename, dialogsRef }: MapTreeContextMenuProps) => {
  const { t } = useTranslation('database_maps');
  const { mapInfoValues: mapInfoValues, setMapInfoValues: setMapInfo } = useMapInfo();
  const { projectDataValues: maps, setProjectDataValues: setMap } = useProjectMaps();
  const setText = useSetProjectText();
  const getName = useGetEntityNameText();
  const getDescription = useGetEntityDescriptionText();

  const isFolder = mapInfo.klass === 'MapInfoFolder';
  const onClickDelete = () => {
    if (isFolder) {
      if (mapInfo.children.length === 0) {
        setMapInfo(mapInfoRemoveFolder(mapInfoValues, mapInfo));
      } else {
        dialogsRef?.current?.openDialog('deletion_folder', true);
      }
    } else {
      dialogsRef?.current?.openDialog('deletion', true);
    }
  };

  const onClickDuplicate = () => {
    if (isFolder || isDeleted) return;

    const mapToDuplicate = maps[mapInfo.mapDbSymbol];
    const newMap = duplicateMap(maps, mapToDuplicate);
    const dbSymbol = newMap.dbSymbol;
    const newMapInfoMap = createMapInfo(mapInfoValues, { klass: 'MapInfoMap', mapDbSymbol: dbSymbol }) as StudioMapInfoMap;
    const newMapInfo = mapInfoDuplicateMap(mapInfoValues, mapInfo.mapDbSymbol, newMapInfoMap);
    setText(MAP_NAME_TEXT_ID, newMap.id, t('map_copy_name', { name: getName(mapToDuplicate) }));
    setText(MAP_DESCRIPTION_TEXT_ID, newMap.id, getDescription(mapToDuplicate));
    setMap({ [dbSymbol]: newMap }, { map: dbSymbol });
    setMapInfo(newMapInfo);
  };

  return (
    <>
      {!isDeleted && (
        <div onClick={() => enableRename()}>
          <span className="icon">
            <EditIcon />
          </span>
          {t('rename')}
        </div>
      )}
      {!isFolder && !isDeleted && (
        <div onClick={onClickDuplicate}>
          <span className="icon">
            <CopyIcon />
          </span>
          {t('duplicate')}
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
