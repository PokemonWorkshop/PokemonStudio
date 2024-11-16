import { Deletion } from '@components/deletion';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { getEntityNameText } from '@utils/ReadingProjectText';
import { useProjectNatures } from '@hooks/useProjectData';
import React, { forwardRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type NatureDeletionProps = {
  closeDialog: () => void;
};

/**
 * Component responsive of asking the user if they really want to delete the nature before doing so.
 */
export const NatureDeletion = forwardRef<EditorHandlingClose, NatureDeletionProps>(({ closeDialog }, ref) => {
  const { t } = useTranslation('database_natures');
  const { projectDataValues: natures, selectedDataIdentifier: dbSymbol, removeProjectDataValue: deleteNature, state } = useProjectNatures();
  const nature = natures[dbSymbol];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const natureName = useMemo(() => getEntityNameText(nature, state), []);

  const onClickDelete = () => {
    const firstDbSymbol = Object.entries(natures)
      .map(([value, natureData]) => ({ value, name: getEntityNameText(natureData, state) }))
      .filter((d) => d.value !== dbSymbol)
      .sort((a, b) => a.name.localeCompare(b.name))[0].value;
    closeDialog();
    deleteNature(dbSymbol, { nature: firstDbSymbol });
  };

  useEditorHandlingClose(ref);

  return (
    <Deletion
      title={t('deletion_of', { nature: natureName })}
      message={t('deletion_message', { nature: natureName })}
      onClickDelete={onClickDelete}
      onClose={closeDialog}
    />
  );
});
NatureDeletion.displayName = 'NatureDeletion';
