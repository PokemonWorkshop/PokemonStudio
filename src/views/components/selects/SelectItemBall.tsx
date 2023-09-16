import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelectOptions } from '@utils/useSelectOptions';
import { StudioDropDown } from '@components/StudioDropDown';
import { SelectContainerWithLabel } from './SelectContainerWithLabel';

type SelectItemBallProps = {
  dbSymbol: string;
  onChange: (dbSymbol: string) => void;
  undefValueOption?: string;
  noLabel?: boolean;
};

export const SelectItemBall = ({ dbSymbol, onChange, noLabel, undefValueOption }: SelectItemBallProps) => {
  const { t } = useTranslation('database_items');
  const itemOptions = useSelectOptions('itemBall');
  const options = useMemo(() => {
    if (undefValueOption) return [{ value: '__undef__', label: undefValueOption }, ...itemOptions];
    return itemOptions;
  }, [itemOptions, undefValueOption]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const optionals = useMemo(() => ({ deletedOption: t('item_deleted') }), []);

  if (noLabel) return <StudioDropDown value={dbSymbol} options={options} onChange={onChange} optionals={optionals} />;

  return (
    <SelectContainerWithLabel>
      <span>{t('item')}</span>
      <StudioDropDown value={dbSymbol} options={options} onChange={onChange} optionals={optionals} />
    </SelectContainerWithLabel>
  );
};
