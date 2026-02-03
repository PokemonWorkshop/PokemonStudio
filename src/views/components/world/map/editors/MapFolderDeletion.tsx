import { Deletion } from '@components/deletion';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { StudioMapInfoFolder } from '@modelEntities/mapInfo';
import { mapInfoGetMapsFromMapInfoValue, mapInfoRemoveFolder } from '@utils/MapInfoUtils';
import { getSelectedMapDbSymbol } from '@utils/MapUtils';
import { getEntityNameTextUsingTextId } from '@utils/ReadingProjectText';
import { useMapInfo } from '@hooks/useMapInfo';
import { useProjectMapLinks, useProjectMaps } from '@hooks/useProjectData';
import { useTranslation } from 'react-i18next';
import { getMapLinkFirstDbSymbol, getMapLinksToDelete } from '@utils/MapLinkUtils';
import React, { forwardRef, useMemo } from 'react';

type MapFolderDeletionProps = {
  closeDialog: () => void;
  mapInfoFolder: StudioMapInfoFolder;
};

/**
 * Component responsive of asking the user if they really want to delete all the map of a folder before doing so.
 */
export const MapFolderDeletion = forwardRef<EditorHandlingClose, MapFolderDeletionProps>(({ closeDialog, mapInfoFolder }, ref) => {
  const { t } = useTranslation();
  const {
    projectDataValues: maps,
    selectedDataIdentifier: currentDbSymbol,
    setSelectedDataIdentifier: setSelectedMap,
    removeProjectDataValue: deleteMap,
    state,
  } = useProjectMaps();
  const { projectDataValues: mapLinks, removeProjectDataValue: deleteMapLink } = useProjectMapLinks();
  const { mapInfo, setMapInfo } = useMapInfo();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const folderName = useMemo(() => getEntityNameTextUsingTextId(mapInfoFolder.data, state), []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const mapDbSymbols = useMemo(() => mapInfoGetMapsFromMapInfoValue(mapInfo, mapInfoFolder), []);

  const onClickDelete = () => {
    mapDbSymbols.forEach((dbSymbol) => deleteMap(dbSymbol, { map: '__undef__' }));
    const mapLinksToDelete = getMapLinksToDelete(mapDbSymbols, maps, mapLinks);
    const selectedMapLink = getMapLinkFirstDbSymbol(mapLinks, mapLinksToDelete);
    const mapInfoModified = mapInfoRemoveFolder(mapInfo, mapInfoFolder);
    mapLinksToDelete.forEach((dbSymbol) => deleteMapLink(dbSymbol, { mapLink: selectedMapLink }));
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
