import React, { useMemo } from 'react';
import { SecondaryNoBackground } from '@components/buttons';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import styled from 'styled-components';
import { ReactComponent as DeleteIcon } from '@assets/icons/global/delete-icon.svg';
import { SelectCustomSimple } from '@components/SelectCustom';
import { InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import { InputNumber } from './InputNumber';
import { SelectType } from '@components/selects';
import { ReactComponent as PlusIcon } from '@assets/icons/global/plus-icon2.svg';
import { SelectNature2 } from '@components/selects/SelectNature';
import {
  CREATURE_QUEST_CONDITIONS,
  StudioCreatureQuestCondition,
  StudioCreatureQuestConditionType,
  StudioQuestObjective,
} from '@modelEntities/quest';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { createCreatureQuestCondition } from '@utils/entityCreation';
import { SelectPokemon } from '@components/selects/SelectPokemon';
import { cloneEntity } from '@utils/cloneEntity';
import { useConfigSettings } from '@src/hooks/useProjectConfig';

type SelectConditionProps = {
  condition: StudioCreatureQuestCondition;
  index: number;
  excludeConditions: StudioCreatureQuestConditionType[];
  onChange: (value: string) => void;
};

const conditionCategoryEntries = (
  t: TFunction<'database_quests'>,
  excludes: StudioCreatureQuestConditionType[],
  itSelf: StudioCreatureQuestConditionType
) =>
  CREATURE_QUEST_CONDITIONS.map((type) => ({ value: type, label: t(`condition_${type}`) })).filter(
    ({ value }) => !excludes.includes(value) || value === itSelf
  );

const SelectCondition = ({ condition, index, excludeConditions, onChange }: SelectConditionProps) => {
  const { t } = useTranslation('database_quests');
  const conditionOptions = useMemo(() => conditionCategoryEntries(t, excludeConditions, condition.type), [t, excludeConditions, condition.type]);
  return (
    <SelectCustomSimple id={`select-condition-${index}`} value={condition.type} options={conditionOptions} onChange={(value) => onChange(value)} />
  );
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

const buildExcludeConditions = (conditions: StudioCreatureQuestCondition[], index: number) => {
  const excludes = conditions.reduce<StudioCreatureQuestConditionType[]>((prev, { type }, indexCondition) => {
    if (index === indexCondition) return prev;

    switch (type) {
      case 'level':
        return [...prev, 'level', 'minLevel', 'maxLevel'];
      case 'minLevel':
      case 'maxLevel':
        return [...prev, 'level', type];
      case 'pokemon':
      case 'nature':
        return [...prev, type];
    }
    return prev;
  }, []);
  if (conditions.filter(({ type }) => type === 'type').length === 2) {
    excludes.push('type');
  }
  return Array.from(new Set(excludes));
};

type ValueConditionProps = {
  condition: StudioCreatureQuestCondition;
  updateCondition: () => void;
};

const ValueCondition = ({ condition, updateCondition }: ValueConditionProps) => {
  const { t } = useTranslation('database_quests');
  const { t: tSelect } = useTranslation('select');
  const { projectConfigValues: settings } = useConfigSettings();
  const { type, value } = condition;

  const updateValue = (value: number | DbSymbol) => {
    condition.value = value;
    updateCondition();
  };

  if (type === 'level' || type === 'minLevel' || type === 'maxLevel') {
    return (
      <InputWithLeftLabelContainer>
        <Label htmlFor="input-level">{t('level')}</Label>
        <InputNumber name="input-level" value={value as number} max={settings.pokemonMaxLevel} setValue={updateValue} />
      </InputWithLeftLabelContainer>
    );
  } else if (type === 'nature') {
    return (
      <InputWithTopLabelContainer>
        <Label htmlFor="nature">{t('nature')}</Label>
        <SelectNature2 name="natureDbSymbol" defaultValue={value} onChange={updateValue} />
      </InputWithTopLabelContainer>
    );
  } else if (type === 'type') {
    return (
      <InputWithTopLabelContainer>
        <Label htmlFor="type">{t('type')}</Label>
        <SelectType dbSymbol={value as string} onChange={(value) => updateValue(value as DbSymbol)} noLabel noneValue />
      </InputWithTopLabelContainer>
    );
  } else {
    return (
      <InputWithTopLabelContainer>
        <Label htmlFor="pokemon">{t('condition_pokemon')}</Label>
        <SelectPokemon dbSymbol={value as string} onChange={(value) => updateValue(value as DbSymbol)} undefValueOption={tSelect('none')} noLabel />
      </InputWithTopLabelContainer>
    );
  }
};

type GoalConditionProps = {
  condition: StudioCreatureQuestCondition;
  index: number;
  excludeConditions: StudioCreatureQuestConditionType[];
  onChange: (value: string) => void;
  onDelete: () => void;
  updateCondition: () => void;
};

const GoalCondition = ({ condition, index, excludeConditions, onChange, onDelete, updateCondition }: GoalConditionProps) => {
  const { t } = useTranslation('database_quests');
  return (
    <InputContainer>
      <TitleContainer>
        <span>{t('condition', { number: index + 1 })}</span>
        {index !== 0 && <DeleteIcon onClick={onDelete} />}
      </TitleContainer>
      <PaddedInputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="condition">{t('label_condition')}</Label>
          <SelectCondition condition={condition} index={index} excludeConditions={excludeConditions} onChange={onChange} />
        </InputWithTopLabelContainer>
        <ValueCondition condition={condition} updateCondition={updateCondition} />
      </PaddedInputContainer>
    </InputContainer>
  );
};

const QuestGoalConditionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding-top: 8px;
`;

type QuestGoalConditionsProps = {
  objective: StudioQuestObjective;
  setObjective: (objective: StudioQuestObjective) => void;
};

export const QuestGoalConditions = ({ objective, setObjective }: QuestGoalConditionsProps) => {
  const { t } = useTranslation('database_quests');
  const conditions = useMemo(() => cloneEntity(objective.objectiveMethodArgs[0] as StudioCreatureQuestCondition[]), [objective]);
  const excludeConditions = buildExcludeConditions(conditions, -1);

  const updateCondition = () => {
    const updatedObjective = cloneEntity(objective);
    updatedObjective.objectiveMethodArgs[0] = conditions;
    setObjective(updatedObjective);
  };

  const addCondition = () => {
    const remainingConditions = CREATURE_QUEST_CONDITIONS.filter((type) => !excludeConditions.includes(type));
    if (remainingConditions.length === 0) return;

    conditions.push(createCreatureQuestCondition(remainingConditions[0]));
    updateCondition();
  };

  const onChangeCondition = (type: string, index: number) => {
    if (conditions[index].type === type) return;

    conditions[index] = createCreatureQuestCondition(type as StudioCreatureQuestConditionType);
    updateCondition();
  };

  const deleteCondition = (index: number) => {
    conditions.splice(index, 1);
    updateCondition();
  };

  return (
    <InputContainer>
      {conditions.length >= 1 && (
        <QuestGoalConditionsContainer>
          {conditions.map((condition, index) => (
            <GoalCondition
              key={index}
              condition={condition}
              excludeConditions={buildExcludeConditions(conditions, index)}
              index={index}
              onChange={(value) => onChangeCondition(value, index)}
              onDelete={() => deleteCondition(index)}
              updateCondition={updateCondition}
            />
          ))}
        </QuestGoalConditionsContainer>
      )}
      {excludeConditions.length !== CREATURE_QUEST_CONDITIONS.length && (
        <SecondaryNoBackground onClick={addCondition}>
          <PlusIcon />
          <span>{t('add_condition')}</span>
        </SecondaryNoBackground>
      )}
    </InputContainer>
  );
};
