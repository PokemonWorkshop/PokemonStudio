import { Deletion } from '@components/deletion';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useGetEntityNameText } from '@utils/ReadingProjectText';
import { useTranslation } from 'react-i18next';
import { useZonePage } from '@src/hooks/usePage';
import { useUpdateZone } from './useUpdateZone';
import React, { forwardRef } from 'react';

type ZoneGroupsDeletionProps = {
  closeDialog: () => void;
};

/**
 * Component responsive of asking the user if they really want to delete the groups of a zone before doing so.
 */
export const ZoneGroupsDeletion = forwardRef<EditorHandlingClose, ZoneGroupsDeletionProps>(({ closeDialog }, ref) => {
  const { t } = useTranslation('database_zones');
  const { zone } = useZonePage();
  const updateZone = useUpdateZone(zone);
  const getZoneName = useGetEntityNameText();

  const onClickDelete = () => {
    updateZone({ wildGroups: [] });
    closeDialog();
  };

  useEditorHandlingClose(ref);

  return (
    <Deletion
      title={t('deletion_of_groups')}
      message={t('deletion_groups_message', { zone: getZoneName(zone) })}
      onClickDelete={onClickDelete}
      onClose={closeDialog}
    />
  );
});
ZoneGroupsDeletion.displayName = 'ZoneGroupsDeletion';
