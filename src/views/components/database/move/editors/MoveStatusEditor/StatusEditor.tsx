import { useInputAttrsWithLabel } from '@hooks/useInputAttrs';
import { STATUS_EDITOR_SCHEMA } from './StatusEditorSchema';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, InputContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { MOVE_STATUS_CUSTOM, MOVE_STATUS_CUSTOM_VALIDATOR, MOVE_STATUS_LIST, StudioMoveStatusList } from '@modelEntities/move';
import { Select } from '@ds/Select';
import { TextInputError } from '@components/inputs/Input';

export const isCustomStatusFunc = (status: string | null) => {
  if (status === null) return;

  return !([...MOVE_STATUS_LIST, '__undef__'] as readonly string[]).includes(status);
};

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

const getStatus = (rawData: unknown, defaults: unknown): string => {
  if (rawData) return rawData as string;
  if (defaults) return defaults as string;

  return '__undef__';
};

type StatusEditorProps = {
  index: number;
  options: SelectOption[];
  onTouched: (event: React.FormEvent<HTMLInputElement>, index: number) => void;
  getRawFormData: () => Record<string, unknown>;
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
  getRawFormData,
  defaults,
  statuses,
  chances,
  handleStatusChange,
  handleChancesChange,
}: StatusEditorProps) => {
  const { t } = useTranslation('database_moves');
  const { EmbeddedUnitInput } = useInputAttrsWithLabel(STATUS_EDITOR_SCHEMA, defaults);
  const divRef = useRef<HTMLDivElement>(null);
  const divInputRef = useRef<HTMLDivElement>(null);
  const [isCustom, setIsCustom] = useState(
    !([...MOVE_STATUS_LIST, '__undef__'] as ReadonlyArray<string>).includes(String(defaults[`moveStatus.${index}.status`]))
  );
  const [defaultCustomInputValue, setDefaultCustomInputValue] = useState<string | undefined>(
    String(defaults[`moveStatus.${index}.status`]).replace(/^Custom_/, '') || undefined
  );

  const status: string = getStatus(getRawFormData()[`moveStatus.${index}.status`], defaults[`moveStatus.${index}.status`]);

  const customStatusError = statuses[index] !== '' && !MOVE_STATUS_CUSTOM_VALIDATOR.safeParse(statuses[index]).success;

  const onChange = (index: number, value: string) => {
    const isCustom = value === MOVE_STATUS_CUSTOM;
    if (isCustom) setDefaultCustomInputValue('');

    setIsCustom(isCustom);
    handleStatusChange(index, value);
  };

  useEffect(() => {
    if (!divRef.current || !divInputRef.current) return;

    divInputRef.current.style.display = shouldInputShow(statuses, index) ? 'block' : 'none';
    divRef.current.style.display = shouldShowStatusSelection(statuses, index) ? 'flex' : 'none';
  }, [index, statuses]);

  return (
    <InputContainer size="s" ref={divRef}>
      <InputWithTopLabelContainer>
        <Label>{t(`status_${(index + 1) as 1 | 2 | 3}`)}</Label>
        <Select
          name={isCustom ? '__ignore__' : `moveStatus.${index}.status`}
          options={options}
          onChange={(value) => onChange(index, value)}
          value={isCustom ? MOVE_STATUS_CUSTOM : status}
          defaultValue={String(defaults[`moveStatus.${index}.status`]) ?? '__undef__'}
        />
      </InputWithTopLabelContainer>
      {isCustom && (
        <>
          <InputWithTopLabelContainer>
            <Label required>{t('status_custom')}</Label>
            <Input
              onChange={(event) => handleStatusChange(index, `${MOVE_STATUS_CUSTOM}${event.target.value}`)}
              placeholder="Frozen"
              defaultValue={defaultCustomInputValue}
              required
              pattern="^[A-Za-z0-9_]+$"
            />
          </InputWithTopLabelContainer>
          <div style={{ display: 'none' }}>
            <Input name={isCustom ? `moveStatus.${index}.status` : '__ignore__'} value={statuses[index] || MOVE_STATUS_CUSTOM} onChange={() => {}} />
          </div>
          {customStatusError && <TextInputError>{t('invalid_format')}</TextInputError>}
        </>
      )}
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
