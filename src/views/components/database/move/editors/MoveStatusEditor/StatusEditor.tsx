import { useInputAttrsWithLabel } from '@utils/useInputAttrs';
import { STATUS_EDITOR_SCHEMA } from './StatusEditorSchema';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { InputContainer } from '@components/inputs';
import { StudioMoveStatus } from '@modelEntities/move';

type StatusEditorProps = {
  index: number;
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
  const divInputRef = useRef<HTMLDivElement>(null);

  const onChange = () => {
    setUpdateStatus((b) => !b);
  };

  useEffect(() => {
    if (!divRef.current || !divInputRef.current) return;

    const moveStatus = getRawFormData().moveStatus as StudioMoveStatus[];
    divInputRef.current.style.display = moveStatus[index].status === '__undef__' ? 'none' : 'block';

    if (moveStatus[0].status === '__undef__' && index !== 0) {
      divRef.current.style.display = 'none';
    } else if (moveStatus[1].status === '__undef__' && index === 2) {
      divRef.current.style.display = 'none';
    } else {
      divRef.current.style.display = 'flex';
    }
  }, [updateStatus]);

  return (
    <InputContainer size="s" ref={divRef}>
      <Select name={`moveStatus.${index}.status`} label={t(`status_${(index + 1) as 1 | 2 | 3}`)} options={options} onChange={onChange} />
      <div ref={divInputRef}>
        <EmbeddedUnitInput name={`moveStatus.${index}.luckRate`} unit="%" label={t('chance')} labelLeft onInput={onTouched} />
      </div>
    </InputContainer>
  );
};
