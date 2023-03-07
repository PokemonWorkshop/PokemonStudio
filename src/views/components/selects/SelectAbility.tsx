import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StudioDropDown } from '@components/StudioDropDown';
import { SelectContainerWithLabel } from './SelectContainerWithLabel';
import { useSelectOptions } from '@utils/useSelectOptions';

type SelectAbilityProps = {
  dbSymbol: string;
  onChange: (dbSymbol: string) => void;
  undefValueOption?: string;
  noLabel?: boolean;
};

export const SelectAbility = ({ dbSymbol, onChange, noLabel, undefValueOption }: SelectAbilityProps) => {
  const { t } = useTranslation('database_abilities');
  const abilityOption = useSelectOptions('abilities');
  const options = useMemo(() => {
    if (undefValueOption) return [{ value: '__undef__', label: undefValueOption }, ...abilityOption];
    return abilityOption;
  }, [abilityOption, undefValueOption]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const optionals = useMemo(() => ({ deletedOption: t('ability_deleted') }), []);

  if (noLabel) return <StudioDropDown value={dbSymbol} options={options} onChange={onChange} optionals={optionals} />;

  return (
    <SelectContainerWithLabel>
      <span>{t('ability')}</span>
      <StudioDropDown value={dbSymbol} options={options} onChange={onChange} optionals={optionals} />
    </SelectContainerWithLabel>
  );
};
