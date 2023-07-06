import { Deletion } from '@components/deletion';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { getEntityNameText } from '@utils/ReadingProjectText';
import { useProjectMaps } from '@utils/useProjectData';
import React, { forwardRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type MapDeletionProps = {
  closeDialog: () => void;
};

/**
 * Component responsive of asking the user if they really want to delete the map before doing so.
 */
export const MapDeletion = forwardRef<EditorHandlingClose, MapDeletionProps>(({ closeDialog }, ref) => {
  const { t } = useTranslation('database_maps');
  const { projectDataValues: maps, selectedDataIdentifier: dbSymbol, removeProjectDataValue: deleteMap, state } = useProjectMaps();
  const map = maps[dbSymbol];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const mapName = useMemo(() => getEntityNameText(map, state), []);

  const onClickDelete = () => {
    const firstDbSymbol = Object.entries(maps)
      .map(([value, mapData]) => ({ value, index: mapData.id }))
      .filter((d) => d.value !== dbSymbol)
      .sort((a, b) => a.index - b.index)[0]?.value;
    closeDialog();
    deleteMap(dbSymbol, { map: firstDbSymbol || '__undef__' });
  };

  useEditorHandlingClose(ref);

  return (
    <Deletion
      title={t('deletion_of', { map: mapName })}
      message={t('deletion_message', { map: mapName })}
      onClickDelete={onClickDelete}
      onClose={closeDialog}
    />
  );
});
MapDeletion.displayName = 'MapDeletion';
