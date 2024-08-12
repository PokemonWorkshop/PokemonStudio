import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StudioDropDown } from '@components/StudioDropDown';
import { SelectContainerWithLabel } from './SelectContainerWithLabel';
import { useSelectOptions } from '@hooks/useSelectOptions';
import { useGetTextList } from '@utils/ReadingProjectText';
import { useTextPage } from '@hooks/usePage';
import log from 'electron-log';

type SelectTextProps = {
  fileId: string;
  textId: string;
  onChange: (fileId: string) => void;
  undefValueOption?: string;
  noLabel?: boolean;
  disabled?: boolean;
};

export const SelectDialog = ({ textId, fileId, onChange, noLabel, undefValueOption, disabled }: SelectTextProps) => {
  const { t } = useTranslation('text_management');
  const disabledResearch = useMemo(() => (disabled ? true : undefined), [disabled]);
  const getTextList = useGetTextList();
  const texts = useMemo(
    () =>
      getTextList(Number(fileId)).map((dialog) => ({
        label: dialog.dialog,
        value: dialog.textId.toString(),
      })),
    [getTextList, fileId]
  );
  //   log.info('texts', texts);
  const options = useMemo(() => {
    if (undefValueOption) return [{ value: '__undef__', label: undefValueOption }, ...texts];
    return texts;
  }, [texts, undefValueOption]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const optionals = useMemo(() => ({ disabledResearch: disabledResearch as true | undefined }), [disabledResearch]);

  if (noLabel) return <StudioDropDown value={textId} options={options} onChange={onChange} optionals={optionals} />;

  return (
    <SelectContainerWithLabel>
      <span>{t('texts_file')}</span>
      <StudioDropDown value={textId} options={options} onChange={onChange} optionals={optionals} />
    </SelectContainerWithLabel>
  );
};
