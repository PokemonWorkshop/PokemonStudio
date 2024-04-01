import { SelectCustomSimple } from '@components/SelectCustom';
import { assertUnreachable } from '@utils/assertUnreachable';
import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ReactComponent as DeleteIcon } from '@assets/icons/global/delete-icon.svg';
import { InputWithTopLabelContainer, Label } from '@components/inputs';
import { DayNightInput } from './DayNightInput';
import { ItemInput } from './ItemInput';
import { GenderInput } from './GenderInput';
import { MoveInput } from './MoveInput';
import { PokemonInput } from './PokemonInput';
import { WeatherInput } from './WeatherInput';
import { NumberInput } from './NumberInput';
import { TextInput } from './TextInput';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { StudioEvolutionConditionKey } from '@modelEntities/creature';
import { EvolutionConditionEditorInput } from './InputProps';

export const EVOLUTION_CONDITION_KEYS: StudioEvolutionConditionKey[] = [
  'minLevel',
  'maxLevel',
  'stone',
  'trade',
  'tradeWith',
  'itemHold',
  'maxLoyalty',
  'minLoyalty',
  // 'move_kind',
  'skill1',
  'skill2',
  'skill3',
  'skill4',
  'weather',
  'env',
  'dayNight',
  'maps',
  'gender',
  // 'nature',
  // 'switch',
  'func',
  'gemme',
];

type ConditionSelectProps = {
  currentType: StudioEvolutionConditionKey | 'none';
  keysToExclude: StudioEvolutionConditionKey[];
  onChange: (key: StudioEvolutionConditionKey) => void;
};

const isSkill = (type: StudioEvolutionConditionKey | string) => {
  return type === 'skill1' || type === 'skill2' || type === 'skill3' || type === 'skill4';
};

const removeSkills = (options: SelectOption[], currentType: StudioEvolutionConditionKey) => {
  const currentSkill = isSkill(currentType) ? currentType : undefined;
  const skills: string[] = [];
  options.forEach(({ value }) => {
    if (isSkill(value)) skills.push(value);
  });
  if (skills.length === 0) return options;
  return options.filter(({ value }) => {
    if (isSkill(value)) return value === (currentSkill || skills[0]);
    return true;
  });
};

const ConditionSelect = ({ currentType, keysToExclude, onChange }: ConditionSelectProps) => {
  const { t } = useTranslation('database_pokemon');
  const evolutionConditionKeys = currentType === 'none' ? ['none', ...EVOLUTION_CONDITION_KEYS] : EVOLUTION_CONDITION_KEYS;
  const options = removeSkills(
    evolutionConditionKeys
      .filter((conditionKey) => !keysToExclude.includes(conditionKey as StudioEvolutionConditionKey))
      .map((conditionKey) => ({
        value: conditionKey,
        label: t(`evolutionCondition_${conditionKey as StudioEvolutionConditionKey}`),
      })),
    currentType
  );

  return (
    <SelectCustomSimple
      id={`evolution-condition-${currentType}`}
      value={currentType}
      onChange={(value) => onChange(value as StudioEvolutionConditionKey)}
      options={options}
    />
  );
};

const ConditionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0 10px;
`;

type ConditionContainerWithSelectProps = ConditionSelectProps & { children: ReactNode };

const ConditionContainerWithSelect = ({ currentType, keysToExclude, onChange, children }: ConditionContainerWithSelectProps) => {
  const { t } = useTranslation('database_pokemon');

  return (
    <ConditionContainer>
      <InputWithTopLabelContainer>
        <Label>{t('evolutionConditionSelect')}</Label>
        <ConditionSelect currentType={currentType} keysToExclude={keysToExclude} onChange={onChange} />
      </InputWithTopLabelContainer>
      {children}
    </ConditionContainer>
  );
};

const ConditionFields = ({ type, state, dispatch, inputRefs }: EvolutionConditionEditorInput) => {
  const { t } = useTranslation('database_pokemon');
  const keysToExclude = state.conditionInUse.filter((otherCondition) => otherCondition !== type);
  const onKeyChange = (newKey: StudioEvolutionConditionKey) => dispatch({ type: 'swap', originalKey: type, targetKey: newKey });

  switch (type) {
    case 'dayNight': // 0-3
      return (
        <ConditionContainerWithSelect currentType={type} keysToExclude={keysToExclude} onChange={onKeyChange}>
          <DayNightInput type={type} state={state} dispatch={dispatch} inputRefs={inputRefs} />
        </ConditionContainerWithSelect>
      );
    case 'func': // string
      return (
        <ConditionContainerWithSelect currentType={type} keysToExclude={keysToExclude} onChange={onKeyChange}>
          <TextInput type={type} state={state} dispatch={dispatch} inputRefs={inputRefs} evolutionInfo={t('evolution_func_info')} />
        </ConditionContainerWithSelect>
      );
    case 'gemme': // item string
    case 'itemHold': // item string
    case 'stone': // item string
      return (
        <ConditionContainerWithSelect currentType={type} keysToExclude={keysToExclude} onChange={onKeyChange}>
          <ItemInput type={type} state={state} dispatch={dispatch} inputRefs={inputRefs} />
        </ConditionContainerWithSelect>
      );
    case 'gender': // 0-2
      return (
        <ConditionContainerWithSelect currentType={type} keysToExclude={keysToExclude} onChange={onKeyChange}>
          <GenderInput type={type} state={state} dispatch={dispatch} inputRefs={inputRefs} />
        </ConditionContainerWithSelect>
      );
    case 'maps': // number[]
      return (
        <ConditionContainerWithSelect currentType={type} keysToExclude={keysToExclude} onChange={onKeyChange}>
          <TextInput type={type} state={state} dispatch={dispatch} inputRefs={inputRefs} evolutionInfo={t('evolution_maps_info')} />
        </ConditionContainerWithSelect>
      );
    case 'maxLevel': // number
    case 'minLevel': // number
      return (
        <ConditionContainerWithSelect currentType={type} keysToExclude={keysToExclude} onChange={onKeyChange}>
          <NumberInput label={t('evolutionValue_level')} min={1} max={999} type={type} state={state} dispatch={dispatch} inputRefs={inputRefs} />
        </ConditionContainerWithSelect>
      );
    case 'maxLoyalty': // number
    case 'minLoyalty': // number
      return (
        <ConditionContainerWithSelect currentType={type} keysToExclude={keysToExclude} onChange={onKeyChange}>
          <NumberInput label={t('evolutionValue_loyalty')} min={1} max={255} type={type} state={state} dispatch={dispatch} inputRefs={inputRefs} />
        </ConditionContainerWithSelect>
      );
    case 'skill1': // skill string
    case 'skill2': // skill string
    case 'skill3': // skill string
    case 'skill4': // skill string
      return (
        <ConditionContainerWithSelect currentType={type} keysToExclude={keysToExclude} onChange={onKeyChange}>
          <MoveInput type={type} state={state} dispatch={dispatch} inputRefs={inputRefs} />
        </ConditionContainerWithSelect>
      );
    case 'none':
    case 'trade': // dbSymbol => toggle!
      return (
        <ConditionContainerWithSelect currentType={type} keysToExclude={keysToExclude} onChange={onKeyChange}>
          <></>
        </ConditionContainerWithSelect>
      );
    case 'tradeWith': // dbSymbol
      return (
        <ConditionContainerWithSelect currentType={type} keysToExclude={keysToExclude} onChange={onKeyChange}>
          <PokemonInput type={type} state={state} dispatch={dispatch} inputRefs={inputRefs} />
        </ConditionContainerWithSelect>
      );
    case 'weather': // Weather type
      return (
        <ConditionContainerWithSelect currentType={type} keysToExclude={keysToExclude} onChange={onKeyChange}>
          <WeatherInput type={type} state={state} dispatch={dispatch} inputRefs={inputRefs} />
        </ConditionContainerWithSelect>
      );
    case 'env': // number
      return (
        <ConditionContainerWithSelect currentType={type} keysToExclude={keysToExclude} onChange={onKeyChange}>
          <NumberInput label={t('evolutionValue_env')} min={0} type={type} state={state} dispatch={dispatch} inputRefs={inputRefs} />
        </ConditionContainerWithSelect>
      );
    default:
      assertUnreachable(type);
      return <div />;
  }
};

const TitleContainer = styled.div`
  display: flex;
  height: 40px;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.colors.dark18};
  border-radius: 4px;
  padding: 0 16px;
  user-select: none;
  ${({ theme }) => theme.fonts.normalMedium};
  color: ${({ theme }) => theme.colors.text100};

  & svg {
    color: ${({ theme }) => theme.colors.text400};
  }

  & svg:hover {
    color: ${({ theme }) => theme.colors.text100};
    cursor: pointer;
  }
`;

const EvolutionConditionEditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

type EvolutionConditionEditorProps = { index: number } & EvolutionConditionEditorInput;

export const EvolutionConditionEditor = ({ type, state, dispatch, inputRefs, index }: EvolutionConditionEditorProps) => {
  const { t } = useTranslation('database_pokemon');

  return (
    <EvolutionConditionEditorContainer>
      <TitleContainer>
        <span>{t('evolutionCondition', { number: index + 1 })}</span>
        <DeleteIcon onClick={() => dispatch({ type: 'remove', key: type })} />
      </TitleContainer>
      <ConditionFields type={type} state={state} dispatch={dispatch} inputRefs={inputRefs} />
    </EvolutionConditionEditorContainer>
  );
};
