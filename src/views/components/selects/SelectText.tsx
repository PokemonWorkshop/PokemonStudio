import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StudioDropDown } from '@components/StudioDropDown';
import { SelectContainerWithLabel } from './SelectContainerWithLabel';

type SelectTextProps = {
  dbSymbol: string;
  onChange: (dbSymbol: string) => void;
  undefValueOption?: string;
  noLabel?: boolean;
};

export const SelectText = ({ dbSymbol, onChange, noLabel, undefValueOption }: SelectTextProps) => {
  const { t } = useTranslation('text_management');
  const textsOption = useMemo(() => [{ value: '100047', label: 'Phrases de victoire' }], []); // TODO: use the hook useSelectOptions or equivalent
  const options = useMemo(() => {
    if (undefValueOption) return [{ value: '__undef__', label: undefValueOption }, ...textsOption];
    return textsOption;
  }, [textsOption, undefValueOption]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const optionals = useMemo(() => ({ deletedOption: t('texts_deleted') }), []);

  if (noLabel) return <StudioDropDown value={dbSymbol} options={options} onChange={onChange} optionals={optionals} />;

  return (
    <SelectContainerWithLabel>
      <span>{t('texts_file')}</span>
      <StudioDropDown value={dbSymbol} options={options} onChange={onChange} optionals={optionals} />
    </SelectContainerWithLabel>
  );
};
