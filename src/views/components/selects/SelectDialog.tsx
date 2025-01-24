import React, { useMemo } from 'react';
import { StudioDropDown } from '@components/StudioDropDown';
import { useGetTextList } from '@utils/ReadingProjectText';

type SelectTextProps = {
  fileId: string;
  textId: string;
  onChange: (fileId: string) => void;
  undefValueOption?: string;
  name?: string;
  disabled?: boolean;
};

export const SelectDialog = ({ textId, fileId, onChange, name, undefValueOption, disabled }: SelectTextProps) => {
  const disabledResearch = useMemo(() => (disabled ? true : undefined), [disabled]);
  const getTextList = useGetTextList();
  const texts = useMemo(
    () =>
      getTextList(Number(fileId)).reduce((acc, text) => {
        if (text.dialog) {
          acc.push({
            label: text.dialog,
            value: text.textId.toString(),
          });
        }
        return acc;
      }, [] as { label: string; value: string }[]),
    [getTextList, fileId]
  );
  //   log.info('texts', texts);
  const options = useMemo(() => {
    if (undefValueOption) return [{ value: '__undef__', label: undefValueOption }, ...texts];
    return texts;
  }, [texts, undefValueOption]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const optionals = useMemo(() => ({ disabledResearch: disabledResearch as true | undefined }), [disabledResearch]);

  return <StudioDropDown name={name} value={textId} options={options} onChange={onChange} optionals={optionals} />;
};
