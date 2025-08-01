import { Deletion } from '@components/deletion';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { getEntityNameText } from '@utils/ReadingProjectText';
import { useProjectMapLinks, useProjectMaps } from '@hooks/useProjectData';
import { useTranslation } from 'react-i18next';
import React, { forwardRef, useMemo } from 'react';

type MapLinkDeletionProps = {
  closeDialog: () => void;
};

/**
 * Component responsive of asking the user if they really want to delete the map link before doing so.
 */
export const MapLinkDeletion = forwardRef<EditorHandlingClose, MapLinkDeletionProps>(({ closeDialog }, ref) => {
  const { t } = useTranslation();
  const { projectDataValues: mapLinks, selectedDataIdentifier: dbSymbol, removeProjectDataValue: deleteMapLink, state } = useProjectMapLinks();
  const { projectDataValues: maps } = useProjectMaps();
  const mapLink = mapLinks[dbSymbol];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const map = useMemo(() => Object.values(maps).find((map) => map.id === mapLink.mapId), [maps]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const mapLinkName = useMemo(() => (map ? getEntityNameText(map, state) : t('map_deleted')), []);

  const onClickDelete = () => {
    const firstDbSymbol = Object.entries(mapLinks)
      .map(([value, mapLinkData]) => ({ value, index: mapLinkData.id }))
      .filter((d) => d.value !== dbSymbol)
      .sort((a, b) => a.index - b.index)[0].value;
    deleteMapLink(dbSymbol, { mapLink: firstDbSymbol });
    closeDialog();
  };

  useEditorHandlingClose(ref);

  return (
    <Deletion
      title={t('deletion_of_maplink', { mapLink: mapLinkName })}
      message={t('deletion_message_maplink', { mapLink: mapLinkName })}
      onClickDelete={onClickDelete}
      onClose={closeDialog}
    />
  );
});
MapLinkDeletion.displayName = 'MapLinkDeletion';
