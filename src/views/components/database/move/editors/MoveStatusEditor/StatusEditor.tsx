import { useInputAttrsWithLabel } from '@utils/useInputAttrs';
import { STATUS_EDITOR_SCHEMA } from './StatusEditorSchema';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { InputContainer } from '@components/inputs';
import { StudioMoveStatus, StudioMoveStatusList } from '@modelEntities/move';

type StatusEditorProps = {
  index: 0 | 1 | 2;
  options: SelectOption[];
  getRawFormData: () => Record<string, unknown>;
  onTouched: React.FormEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  defaults: Record<string, unknown>;
  updateStatus: boolean;
  setUpdateStatus: React.Dispatch<React.SetStateAction<boolean>>;
};

export const StatusEditor = ({ index, options, getRawFormData, onTouched, defaults, updateStatus, setUpdateStatus }: StatusEditorProps) => {
  const { t } = useTranslation('database_moves');
  const { EmbeddedUnitInput, Select } = useInputAttrsWithLabel(STATUS_EDITOR_SCHEMA, defaults);
  const divRef = useRef<HTMLDivElement>(null);
  //const moveStatus = getRawFormData().moveStatus as StudioMoveStatus[];

  const onChange = () => {
    setUpdateStatus((b) => !b);
  };

  useEffect(() => {
    if (!divRef.current) return;
    if (index === 0) {
      divRef.current.style.display = 'flex';
      return;
    }

    console.log('here');

    const isVisible = (getRawFormData().moveStatus as StudioMoveStatus[])[index - 1].status !== '__undef__';
    divRef.current.style.display = isVisible ? 'flex' : 'none';
  }, [getRawFormData, index, updateStatus]);

  return (
    <InputContainer size="s" ref={divRef}>
      <Select name={`moveStatus.${index}.status`} label={t(`status_${(index + 1) as 1 | 2 | 3}`)} options={options} onChange={onChange} />
      <EmbeddedUnitInput name={`moveStatus.${index}.luckRate`} unit="%" label={t('chance')} labelLeft onInput={onTouched} />
    </InputContainer>
  );
};
