import GroupModel, { CustomCondition, CustomConditionTypes, GroupActivationsMap, ToolGroup } from '@modelEntities/group/Group.model';

export const getActivationValue = (newGroup: GroupModel) => {
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

export const getActivationLabel = (newGroup: GroupModel) => {
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

export const onActivationChange = (value: string, newGroup: GroupModel, refreshUI: (_: unknown) => void) => {
  let conditions = newGroup.customConditions;
  if (!conditions || value === 'always') {
    conditions = conditions.filter((condition) => condition.type !== CustomConditionTypes[0]);
  }

  if (value != 'always') {
    const index = conditions ? conditions.findIndex((condition) => condition.type === CustomConditionTypes[0]) : -1;
    const condition: CustomCondition = {
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

export const needSwitchInput = (group: GroupModel) => {
  const conditions = group.customConditions ? group.customConditions.filter((condition) => condition.type === CustomConditionTypes[0]) : [];
  if (conditions.length > 0) {
    const index = GroupActivationsMap.findIndex((activation) => Number(activation.value) === conditions[0].value);
    if (index === -1) {
      return true;
    }
  }
  return false;
};

export const onSwitchInputChange = (value: string, group: GroupModel, refreshUI: (_: unknown) => void) => {
  const conditions = group.customConditions.filter((condition) => condition.type === CustomConditionTypes[0]);
  if (conditions.length > 0) {
    conditions[0].value = Number(value);
  }
  refreshUI(null); // No need to assign anything in that case
};

export const getSwitchValue = (newGroup: GroupModel) => {
  const conditions = newGroup.customConditions ? newGroup.customConditions.filter((condition) => condition.type === CustomConditionTypes[0]) : [];
  if (conditions.length > 0) {
    const index = GroupActivationsMap.findIndex((activation) => Number(activation.value) === conditions[0].value);
    if (index === -1) {
      return conditions[0].value;
    }
  }
  return 0;
};

export const onVariationChange = (value: string, group: GroupModel, refreshUI: (_: unknown) => void) => {
  let tool;
  let terrainTag;
  if (isNaN(Number(value))) {
    tool = value as ToolGroup;
    terrainTag = 0;
  } else {
    tool = undefined;
    terrainTag = Number(value);
  }
  refreshUI((group.tool = tool));
  refreshUI((group.terrainTag = terrainTag));
};

export const getVariationValue = (group: GroupModel) => {
  return group.tool ?? group.terrainTag.toString();
};
