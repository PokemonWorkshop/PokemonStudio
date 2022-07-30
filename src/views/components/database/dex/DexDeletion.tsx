import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Deletion } from '@components/deletion';
import { useProjectDex } from '@utils/useProjectData';

type DexDeletionProps = {
  type: 'dex' | 'list';
  onClose: () => void;
};

export const DexDeletion = ({ type, onClose }: DexDeletionProps) => {
  const {
    projectDataValues: allDex,
    selectedDataIdentifier: dexDbSymbol,
    setProjectDataValues: setDex,
    removeProjectDataValue: removeDex,
  } = useProjectDex();
  const { t } = useTranslation('database_dex');
  const dex = allDex[dexDbSymbol];
  const currentDex = useMemo(() => dex.clone(), [dex]);

  const onClickDelete = () => {
    if (type === 'dex') {
      const firstDbSymbol = Object.entries(allDex)
        .map(([value, dexData]) => ({ value, index: dexData.id }))
        .filter((d) => d.value !== dexDbSymbol)
        .sort((a, b) => a.index - b.index)[0].value;
      removeDex(dexDbSymbol, { dex: firstDbSymbol });
    } else if (type === 'list') {
      currentDex.creatures = [];
      setDex({ [dex.dbSymbol]: currentDex });
    }
    onClose();
  };

  return (
    <Deletion
      title={t(`${type}_deletion_of`)}
      message={t(`${type}_deletion_message`, { dex: dex.name().replaceAll(' ', '\u00a0') })}
      onClickDelete={onClickDelete}
      onClose={onClose}
    />
  );
};
