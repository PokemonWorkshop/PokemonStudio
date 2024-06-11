import { useInputAttrsWithLabel } from '@utils/useInputAttrs';
import { STATUS_EDITOR_SCHEMA } from './StatusEditorSchema';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { InputContainer } from '@components/inputs';
import { StudioMoveStatusList } from '@modelEntities/move';

type StatusEditorProps = {
  index: number;
  options: SelectOption[];
  onTouched: React.FormEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  defaults: Record<string, unknown>;
  statuses: StudioMoveStatusList[];
  chances: number[];
  handleStatusChange: (index: number, value: string) => void;
  handleChancesChange: (index: number, chance: number) => void;
};

export const StatusEditor = ({
  index,
  options,
  onTouched,
  defaults,
  statuses,
  chances,
  handleStatusChange,
  handleChancesChange,
}: StatusEditorProps) => {
  const { t } = useTranslation('database_moves');
  const { EmbeddedUnitInput, Select } = useInputAttrsWithLabel(STATUS_EDITOR_SCHEMA, defaults);
  const divRef = useRef<HTMLDivElement>(null);
  const divInputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!divRef.current || !divInputRef.current) return;

    divInputRef.current.style.display = statuses[index] === '__undef__' ? 'none' : 'block';
    if (index === 0 && statuses[1] === '__undef__') {
      divInputRef.current.style.display = 'none';
    }

    if (statuses[0] === '__undef__' && index !== 0) {
      divRef.current.style.display = 'none';
    } else if (statuses[1] === '__undef__' && index === 2) {
      divRef.current.style.display = 'none';
    } else {
      divRef.current.style.display = 'flex';
    }
  }, [index, statuses]);

  return (
    <InputContainer size="s" ref={divRef}>
      <Select
        name={`moveStatus.${index}.status`}
        label={t(`status_${(index + 1) as 1 | 2 | 3}`)}
        options={options}
        onChange={(value) => handleStatusChange(index, value)}
      />
      <div ref={divInputRef}>
        <EmbeddedUnitInput
          name={`moveStatus.${index}.luckRate`}
          unit="%"
          label={t('chance')}
          labelLeft
          onInput={onTouched}
          onChange={(event) => handleChancesChange(index, event.target.valueAsNumber)}
          value={isNaN(chances[index]) ? '' : chances[index]}
          defaultValue={undefined}
        />
      </div>
    </InputContainer>
  );
};
