import { Deletion } from '@components/deletion';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { getEntityNameText } from '@utils/ReadingProjectText';
import { useProjectZones } from '@hooks/useProjectData';
import React, { forwardRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type ZoneDeletionProps = {
  closeDialog: () => void;
};

/**
 * Component responsive of asking the user if they really want to delete the zone before doing so.
 */
export const ZoneDeletion = forwardRef<EditorHandlingClose, ZoneDeletionProps>(({ closeDialog }, ref) => {
  const { t } = useTranslation('database_zones');
  const { projectDataValues: zones, selectedDataIdentifier: dbSymbol, removeProjectDataValue: deleteZone, state } = useProjectZones();
  const zone = zones[dbSymbol];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const zoneName = useMemo(() => getEntityNameText(zone, state), []);

  const onClickDelete = () => {
    const firstDbSymbol = Object.entries(zones)
      .map(([value, zoneData]) => ({ value, index: zoneData.id }))
      .filter((d) => d.value !== dbSymbol)
      .sort((a, b) => a.index - b.index)[0].value;
    closeDialog();
    deleteZone(dbSymbol, { zone: firstDbSymbol });
  };

  useEditorHandlingClose(ref);

  return (
    <Deletion title={t('deletion_of_zone')} message={t('deletion_message', { zone: zoneName })} onClickDelete={onClickDelete} onClose={closeDialog} />
  );
});
ZoneDeletion.displayName = 'ZoneDeletion';
