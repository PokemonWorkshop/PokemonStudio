import { StudioCustomGroupCondition, StudioGroup, StudioGroupTool } from '@modelEntities/group';

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
  { value: 'OldRod', label: 'OldRod' },
  { value: 'GoodRod', label: 'GoodRod' },
  { value: 'SuperRod', label: 'SuperRod' },
  { value: 'RockSmash', label: 'RockSmash' },
] as const;
export const GroupBattleTypes = ['simple', 'double'] as const;

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

export const onActivationChange = (value: string, newGroup: StudioGroup, refreshUI: (_: unknown) => void) => {
  let conditions = newGroup.customConditions;
  if (!conditions || value === 'always') {
    conditions = conditions.filter((condition) => condition.type !== CustomConditionTypes[0]);
  }

  if (value != 'always') {
    const index = conditions ? conditions.findIndex((condition) => condition.type === CustomConditionTypes[0]) : -1;
    const condition: StudioCustomGroupCondition = {
      type: CustomConditionTypes[0],
      value: value != 'custom' ? Number(value) : 0,
      relationWithPreviousCondition: 'AND',
    };
    if (index > -1) {
      conditions[index] = condition;
    } else {
      conditions.push(condition);
    }
  }

  refreshUI((newGroup.customConditions = conditions));
};

export const needSwitchInput = (group: StudioGroup) => {
  const conditions = group.customConditions ? group.customConditions.filter((condition) => condition.type === CustomConditionTypes[0]) : [];
  return conditions.length !== 0;
};

export const onSwitchInputChange = (value: number, group: StudioGroup, refreshUI: (_: unknown) => void) => {
  const conditions = group.customConditions.filter((condition) => condition.type === CustomConditionTypes[0]);
  if (conditions.length > 0) {
    conditions[0].value = value;
  }
  refreshUI(null); // No need to assign anything in that case
};

export const getSwitchValue = (newGroup: StudioGroup) => {
  const conditions = newGroup.customConditions ? newGroup.customConditions.filter((condition) => condition.type === CustomConditionTypes[0]) : [];
  if (conditions.length > 0) return conditions[0].value;

  return 0;
};

export const onVariationChange = (value: string, group: StudioGroup, refreshUI: (_: unknown) => void) => {
  let tool;
  let terrainTag;
  if (isNaN(Number(value))) {
    tool = value as StudioGroupTool;
    terrainTag = 0;
  } else {
    tool = null;
    terrainTag = Number(value);
  }
  refreshUI((group.tool = tool));
  refreshUI((group.terrainTag = terrainTag));
};

export const getVariationValue = (group: StudioGroup) => {
  return group.tool ?? group.terrainTag.toString();
};

export const defineRelationCustomCondition = (group: StudioGroup) => {
  const mapIdConditions = group.customConditions.filter((conditions) => conditions.type === 'mapId');
  mapIdConditions.forEach((conditions) => (conditions.relationWithPreviousCondition = 'OR'));
  if (mapIdConditions.length >= 1) mapIdConditions[0].relationWithPreviousCondition = 'AND';
  const otherConditions = group.customConditions.filter((conditions) => conditions.type !== 'mapId');
  group.customConditions = mapIdConditions.concat(otherConditions);
};
