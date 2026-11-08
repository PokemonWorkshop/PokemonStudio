import { StudioDropDown, StudioDropDownFilter } from '@components/StudioDropDown';
import { useSelectOptions } from '@hooks/useSelectOptions';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SelectContainerWithLabel } from './SelectContainerWithLabel';

type SelectTrainerClassProps = {
  dbSymbol: string;
  onChange: (dbSymbol: string) => void;
  undefValueOption?: string;
  noLabel?: boolean;
  filter?: StudioDropDownFilter;
};

export const SelectTrainerClass = ({ dbSymbol, onChange, noLabel, undefValueOption, filter }: SelectTrainerClassProps) => {
  const { t } = useTranslation();
  const trainerClassOptions = useSelectOptions('trainerClasses');
  const options = useMemo(() => {
    if (undefValueOption) return [{ value: '__undef__', label: undefValueOption }, ...trainerClassOptions];
    return trainerClassOptions;
  }, [trainerClassOptions, undefValueOption]);

  const optionals = { deletedOption: t('trainer_class_deleted'), noOptionLabel: t('no_trainer_class_found'), filter };

  if (noLabel) return <StudioDropDown value={dbSymbol} options={options} onChange={onChange} optionals={optionals} />;

  return (
    <SelectContainerWithLabel>
      <span>{t('trainer_class')}</span>
      <StudioDropDown value={dbSymbol} options={options} onChange={onChange} optionals={optionals} />
    </SelectContainerWithLabel>
  );
};
