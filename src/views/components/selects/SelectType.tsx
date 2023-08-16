import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StudioDropDown } from '@components/StudioDropDown';
import { SelectContainerWithLabel } from './SelectContainerWithLabel';
import { useSelectOptions } from '@utils/useSelectOptions';

type SelectTypeProps = {
  dbSymbol: string;
  onChange: (dbSymbol: string) => void;
  undefValueOption?: string;
  noLabel?: boolean;
  noneValue?: boolean;
};

export const SelectType = ({ dbSymbol, onChange, noLabel, noneValue, undefValueOption }: SelectTypeProps) => {
  const { t } = useTranslation(['database_types', 'select']);
  const typeOptions = useSelectOptions('types');

  const options = useMemo(() => {
    if (undefValueOption) return [{ value: '__undef__', label: undefValueOption }, ...typeOptions];
    if (noneValue) return [{ value: '__undef__', label: t('select:none') }, ...typeOptions];
    return typeOptions;
  }, [undefValueOption, typeOptions, noneValue, t]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const optionals = useMemo(() => ({ deletedOption: t('database_types:type_deleted') }), []);

  if (noLabel) return <StudioDropDown value={dbSymbol} options={options} onChange={onChange} optionals={optionals} />;

  return (
    <SelectContainerWithLabel>
      <span>{t('database_types:title')}</span>
      <StudioDropDown value={dbSymbol} options={options} onChange={onChange} optionals={optionals} />
    </SelectContainerWithLabel>
  );
};
