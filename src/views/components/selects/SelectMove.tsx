import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelectOptions } from '@hooks/useSelectOptions';
import { StudioDropDown } from '@components/StudioDropDown';
import { SelectContainerWithLabel } from './SelectContainerWithLabel';
import { Select } from '@ds/Select';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { SelectOption } from '@ds/Select/types';

type SelectMoveProps = {
  dbSymbol: string;
  onChange: (dbSymbol: string) => void;
  undefValueOption?: string;
  noLabel?: boolean;
};

export const SelectMove = ({ dbSymbol, onChange, noLabel, undefValueOption }: SelectMoveProps) => {
  const { t } = useTranslation();
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

type SelectMove2Props = {
  name: string;
  defaultValue?: DbSymbol;
  onChange?: (v: DbSymbol) => void;
};

export const SelectMove2 = (props: SelectMove2Props) => {
  const { t } = useTranslation();
  const moveOptions = useSelectOptions('moves') as SelectOption<DbSymbol>[];

  return <Select options={moveOptions} notFoundLabel={t('move_deleted')} chooseValue={moveOptions[0]?.value || '__undef__'} {...props} />;
};
