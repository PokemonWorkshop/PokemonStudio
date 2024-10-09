import { useInputAttrsWithLabel } from '@hooks/useInputAttrs';
import { STATUS_EDITOR_SCHEMA } from './StatusEditorSchema';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, InputContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { MOVE_STATUS_CUSTOM, MOVE_STATUS_LIST, StudioMoveStatusList } from '@modelEntities/move';
import { Select } from '@ds/Select';

export const isCustomStatusFunc = (status: string | null) => {
  if (status === null) return;

  return !([...MOVE_STATUS_LIST, '__undef__'] as readonly string[]).includes(status);
};

const shouldShowStatusSelection = (status: StudioMoveStatusList, index: number) => {
  // Always can select the first status
  console.log(status, status === '__undef__', index);

  if (index === 0) return true;
  // If any of the previous status is not selected, we cannot select the current one
  if (index > 0 && status?.includes('__undef__')) return false;

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
    String(defaults[`moveStatus.${index}.status`]) || undefined
  );

  //const status = getRawFormData()[`moveStatus.${index}.status`] ?? defaults[`moveStatus.${index}.status`];
  const status: string = getStatus(getRawFormData()[`moveStatus.${index}.status`], defaults[`moveStatus.${index}.status`]);

  //const [customStatus, setCustomStatus] = useState<StudioMoveStatusList>(getCustomStatus(statuses[index]));
  //const isCustomStatus = isCustomStatusFunc(statuses[index]);
  // const customStatusError = isCustomStatus && customStatus !== '' && !MOVE_STATUS_CUSTOM_VALIDATOR.safeParse(customStatus).success;
  //const customStatusError = false;

  const onChange = (index: number, value: string) => {
    const isCustom = value === MOVE_STATUS_CUSTOM;
    if (isCustom) setDefaultCustomInputValue('');
    console.log(`onChange: ${isCustom}`);

    setIsCustom(isCustom);
    // handleStatusChange(index, value);
  };

  useEffect(() => {
    if (!divRef.current || !divInputRef.current) return;

    divInputRef.current.style.display = statuses[index] !== '__undef__' ? 'block' : 'none';
    divRef.current.style.display = shouldShowStatusSelection(statuses[index], index) ? 'flex' : 'none';
  }, [statuses[index], index]);

  return (
    <InputContainer size="s" ref={divRef}>
      <InputWithTopLabelContainer>
        <Label>{t(`status_${(index + 1) as 1 | 2 | 3}`)}</Label>
        {String(defaults[`moveStatus.${index}.status`])}
        {status.toString()}
        <Select
          name={isCustom ? '__ignore__' : `moveStatus.${index}.status`}
          options={options}
          onChange={(value) => onChange(index, value)}
          value={isCustom ? MOVE_STATUS_CUSTOM : status}
          defaultValue={String(defaults[`moveStatus.${index}.status`]) ?? '__undef__'}
        />
      </InputWithTopLabelContainer>
      {/*<InputWithTopLabelContainer></InputWithTopLabelContainer>
        <Label htmlFor="select-environment">{t(`status_${(index + 1) as 1 | 2 | 3}`)}</Label>
        <SelectCustomSimple
          id="select-environment"
          options={options}
          onChange={(value) => (value === 'status_custom' ? setCustomStatus('') : setCustomStatus(value))}
          value={isCustomStatus ? 'status_custom' : customStatus ?? ''}
          noTooltip
        />
      </InputWithTopLabelContainer>*/}
      {isCustom && (
        <InputWithTopLabelContainer>
          <Label required>{t('status_custom')}</Label>
          <Input
            name={isCustom ? `moveStatus.${index}.status` : '__ignore__'}
            onChange={(event) => handleStatusChange(index, `Custom_${event.target.value}`)}
            placeholder="Frozen"
            defaultValue={defaultCustomInputValue}
            //pattern="^[a-z_][a-z0-9_]+$"
          />
        </InputWithTopLabelContainer>
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
