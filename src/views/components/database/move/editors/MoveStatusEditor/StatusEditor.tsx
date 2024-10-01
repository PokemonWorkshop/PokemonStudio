import { useInputAttrsWithLabel } from '@hooks/useInputAttrs';
import { STATUS_EDITOR_SCHEMA } from './StatusEditorSchema';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, InputContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { MOVE_STATUS_CUSTOM_VALIDATOR, MOVE_STATUS_LIST, StudioMoveStatusList } from '@modelEntities/move';
import { TextInputError } from '@components/inputs/Input';
import { SelectCustomSimple } from '@components/SelectCustom';

const getCustomStatus = (customStatus: string | null) => {
  if (customStatus === null) return '';
  if (!customStatus.startsWith('status_custom')) return 'status_custom' + customStatus;

  return customStatus.substring(7);
};
export const isCustomStatusFunc = (customStatus: string | null) =>
  !([...MOVE_STATUS_LIST, '__undef__'] as readonly string[]).includes(customStatus ?? '');

const shouldShowStatusSelection = (status: StudioMoveStatusList, index: number) => {
  // Always can select the first status
  console.log(status, status === '__undef__', index);

  if (index === 0) return true;
  // If any of the previous status is not selected, we cannot select the current one
  if (index > 0 && status?.includes('__undef__')) return false;

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

  const [customStatus, setCustomStatus] = useState<StudioMoveStatusList>(getCustomStatus(statuses[index]));
  const isCustomStatus = useMemo(() => isCustomStatusFunc(customStatus), [customStatus]);
  const customStatusError = isCustomStatus && customStatus !== '' && !MOVE_STATUS_CUSTOM_VALIDATOR.safeParse(customStatus).success;

  useEffect(() => {
    if (!divRef.current || !divInputRef.current) return;

    divInputRef.current.style.display = customStatus !== '__undef__' ? 'block' : 'none';
    divRef.current.style.display = shouldShowStatusSelection(customStatus, index) ? 'flex' : 'none';
  }, [customStatus, index]);

  return (
    <InputContainer size="s" ref={divRef}>
      {/* <Select
        name={`moveStatus.${index}.status`}
        label={t(`status_${(index + 1) as 1 | 2 | 3}`)}
        options={options}
        onChange={(value) => handleStatusChange(index, value)}
        value={statuses[index] as Exclude<StudioMoveStatusList, null>}
        defaultValue={undefined}
      /> */}
      {statuses[index]} -{customStatus} -{isCustomStatus.toString()}
      <InputWithTopLabelContainer>
        <Label htmlFor="select-environment">{t(`status_${(index + 1) as 1 | 2 | 3}`)}</Label>
        <SelectCustomSimple
          id="select-environment"
          options={options}
          onChange={(value) => (value === 'status_custom' ? setCustomStatus('') : setCustomStatus(value))}
          value={isCustomStatus ? 'status_custom' : customStatus ?? ''}
          noTooltip
        />
      </InputWithTopLabelContainer>
      {isCustomStatus && (
        <InputWithTopLabelContainer>
          <Label htmlFor="custom-environment" required>
            {t('status_custom')}
          </Label>
          <Input
            id="custom-environment"
            value={customStatus ?? ''}
            onChange={(event) => setCustomStatus(event.target.value)}
            placeholder="Frozen"
            error={customStatusError}
          />
          {customStatusError && <TextInputError>{t('error_status_format')}</TextInputError>}
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
