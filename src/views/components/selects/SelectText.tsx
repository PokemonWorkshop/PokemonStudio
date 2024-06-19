import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StudioDropDown } from '@components/StudioDropDown';
import { SelectContainerWithLabel } from './SelectContainerWithLabel';
import { useSelectOptions } from '@hooks/useSelectOptions';

type SelectTextProps = {
  fileId: string;
  onChange: (fileId: string) => void;
  undefValueOption?: string;
  noLabel?: boolean;
};

export const SelectText = ({ fileId, onChange, noLabel, undefValueOption }: SelectTextProps) => {
  const { t } = useTranslation('text_management');
  const textInfosOption = useSelectOptions('textInfos');
  const options = useMemo(() => {
    if (undefValueOption) return [{ value: '__undef__', label: undefValueOption }, ...textInfosOption];
    return textInfosOption;
  }, [textInfosOption, undefValueOption]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const optionals = useMemo(() => ({ deletedOption: t('texts_deleted') }), []);

  if (noLabel) return <StudioDropDown value={fileId} options={options} onChange={onChange} optionals={optionals} />;

  return (
    <SelectContainerWithLabel>
      <span>{t('texts_file')}</span>
      <StudioDropDown value={fileId} options={options} onChange={onChange} optionals={optionals} />
    </SelectContainerWithLabel>
  );
};
