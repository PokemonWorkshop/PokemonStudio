import { GROUP_SYSTEM_TAGS, StudioCustomGroupCondition, StudioGroup } from '@modelEntities/group';
import { assertUnreachable } from './assertUnreachable';

export const CustomConditionTypes = ['enabledSwitch', 'mapId'] as const;
export const GroupActivationsMap = [
  { value: 'always', label: 'activation_always' },
  { value: '11', label: 'activation_day' },
  { value: '12', label: 'activation_night' },
  { value: '13', label: 'activation_morning' },
  { value: '14', label: 'activation_sunset' },
  { value: 'custom', label: 'activation_custom' },
] as const;
export const GroupVariationsMap = [
  { value: '0', label: 'variation_0' },
  { value: '1', label: 'variation_1' },
  { value: '2', label: 'variation_2' },
  { value: '3', label: 'variation_3' },
  { value: '4', label: 'variation_4' },
  { value: '5', label: 'variation_5' },
  { value: '6', label: 'variation_6' },
  { value: '7', label: 'variation_7' },
] as const;
export const GroupToolMap = [
  { value: 'none', label: 'none' },
  { value: 'OldRod', label: 'OldRod' },
  { value: 'GoodRod', label: 'GoodRod' },
  { value: 'SuperRod', label: 'SuperRod' },
  { value: 'RockSmash', label: 'RockSmash' },
] as const;
export const GroupBattleTypes = ['simple', 'double'] as const;
export type StudioGroupActivationType = (typeof GroupActivationsMap)[number]['value'];

export const getActivationValue = (newGroup: StudioGroup) => {
  const conditions = newGroup.customConditions ? newGroup.customConditions.filter((condition) => condition.type === CustomConditionTypes[0]) : [];
  if (conditions.length > 0) {
    const index = GroupActivationsMap.findIndex((activation) => Number(activation.value) === conditions[0].value);
    if (index > -1) {
      return GroupActivationsMap[index].value;
    } else {
      return 'custom';
    }
  } else {
    return 'always';
  }
};

export const getActivationLabel = (newGroup: StudioGroup) => {
  const conditions = newGroup.customConditions ? newGroup.customConditions.filter((condition) => condition.type === CustomConditionTypes[0]) : [];
  if (conditions.length > 0) {
    const index = GroupActivationsMap.findIndex((activation) => Number(activation.value) === conditions[0].value);
    if (index > -1) {
      return GroupActivationsMap[index].label;
    } else {
      return 'activation_custom';
    }
  } else {
    return 'activation_always';
  }
};

export const updateActivation = (value: string, group: StudioGroup, switchValue: number) => {
  let conditions = Object.assign([], group.customConditions) as StudioCustomGroupCondition[];
  if (!conditions || value === 'always') {
    conditions = conditions.filter((condition) => condition.type !== CustomConditionTypes[0]);
  }

  if (value !== 'always') {
    const index = conditions ? conditions.findIndex((condition) => condition.type === CustomConditionTypes[0]) : -1;
    const condition: StudioCustomGroupCondition = {
      type: CustomConditionTypes[0],
      value: value !== 'custom' ? Number(value) : isNaN(switchValue) ? 0 : switchValue,
      relationWithPreviousCondition: 'AND',
    };
    if (index > -1) {
      conditions[index] = condition;
    } else {
      conditions.push(condition);
    }
  }
  return conditions;
};

export const onSwitchUpdateActivation = (value: number): StudioGroupActivationType => {
  switch (value) {
    case 11:
    case 12:
    case 13:
    case 14:
      return value.toString() as StudioGroupActivationType;
  }
  return 'custom';
};

export const getSwitchValue = (activation: StudioGroupActivationType) => {
  switch (activation) {
    case 'always':
    case 'custom':
      return 1;
    case '11':
    case '12':
    case '13':
    case '14':
      return Number(activation);
    default:
      assertUnreachable(activation);
  }
  return 1;
};

export const getSwitchDefaultValue = (group: StudioGroup) =>
  group.customConditions.filter((condition) => condition.type === 'enabledSwitch')[0]?.value || 1;

export const defineRelationCustomCondition = (customConditions: StudioCustomGroupCondition[]) => {
  const mapIdConditions = customConditions.filter((conditions) => conditions.type === 'mapId');
  mapIdConditions.forEach((conditions) => (conditions.relationWithPreviousCondition = 'OR'));
  if (mapIdConditions.length >= 1) mapIdConditions[0].relationWithPreviousCondition = 'AND';
  const otherConditions = customConditions.filter((conditions) => conditions.type !== 'mapId');
  return mapIdConditions.concat(otherConditions);
};

export const isCustomEnvironment = (systemTag: string) => !(GROUP_SYSTEM_TAGS as readonly string[]).includes(systemTag);
