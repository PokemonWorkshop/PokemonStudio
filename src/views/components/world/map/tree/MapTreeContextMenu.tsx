import React from 'react';
import { useTranslation } from 'react-i18next';
import CopyIcon from '@assets/icons/global/copy.svg';
import DeleteIcon from '@assets/icons/global/delete-icon.svg';
import EditIcon from '@assets/icons/global/edit-icon.svg';
import MapPaddedIcon from '@assets/icons/global/map-padded.svg';
import MapLinkIcon from '@assets/icons/global/map-link.svg';
import { MapDialogsRef } from '../editors/MapEditorOverlay';
import { useMapInfo } from '@hooks/useMapInfo';
import { mapInfoDuplicateMap, mapInfoRemoveFolder } from '@utils/MapInfoUtils';
import { StudioMapInfoFolder, StudioMapInfoMap, StudioMapInfoValue } from '@modelEntities/mapInfo';
import { useProjectMapLinks, useProjectMaps } from '@hooks/useProjectData';
import { createMapInfo, duplicateMap } from '@utils/entityCreation';
import { useGetEntityDescriptionText, useGetEntityNameText, useSetProjectText } from '@utils/ReadingProjectText';
import { MAP_DESCRIPTION_TEXT_ID, MAP_NAME_TEXT_ID } from '@modelEntities/map';
import { useOpenTiled } from '@hooks/useOpenTiled';
import { createMapLinkFromMainMapId } from '@utils/MapLinkUtils';
import { useNavigateMapLink } from '@hooks/useNavigateMapLink';

type MapTreeContextMenuProps = {
  mapInfoValue: StudioMapInfoValue;
  isDeleted: boolean;
  enableRename: () => void;
  dialogsRef: MapDialogsRef;
};

export const MapTreeContextMenu = ({ mapInfoValue, isDeleted, enableRename, dialogsRef }: MapTreeContextMenuProps) => {
  const { t } = useTranslation();
  const { mapInfo, setMapInfo } = useMapInfo();
  const { projectDataValues: maps, setProjectDataValues: setMap } = useProjectMaps();
  const { projectDataValues: mapLinks, setProjectDataValues: setMapLink } = useProjectMapLinks();
  const setText = useSetProjectText();
  const getName = useGetEntityNameText();
  const getDescription = useGetEntityDescriptionText();
  const openTiled = useOpenTiled();
  const navigateMapLink = useNavigateMapLink();
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
    const mapLink = createMapLinkFromMainMapId(mapLinks, newMap.id);
    setMapLink({ [mapLink.dbSymbol]: mapLink });
    setText(MAP_NAME_TEXT_ID, newMap.id, t('map_copy_name', { name: getName(mapToDuplicate) }));
    setText(MAP_DESCRIPTION_TEXT_ID, newMap.id, getDescription(mapToDuplicate));
    setMap({ [dbSymbol]: newMap }, { map: dbSymbol });
    setMapInfo(newMapInfo);
  };

  const onClickTiled = () => {
    if (mapInfoValue.data.klass !== 'MapInfoMap' || isDeleted) return;

    const tiledFilename = maps[mapInfoValue.data.mapDbSymbol]?.tiledFilename;
    if (tiledFilename) openTiled(tiledFilename, dialogsRef);
  };

  const onClickEditMapLinks = () => {
    if (mapInfoValue.data.klass !== 'MapInfoMap' || isDeleted) return;

    const map = maps[mapInfoValue.data.mapDbSymbol];
    navigateMapLink(map);
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
      {!isFolder && !isDeleted && !hideTiledOption && (
        <div onClick={onClickTiled}>
          <span className="icon">
            <MapPaddedIcon />
          </span>
          {t('open_with_tiled')}
        </div>
      )}
      {!isFolder && !isDeleted && (
        <div onClick={onClickEditMapLinks}>
          <span className="icon">
            <MapLinkIcon />
          </span>
          {t('edit_map_links')}
        </div>
      )}
      <div className="delete" onClick={onClickDelete}>
        <span className="icon">
          <DeleteIcon />
        </span>
        {t('delete')}
      </div>
    </>
  );
};
