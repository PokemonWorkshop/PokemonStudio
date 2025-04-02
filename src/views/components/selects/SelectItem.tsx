import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { OptionSourceKey, useSelectOptions } from '@hooks/useSelectOptions';
import { StudioDropDown } from '@components/StudioDropDown';
import { SelectContainerWithLabel } from './SelectContainerWithLabel';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { SelectOption } from '@ds/Select/types';
import { Select } from '@ds/Select';

type SelectItemProps = {
  dbSymbol: string;
  onChange: (dbSymbol: string) => void;
  undefValueOption?: string;
  noLabel?: boolean;
  noneValue?: boolean;
  klassFilter?: OptionSourceKey;
};

export const SelectItem = ({ dbSymbol, onChange, noLabel, noneValue, undefValueOption, klassFilter }: SelectItemProps) => {
  const { t } = useTranslation(['database_items', 'select']);
  const typeOptions = useSelectOptions(klassFilter || 'items');

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

type SelectItem2Props = {
  name: string;
  defaultValue?: DbSymbol;
  optionRef?: React.MutableRefObject<'__undef__' | DbSymbol | undefined>;
  onChange?: (v: DbSymbol) => void;
};

export const SelectItem2 = (props: SelectItem2Props) => {
  const { t } = useTranslation('database_items');
  const itemOptions = useSelectOptions('items') as SelectOption<DbSymbol>[];

  return <Select options={itemOptions} notFoundLabel={t('item_deleted')} chooseValue={itemOptions[0]?.value || '__undef__'} {...props} />;
};
