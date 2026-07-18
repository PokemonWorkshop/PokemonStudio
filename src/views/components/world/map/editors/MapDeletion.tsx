import { Deletion } from '@components/deletion';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { mapInfoGetMapsFromMapDbSymbol, mapInfoRemoveMap } from '@utils/MapInfoUtils';
import { getSelectedMapDbSymbol } from '@utils/MapUtils';
import { getEntityNameText } from '@utils/ReadingProjectText';
import { useMapInfo } from '@hooks/useMapInfo';
import { useProjectMapLinks, useProjectMaps } from '@hooks/useProjectData';
import { useGlobalState } from '@src/GlobalStateProvider';
import React, { forwardRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getMapLinkFirstDbSymbol, getMapLinksToDelete } from '@root/src/utils/MapLinkUtils';

type MapDeletionProps = {
  closeDialog: () => void;
  dbSymbol?: DbSymbol;
};

/**
 * Component responsive of asking the user if they really want to delete the map before doing so.
 */
export const MapDeletion = forwardRef<EditorHandlingClose, MapDeletionProps>(({ closeDialog, dbSymbol }, ref) => {
  const { t } = useTranslation();
  const { projectDataValues: maps, selectedDataIdentifier: currentDbSymbol, removeProjectDataValue: deleteMap, state } = useProjectMaps();
  const { projectDataValues: mapLinks, removeProjectDataValue: deleteMapLink } = useProjectMapLinks();
  const { mapInfo, setMapInfo } = useMapInfo();
  const [{ projectPath }] = useGlobalState();
  // Fork: offer to also delete the map's Data/Map###.rxdata (its events). Default
  // ON — otherwise a new map that reuses this id inherits the deleted map's events.
  const [deleteRxdata, setDeleteRxdata] = React.useState(true);
  const map = maps[dbSymbol || currentDbSymbol];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const mapName = useMemo(() => (map ? getEntityNameText(map, state) : t('map_deleted')), []);
  const mapDbSymbols = [
    dbSymbol || currentDbSymbol,
    ...mapInfoGetMapsFromMapDbSymbol(mapInfo, (dbSymbol || currentDbSymbol) as DbSymbol),
  ] as DbSymbol[];

  const deleteMaps = () => {
    // Capture the numeric ids BEFORE the entities are removed — the rxdata file
    // (Data/Map###.rxdata) is keyed by id, not dbSymbol.
    const mapIds = mapDbSymbols.map((s) => maps[s]?.id).filter((id): id is number => typeof id === 'number');
    const selectedMap = getSelectedMapDbSymbol(maps, mapDbSymbols, currentDbSymbol as DbSymbol);
    mapDbSymbols.forEach((dbSymbol) => deleteMap(dbSymbol, { map: selectedMap }));
    const mapLinksToDelete = getMapLinksToDelete(mapDbSymbols, maps, mapLinks);
    const selectedMapLink = getMapLinkFirstDbSymbol(mapLinks, mapLinksToDelete);
    mapLinksToDelete.forEach((dbSymbol) => deleteMapLink(dbSymbol, { mapLink: selectedMapLink }));
    // Fork: delete the events file(s) too, if the user opted in.
    if (deleteRxdata && projectPath) {
      mapIds.forEach((mapId) => window.api.deleteMapRxdata({ projectPath, mapId }, () => {}, () => {}));
    }
  };

  const onClickDelete = () => {
    if (!dbSymbol || dbSymbol === currentDbSymbol) {
      const mapInfoModified = mapInfoRemoveMap(mapInfo, currentDbSymbol as DbSymbol);
      setMapInfo(mapInfoModified);
      deleteMaps();
    } else {
      const mapInfoModified = mapInfoRemoveMap(mapInfo, dbSymbol);
      setMapInfo(mapInfoModified);
      deleteMaps();
    }
    closeDialog();
  };

  useEditorHandlingClose(ref);

  return (
    <Deletion
      title={t('deletion_of_map', { map: mapName })}
      message={t('deletion_message_map', { map: mapName })}
      onClickDelete={onClickDelete}
      onClose={closeDialog}
      extra={
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, cursor: 'pointer' }}>
          <input type="checkbox" checked={deleteRxdata} onChange={(e) => setDeleteRxdata(e.target.checked)} />
          {t('me_map_delete_rxdata')}
        </label>
      }
    />
  );
});
MapDeletion.displayName = 'MapDeletion';
