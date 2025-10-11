import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelectOptions } from '@hooks/useSelectOptions';
import { StudioDropDown, StudioDropDownFilter } from '@components/StudioDropDown';
import { SelectContainerWithLabel } from './SelectContainerWithLabel';

type SelectQuestProps = {
  dbSymbol: string;
  onChange: (dbSymbol: string) => void;
  undefValueOption?: string;
  noLabel?: boolean;
  filter?: StudioDropDownFilter;
};

export const SelectQuest = ({ dbSymbol, onChange, noLabel, undefValueOption, filter }: SelectQuestProps) => {
  const { t } = useTranslation();
  const questOptions = useSelectOptions('quests');
  const options = useMemo(() => {
    if (undefValueOption) return [{ value: '__undef__', label: undefValueOption }, ...questOptions];
    return questOptions;
  }, [questOptions, undefValueOption]);

  const optionals = { deletedOption: t('quest_deleted'), noOptionLabel: t('no_quest_found'), filter };

  if (noLabel) return <StudioDropDown value={dbSymbol} options={options} onChange={onChange} optionals={optionals} />;

  return (
    <SelectContainerWithLabel>
      <span>{t('quest')}</span>
      <StudioDropDown value={dbSymbol} options={options} onChange={onChange} optionals={optionals} />
    </SelectContainerWithLabel>
  );
};
