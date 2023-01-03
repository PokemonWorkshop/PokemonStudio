import { SelectCustomSimple } from '@components/SelectCustom';
import { assertUnreachable } from '@utils/assertUnreachable';
import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ReactComponent as DeleteIcon } from '@assets/icons/global/delete-icon.svg';
import { Input, InputWithTopLabelContainer, Label } from '@components/inputs';
import { InputProps } from './InputProps';
import { DayNightInput } from './DayNightInput';
import { ItemInput } from './ItemInput';
import { GenderInput } from './GenderInput';
import { MoveInput } from './MoveInput';
import { PokemonInput } from './PokemonInput';
import { WeatherInput } from './WeatherInput';
import { SecondaryNoBackground } from '@components/buttons';
import { ReactComponent as PlusIcon } from '@assets/icons/global/plus-icon2.svg';
import { NumberInput } from './NumberInput';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { StudioEvolutionCondition, StudioEvolutionConditionKey } from '@modelEntities/creature';
import { DbSymbol } from '@modelEntities/dbSymbol';

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

const EvolutionInfo = styled.p`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
  user-select: none;
  margin: 0;
`;

const newEvolutionCondition = (type: StudioEvolutionConditionKey): StudioEvolutionCondition => {
  switch (type) {
    case 'dayNight':
    case 'gender':
    case 'env':
      return { type, value: 0 };
    case 'func':
      return { type, value: 'void' };
    case 'gemme':
    case 'itemHold':
    case 'stone':
    case 'skill1':
    case 'skill2':
    case 'skill3':
    case 'skill4':
    case 'tradeWith':
      return { type, value: '__undef__' as DbSymbol };
    case 'maps':
      return { type, value: [-1] };
    case 'maxLevel':
    case 'minLevel':
    case 'maxLoyalty':
    case 'minLoyalty':
      return { type, value: 1 };
    case 'none':
      return { type, value: undefined };
    case 'trade':
      return { type, value: true }; // dbSymbol
    case 'weather': // Weather type
      return { type, value: 'rain' as DbSymbol };
    default:
      assertUnreachable(type);
      return { type, value: undefined };
  }
};

type EvolutionConditionEditorProps = InputProps & { allConditions: StudioEvolutionCondition[] };

const ConditionFields = ({ condition, allConditions, index, onChange }: EvolutionConditionEditorProps) => {
  const { t } = useTranslation('database_pokemon');
  const { type } = condition;
  const keysToExclude = allConditions
    .filter((otherCondition) => otherCondition.type !== type)
    .reduce((keys, curr) => [...keys, curr.type], [] as StudioEvolutionConditionKey[]);
  const onKeyChange = (newKey: StudioEvolutionConditionKey) => onChange(newEvolutionCondition(newKey), index);

  switch (type) {
    case 'dayNight': // 0-3
      return (
        <ConditionContainerWithSelect currentType={type} keysToExclude={keysToExclude} onChange={onKeyChange}>
          <DayNightInput condition={condition} index={index} onChange={onChange} />
        </ConditionContainerWithSelect>
      );
    case 'func': // string
      return (
        <ConditionContainerWithSelect currentType={type} keysToExclude={keysToExclude} onChange={onKeyChange}>
          <InputWithTopLabelContainer>
            <Label>{t('evolutionValue_func')}</Label>
            <Input type="text" value={condition.value} onChange={(event) => onChange({ type, value: event.target.value }, index)} />
            <EvolutionInfo>{t('evolution_func_info')}</EvolutionInfo>
          </InputWithTopLabelContainer>
        </ConditionContainerWithSelect>
      );
    case 'gemme': // item string
    case 'itemHold': // item string
    case 'stone': // item string
      return (
        <ConditionContainerWithSelect currentType={type} keysToExclude={keysToExclude} onChange={onKeyChange}>
          <ItemInput condition={condition} index={index} onChange={onChange} currentType={type} />
        </ConditionContainerWithSelect>
      );
    case 'gender': // 0-2
      return (
        <ConditionContainerWithSelect currentType={type} keysToExclude={keysToExclude} onChange={onKeyChange}>
          <GenderInput condition={condition} index={index} onChange={onChange} />
        </ConditionContainerWithSelect>
      );
    case 'maps': // number[]
      return (
        <ConditionContainerWithSelect currentType={type} keysToExclude={keysToExclude} onChange={onKeyChange}>
          <InputWithTopLabelContainer>
            <Label>{t('evolutionValue_maps')}</Label>
            <Input
              type="text"
              value={condition.value.join(',')}
              onChange={(event) => onChange({ type, value: event.target.value.split(',').map((item) => Number(item.trim())) }, index)}
            />
            <EvolutionInfo>{t('evolution_maps_info')}</EvolutionInfo>
          </InputWithTopLabelContainer>
        </ConditionContainerWithSelect>
      );
    case 'maxLevel': // number
    case 'minLevel': // number
      return (
        <ConditionContainerWithSelect currentType={type} keysToExclude={keysToExclude} onChange={onKeyChange}>
          <NumberInput label={t('evolutionValue_level')} min={1} currentType={type} onChange={onChange} condition={condition} index={index} />
        </ConditionContainerWithSelect>
      );
    case 'maxLoyalty': // number
    case 'minLoyalty': // number
      return (
        <ConditionContainerWithSelect currentType={type} keysToExclude={keysToExclude} onChange={onKeyChange}>
          <NumberInput
            label={t('evolutionValue_loyalty')}
            min={1}
            max={255}
            currentType={type}
            onChange={onChange}
            condition={condition}
            index={index}
          />
        </ConditionContainerWithSelect>
      );
    case 'skill1': // skill string
    case 'skill2': // skill string
    case 'skill3': // skill string
    case 'skill4': // skill string
      return (
        <ConditionContainerWithSelect currentType={type} keysToExclude={keysToExclude} onChange={onKeyChange}>
          <MoveInput condition={condition} index={index} onChange={onChange} currentType={type} />
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
          <PokemonInput condition={condition} index={index} onChange={onChange} currentType={type} />
        </ConditionContainerWithSelect>
      );
    case 'weather': // Weather type
      return (
        <ConditionContainerWithSelect currentType={type} keysToExclude={keysToExclude} onChange={onKeyChange}>
          <WeatherInput condition={condition} index={index} onChange={onChange} />
        </ConditionContainerWithSelect>
      );
    case 'env': // number
      return (
        <ConditionContainerWithSelect currentType={type} keysToExclude={keysToExclude} onChange={onKeyChange}>
          <NumberInput label={t('evolutionValue_env')} min={0} currentType={type} onChange={onChange} condition={condition} index={index} />
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

export const EvolutionConditionEditor = ({ condition, allConditions, index, onChange }: EvolutionConditionEditorProps) => {
  const { t } = useTranslation('database_pokemon');
  const shouldShowAddCondition = index === allConditions.length - 1 && !allConditions.some((otherCondition) => otherCondition.type === 'none');

  return (
    <EvolutionConditionEditorContainer>
      <TitleContainer>
        <span>{t('evolutionCondition', { number: index + 1 })}</span>
        {allConditions.length > 1 && <DeleteIcon onClick={() => onChange(undefined, index)} />}
      </TitleContainer>
      <ConditionFields condition={condition} allConditions={allConditions} index={index} onChange={onChange} />
      {shouldShowAddCondition && (
        <SecondaryNoBackground onClick={() => onChange({ type: 'none', value: undefined }, allConditions.length)}>
          <PlusIcon />
          <span>{t('evolutionAddCondition')}</span>
        </SecondaryNoBackground>
      )}
    </EvolutionConditionEditorContainer>
  );
};
