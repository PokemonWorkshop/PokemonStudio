import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelectOptions } from '@hooks/useSelectOptions';
import { StudioDropDown } from '@components/StudioDropDown';
import { SelectContainerWithLabel } from './SelectContainerWithLabel';

type SelectMoveProps = {
  dbSymbol: string;
  onChange: (dbSymbol: string) => void;
  undefValueOption?: string;
  noLabel?: boolean;
};

export const SelectMove = ({ dbSymbol, onChange, noLabel, undefValueOption }: SelectMoveProps) => {
  const { t } = useTranslation('database_moves');
  const moveOptions = useSelectOptions('moves');
  const options = useMemo(() => {
    if (undefValueOption) return [{ value: '__undef__', label: undefValueOption }, ...moveOptions];
    return moveOptions;
  }, [moveOptions, undefValueOption]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const optionals = useMemo(() => ({ deletedOption: t('move_deleted') }), []);

  if (noLabel) return <StudioDropDown value={dbSymbol} options={options} onChange={onChange} optionals={optionals} />;

  return (
    <SelectContainerWithLabel>
      <span>{t('move')}</span>
      <StudioDropDown value={dbSymbol} options={options} onChange={onChange} optionals={optionals} />
    </SelectContainerWithLabel>
  );
};
