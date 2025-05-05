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
  const { t } = useTranslation();
  const moveOptions = useSelectOptions('moves');
  const options = useMemo(
    () => [{ value: '__undef__', label: t('by_default') }, { value: '__remove__', label: t('none') }, ...moveOptions],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [moveOptions]
  );
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
