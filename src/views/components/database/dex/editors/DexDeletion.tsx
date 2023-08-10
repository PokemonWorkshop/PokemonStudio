import { Deletion } from '@components/deletion';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useGetEntityNameUsingCSV } from '@utils/ReadingProjectText';
import { cloneEntity } from '@utils/cloneEntity';
import { useProjectDex } from '@utils/useProjectData';
import React, { forwardRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useUpdateDex } from './useUpdateDex';

type DexDeletionProps = {
  type: 'dex' | 'list';
  onClose: () => void;
};

/**
 * Component responsive of asking the user if they really want to delete the move before doing so.
 */
export const DexDeletion = forwardRef<EditorHandlingClose, DexDeletionProps>(({ type, onClose }, ref) => {
  const { t } = useTranslation('database_dex');
  const { projectDataValues: allDex, selectedDataIdentifier: dexDbSymbol, removeProjectDataValue: removeDex } = useProjectDex();
  const getDexName = useGetEntityNameUsingCSV();
  const dex = allDex[dexDbSymbol];
  const currentDex = useMemo(() => cloneEntity(dex), [dex]);
  const updateDex = useUpdateDex(dex);

  const onClickDelete = () => {
    if (type === 'dex') {
      const firstDbSymbol = Object.entries(allDex)
        .map(([value, dexData]) => ({ value, index: dexData.id }))
        .filter((d) => d.value !== dexDbSymbol)
        .sort((a, b) => a.index - b.index)[0].value;
      removeDex(dexDbSymbol, { dex: firstDbSymbol });
    } else if (type === 'list') {
      currentDex.creatures = [];
      updateDex(currentDex);
    }
    onClose();
  };

  useEditorHandlingClose(ref);

  return (
    <Deletion
      title={t('list_deletion_of')}
      message={t('list_deletion_message', { dex: getDexName(dex).replaceAll(' ', '\u00a0') })}
      onClickDelete={onClickDelete}
      onClose={onClose}
    />
  );
});
DexDeletion.displayName = 'DexDeletion';
