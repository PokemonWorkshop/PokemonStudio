import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelectOptions } from '@hooks/useSelectOptions';
import { StudioDropDown, StudioDropDownFilter } from '@components/StudioDropDown';
import { SelectContainerWithLabel } from './SelectContainerWithLabel';

type SelectTrainerProps = {
  dbSymbol: string;
  onChange: (dbSymbol: string) => void;
  undefValueOption?: string;
  noLabel?: boolean;
  filter?: StudioDropDownFilter;
};

export const SelectTrainer = ({ dbSymbol, onChange, noLabel, undefValueOption, filter }: SelectTrainerProps) => {
  const { t } = useTranslation('database_trainers');
  const trainerOptions = useSelectOptions('trainers');
  const options = useMemo(() => {
    if (undefValueOption) return [{ value: '__undef__', label: undefValueOption }, ...trainerOptions];
    return trainerOptions;
  }, [trainerOptions, undefValueOption]);

  const optionals = { deletedOption: t('trainer_deleted'), filter };

  if (noLabel) return <StudioDropDown value={dbSymbol} options={options} onChange={onChange} optionals={optionals} />;

  return (
    <SelectContainerWithLabel>
      <span>{t('trainer')}</span>
      <StudioDropDown value={dbSymbol} options={options} onChange={onChange} optionals={optionals} />
    </SelectContainerWithLabel>
  );
};
