import { Deletion } from '@components/deletion';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { StudioMapInfoFolder } from '@modelEntities/mapInfo';
import { mapInfoGetMapsFromFolder, mapInfoRemoveFolder } from '@utils/MapInfoUtils';
import { getSelectedMapDbSymbol } from '@utils/MapUtils';
import { getEntityNameTextUsingTextId } from '@utils/ReadingProjectText';
import { useMapInfo } from '@utils/useMapInfo';
import { useProjectMaps } from '@utils/useProjectData';
import React, { forwardRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type MapFolderDeletionProps = {
  closeDialog: () => void;
  mapInfoFolder: StudioMapInfoFolder;
};

/**
 * Component responsive of asking the user if they really want to delete all the map of a folder before doing so.
 */
export const MapFolderDeletion = forwardRef<EditorHandlingClose, MapFolderDeletionProps>(({ closeDialog, mapInfoFolder }, ref) => {
  const { t } = useTranslation('database_maps');
  const {
    projectDataValues: maps,
    selectedDataIdentifier: currentDbSymbol,
    setSelectedDataIdentifier: setSelectedMap,
    removeProjectDataValue: deleteMap,
    state,
  } = useProjectMaps();
  const { mapInfoValues: mapInfo, setMapInfoValues: setMapInfo } = useMapInfo();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const folderName = useMemo(() => getEntityNameTextUsingTextId(mapInfoFolder, state), []);
  const mapDbSymbols = mapInfoGetMapsFromFolder(mapInfoFolder);

  const onClickDelete = () => {
    mapDbSymbols.forEach((dbSymbol) => deleteMap(dbSymbol, { map: '__undef__' }));
    const mapInfoModified = mapInfoRemoveFolder(mapInfo, mapInfoFolder);
    setMapInfo(mapInfoModified);
    setSelectedMap({ map: getSelectedMapDbSymbol(maps, mapDbSymbols, currentDbSymbol as DbSymbol) });
    closeDialog();
  };

  useEditorHandlingClose(ref);

  return (
    <Deletion
      title={t('deletion_folder_of', { folder: folderName })}
      message={t('deletion_folder_message', { folder: folderName })}
      onClickDelete={onClickDelete}
      onClose={closeDialog}
    />
  );
});
MapFolderDeletion.displayName = 'MapFolderDeletion';
