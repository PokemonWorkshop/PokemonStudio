import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelectOptions } from '@hooks/useSelectOptions';
import { StudioDropDown } from '@components/StudioDropDown';
import { SelectContainerWithLabel } from './SelectContainerWithLabel';

type SelectMoveBattlerProps = {
  dbSymbol: string;
  onChange: (dbSymbol: string) => void;
  noLabel: boolean;
};

export const SelectMoveBattler = ({ dbSymbol, onChange, noLabel }: SelectMoveBattlerProps) => {
  const { t } = useTranslation(['database_moves', 'pokemon_battler_list']);
  const moveOptions = useSelectOptions('moves');
  const options = useMemo(
    () => [
      { value: '__undef__', label: t('pokemon_battler_list:by_default') },
      { value: '__remove__', label: t('pokemon_battler_list:none') },
      ...moveOptions,
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [moveOptions]
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const optionals = useMemo(() => ({ deletedOption: t('database_moves:move_deleted') }), []);

  if (noLabel) return <StudioDropDown value={dbSymbol} options={options} onChange={onChange} optionals={optionals} />;

  return (
    <SelectContainerWithLabel>
      <span>{t('database_moves:move')}</span>
      <StudioDropDown value={dbSymbol} options={options} onChange={onChange} optionals={optionals} />
    </SelectContainerWithLabel>
  );
};
