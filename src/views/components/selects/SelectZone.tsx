import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StudioDropDown, StudioDropDownFilter } from '@components/StudioDropDown';
import { useSelectOptions } from '@src/hooks/useSelectOptions';
import { SelectContainerWithLabel } from './SelectContainerWithLabel';

type SelectZoneProps = {
  dbSymbol: string;
  onChange: (dbSymbol: string) => void;
  undefValueOption?: string;
  noLabel?: boolean;
  filter?: StudioDropDownFilter;
};

export const SelectZone = ({ dbSymbol, onChange, noLabel, undefValueOption, filter }: SelectZoneProps) => {
  const { t } = useTranslation();
  const zoneOptions = useSelectOptions('zones');
  const options = useMemo(() => {
    if (undefValueOption) return [{ value: '__undef__', label: undefValueOption }, ...zoneOptions];
    return zoneOptions;
  }, [zoneOptions, undefValueOption]);

  const optionals = { deletedOption: t('zone_deleted'), filter };

  if (noLabel) return <StudioDropDown value={dbSymbol} options={options} onChange={onChange} optionals={optionals} />;

  return (
    <SelectContainerWithLabel>
      <span>{t('zone')}</span>
      <StudioDropDown value={dbSymbol} options={options} onChange={onChange} optionals={optionals} />
    </SelectContainerWithLabel>
  );
};
