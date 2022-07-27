import { SecondaryButtonWithPlusIcon } from '@components/buttons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { ControlBar } from '@components/ControlBar';
import DexModel from '@modelEntities/dex/Dex.model';
import { SelectDex } from '@components/selects';

type DexControlBarProps = {
  onChange: (selected: SelectOption) => void;
  dex: DexModel;
  onClickNewDex: () => void;
};

export const DexControlBar = ({ onChange, dex, onClickNewDex }: DexControlBarProps) => {
  const { t } = useTranslation('database_dex');

  return (
    <ControlBar>
      <SecondaryButtonWithPlusIcon onClick={onClickNewDex}>{t('new')}</SecondaryButtonWithPlusIcon>
      <SelectDex dbSymbol={dex.dbSymbol} onChange={onChange} />
    </ControlBar>
  );
};
