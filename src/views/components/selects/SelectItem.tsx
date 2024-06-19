import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelectOptions } from '@hooks/useSelectOptions';
import { StudioDropDown } from '@components/StudioDropDown';
import { SelectContainerWithLabel } from './SelectContainerWithLabel';

type SelectItemProps = {
  dbSymbol: string;
  onChange: (dbSymbol: string) => void;
  undefValueOption?: string;
  noLabel?: boolean;
  noneValue?: boolean;
};

export const SelectItem = ({ dbSymbol, onChange, noLabel, noneValue, undefValueOption }: SelectItemProps) => {
  const { t } = useTranslation(['database_items', 'select']);
  const typeOptions = useSelectOptions('items');

  const options = useMemo(() => {
    if (undefValueOption) return [{ value: '__undef__', label: undefValueOption }, ...typeOptions];
    if (noneValue) return [{ value: '__undef__', label: t('select:none') }, ...typeOptions];
    return typeOptions;
  }, [undefValueOption, typeOptions, noneValue, t]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const optionals = useMemo(() => ({ deletedOption: t('database_items:no_option') }), []);

  if (noLabel) return <StudioDropDown value={dbSymbol} options={options} onChange={onChange} optionals={optionals} />;

  return (
    <SelectContainerWithLabel>
      <span>{t('database_items:item')}</span>
      <StudioDropDown value={dbSymbol} options={options} onChange={onChange} optionals={optionals} />
    </SelectContainerWithLabel>
  );
};
