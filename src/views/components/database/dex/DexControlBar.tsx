import { SecondaryButtonWithPlusIcon } from '@components/buttons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SelectChangeEvent } from '@components/SelectCustom/SelectCustomPropsInterface';
import { ControlBar } from '@components/ControlBar';
import { SelectDex } from '@components/selects';
import { StudioDex } from '@modelEntities/dex';
import { useSetCurrentDatabasePath } from '@utils/useSetCurrentDatabasePage';

type DexControlBarProps = {
  onChange: SelectChangeEvent;
  dex: StudioDex;
  onClickNewDex: () => void;
};

export const DexControlBar = ({ onChange, dex, onClickNewDex }: DexControlBarProps) => {
  const { t } = useTranslation('database_dex');
  useSetCurrentDatabasePath();

  return (
    <ControlBar>
      <SecondaryButtonWithPlusIcon onClick={onClickNewDex}>{t('new')}</SecondaryButtonWithPlusIcon>
      <SelectDex dbSymbol={dex.dbSymbol} onChange={onChange} />
    </ControlBar>
  );
};
