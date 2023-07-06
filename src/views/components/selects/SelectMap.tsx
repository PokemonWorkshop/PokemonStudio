import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StudioDropDown } from '@components/StudioDropDown';
import { SelectContainerWithLabel } from './SelectContainerWithLabel';
import { useSelectOptions } from '@utils/useSelectOptions';

type SelectMapProps = {
  dbSymbol: string;
  onChange: (dbSymbol: string) => void;
  undefValueOption?: string;
  noLabel?: boolean;
};

export const SelectMap = ({ dbSymbol, onChange, noLabel, undefValueOption }: SelectMapProps) => {
  const { t } = useTranslation('database_maps');
  const mapOption = useSelectOptions('maps');
  const options = useMemo(() => {
    if (undefValueOption) return [{ value: '__undef__', label: undefValueOption }, ...mapOption];
    return mapOption;
  }, [mapOption, undefValueOption]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const optionals = useMemo(() => ({ deletedOption: t('map_deleted') }), []);

  if (noLabel) return <StudioDropDown value={dbSymbol} options={options} onChange={onChange} optionals={optionals} />;

  return (
    <SelectContainerWithLabel>
      <span>{t('map')}</span>
      <StudioDropDown value={dbSymbol} options={options} onChange={onChange} optionals={optionals} />
    </SelectContainerWithLabel>
  );
};
