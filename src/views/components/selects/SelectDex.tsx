import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelectOptions } from '@utils/useSelectOptions';
import { StudioDropDown } from '@components/StudioDropDown';
import { SelectContainerWithLabel } from './SelectContainerWithLabel';

type SelectDexProps = {
  dbSymbol: string;
  onChange: (dbSymbol: string) => void;
  undefValueOption?: string;
  noLabel?: boolean;
  noneValue?: boolean;
};

export const SelectDex = ({ dbSymbol, onChange, noLabel, noneValue, undefValueOption }: SelectDexProps) => {
  const { t } = useTranslation(['database_dex', 'select']);
  const dexOptions = useSelectOptions('dex');
  const options = useMemo(() => {
    if (undefValueOption) return [{ value: '__undef__', label: undefValueOption }, ...dexOptions];
    if (noneValue) return [{ value: '__undef__', label: t('select:none') }, ...dexOptions];
    return dexOptions;
  }, [dexOptions, undefValueOption, noneValue]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const optionals = useMemo(() => ({ deletedOption: t('database_dex:dex_deleted') }), []);

  if (noLabel) return <StudioDropDown value={dbSymbol} options={options} onChange={onChange} optionals={optionals} />;

  return (
    <SelectContainerWithLabel>
      <span>{t('database_dex:dex')}</span>
      <StudioDropDown value={dbSymbol} options={options} onChange={onChange} optionals={optionals} />
    </SelectContainerWithLabel>
  );
};
