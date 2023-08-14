import { Deletion } from '@components/deletion';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { mapInfoGetMapsFromMapDbSymbol, mapInfoRemoveMap } from '@utils/MapInfoUtils';
import { getSelectedMapDbSymbol } from '@utils/MapUtils';
import { getEntityNameText } from '@utils/ReadingProjectText';
import { useMapInfo } from '@utils/useMapInfo';
import { useProjectMaps } from '@utils/useProjectData';
import React, { forwardRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type MapDeletionProps = {
  closeDialog: () => void;
  dbSymbol?: DbSymbol;
};

/**
 * Component responsive of asking the user if they really want to delete the map before doing so.
 */
export const MapDeletion = forwardRef<EditorHandlingClose, MapDeletionProps>(({ closeDialog, dbSymbol }, ref) => {
  const { t } = useTranslation('database_maps');
  const { projectDataValues: maps, selectedDataIdentifier: currentDbSymbol, removeProjectDataValue: deleteMap, state } = useProjectMaps();
  const { mapInfoValues: mapInfo, setMapInfoValues: setMapInfo } = useMapInfo();
  const map = maps[dbSymbol || currentDbSymbol];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const mapName = useMemo(() => (map ? getEntityNameText(map, state) : t('map_deleted')), []);
  const mapDbSymbols = [
    dbSymbol || currentDbSymbol,
    ...mapInfoGetMapsFromMapDbSymbol(mapInfo, (dbSymbol || currentDbSymbol) as DbSymbol),
  ] as DbSymbol[];

  const deleteMaps = () => {
    const selectedMap = getSelectedMapDbSymbol(maps, mapDbSymbols, currentDbSymbol as DbSymbol);
    mapDbSymbols.forEach((dbSymbol) => deleteMap(dbSymbol, { map: selectedMap }));
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

  return <Deletion title={t('deletion_of')} message={t('deletion_message', { map: mapName })} onClickDelete={onClickDelete} onClose={closeDialog} />;
});
MapDeletion.displayName = 'MapDeletion';
