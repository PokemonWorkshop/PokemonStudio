import { useInputAttrsWithLabel } from '@utils/useInputAttrs';
import { STATUS_EDITOR_SCHEMA } from './StatusEditorSchema';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { InputContainer } from '@components/inputs';
import { StudioMoveStatusList } from '@modelEntities/move';

const shouldInputShow = (statuses: StudioMoveStatusList[], index: number) => {
  // Must have selected a status for current index
  if (statuses[index] === '__undef__') return false;
  // We don't have a reason to input chances
  if (index === 0 && statuses[1] === '__undef__') return false;

  return true;
};

const shouldShowStatusSelection = (statuses: StudioMoveStatusList[], index: number) => {
  // Always can select the first status
  if (index === 0) return true;
  // If any of the previous status is not selected, we cannot select the current one
  if (index > 0 && statuses.some((v, i) => i < index && v === '__undef__')) return false;

  return true;
};

type StatusEditorProps = {
  index: number;
  options: SelectOption[];
  onTouched: (event: React.FormEvent<HTMLInputElement>, index: number) => void;
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

    divInputRef.current.style.display = shouldInputShow(statuses, index) ? 'block' : 'none';
    divRef.current.style.display = shouldShowStatusSelection(statuses, index) ? 'flex' : 'none';
  }, [index, statuses]);

  return (
    <InputContainer size="s" ref={divRef}>
      <Select
        name={`moveStatus.${index}.status`}
        label={t(`status_${(index + 1) as 1 | 2 | 3}`)}
        options={options}
        onChange={(value) => handleStatusChange(index, value)}
        value={statuses[index] as Exclude<StudioMoveStatusList, null>}
        defaultValue={undefined}
      />
      <div ref={divInputRef}>
        <EmbeddedUnitInput
          name={`moveStatus.${index}.luckRate`}
          unit="%"
          label={t('chance')}
          labelLeft
          onInput={(event) => onTouched(event, index)}
          onChange={(event) => handleChancesChange(index, event.target.valueAsNumber)}
          value={isNaN(chances[index]) ? '' : chances[index]}
          defaultValue={undefined}
        />
      </div>
    </InputContainer>
  );
};
