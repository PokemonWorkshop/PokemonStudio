import Encounter from '@modelEntities/Encounter';
import PSDKEntity from '@modelEntities/PSDKEntity';
import { ProjectData, TextsWithLanguageConfig } from '@src/GlobalStateProvider';
import { findFirstAvailableId } from '@utils/ModelUtils';
import { getText, setText } from '@utils/ReadingProjectText';
import { AnyT, jsonArrayMember, jsonMember, jsonObject, TypedJSON } from 'typedjson';

export const CustomConditionTypes = ['enabledSwitch', 'mapId'] as const;
export type CustomConditionType = typeof CustomConditionTypes[number];
export const RelationWithPreviousConditionTypes = ['AND', 'OR'] as const;
export type RelationWithPreviousConditionType = typeof RelationWithPreviousConditionTypes[number];

export type CustomCondition = {
  type: CustomConditionType;
  value: number;
  relationWithPreviousCondition: RelationWithPreviousConditionType;
};

export const SystemTags = ['RegularGround', 'Grass', 'TallGrass', 'Cave', 'Mountain', 'Sand', 'Pond', 'Ocean', 'UnderWater', 'Snow', 'Ice'] as const;
export type SystemTag = typeof SystemTags[number];

export const ToolGroups = [undefined, 'OldRod', 'GoodRod', 'SuperRod', 'RockSmash', 'HeadButt'] as const;
export type ToolGroup = typeof ToolGroups[number];

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
  { value: 'HeadButt', label: 'HeadButt' },
] as const;
export type GroupVariation = typeof GroupActivationsMap[number];

export const GroupActivationsMap = [
  { value: 'always', label: 'activation_always' },
  { value: '11', label: 'activation_day' },
  { value: '12', label: 'activation_night' },
  { value: '13', label: 'activation_morning' },
  { value: '14', label: 'activation_sunset' },
  { value: 'custom', label: 'activation_custom' },
] as const;
export type GroupActivation = typeof GroupActivationsMap[number];

export const GroupBattleTypes = ['simple', 'double'] as const;
export type GroupBattleType = typeof GroupBattleTypes[number];

/**
 * This class represents the model of the group.
 */
@jsonObject
export default class GroupModel implements PSDKEntity {
  static klass = 'Group';

  /**
   * The class of the group.
   */
  @jsonMember(String)
  klass!: string;

  /**
   * The id of the group.
   */
  @jsonMember(Number)
  id!: number;

  /**
   * The db_symbol of the group.
   */
  @jsonMember(String)
  dbSymbol!: string;

  /**
   * The system_tag in which the Roaming Pokemon will appear.
   */
  @jsonMember(AnyT)
  systemTag!: SystemTag;

  /**
   * The terrain_tag in which the Roaming Pokemon will appear.
   */
  @jsonMember(Number)
  terrainTag!: number;

  /**
   * The tool in which the Roaming Pokemon will appear.
   */
  @jsonMember(AnyT, { preserveNull: true })
  tool!: ToolGroup;

  /**
   * If the battle is the double battle.
   */
  @jsonMember(Boolean)
  isDoubleBattle!: boolean;

  /**
   * If the battle is the horde battle.
   */
  @jsonMember(Boolean)
  isHordeBattle!: boolean;

  /**
   * Custom conditions.
   */
  @jsonArrayMember(AnyT)
  customConditions!: CustomCondition[];

  /**
   * The list of the wilds encounters
   */
  @jsonArrayMember(AnyT)
  encounters!: Encounter[];

  /**
   * Text of the project
   */
  public projectText?: TextsWithLanguageConfig;

  /**
   * Get the name of the group
   * @returns The name of the group
   */
  name = () => {
    if (!this.projectText) return `name of ${this.dbSymbol}`;
    return getText(this.projectText, 61, this.id);
  };

  /**
   * Set the name of the group
   * @param name
   * @returns
   */
  setName = (name: string) => {
    if (!this.projectText) return;
    return setText(this.projectText, 61, this.id, name);
  };

  /**
   * Get the default values
   */
  static defaultValues = () => ({
    klass: GroupModel.klass,
    id: 0,
    dbSymbol: 'group_0',
    encounters: [],
    isDoubleBattle: false,
    systemTag: SystemTags[0],
    terrainTag: 0,
    customConditions: [],
  });

  /**
   * Create a new group with default values
   * @param allGroups The project data containing the groups
   * @returns The new group
   */
  static createGroup = (allGroups: ProjectData['groups']): GroupModel => {
    const newGroup = new GroupModel();
    Object.assign(newGroup, GroupModel.defaultValues());
    newGroup.id = findFirstAvailableId(allGroups, 0);
    newGroup.dbSymbol = `group_${newGroup.id}`;
    return newGroup;
  };

  /**
   * Clone the object
   */
  clone = (): GroupModel => {
    const newObject = new TypedJSON(GroupModel).parse(JSON.stringify(this));
    if (!newObject) throw new Error('Could not clone object');

    newObject.projectText = this.projectText;
    return newObject as GroupModel;
  };

  /**
   * Define correct relationWithPreviousCondition of the custom conditions
   */
  defineRelationCustomCondition = () => {
    const mapIdConditions = this.customConditions.filter((conditions) => conditions.type === 'mapId');
    mapIdConditions.forEach((conditions) => (conditions.relationWithPreviousCondition = 'OR'));
    if (mapIdConditions.length >= 1) mapIdConditions[0].relationWithPreviousCondition = 'AND';
    const otherConditions = this.customConditions.filter((conditions) => conditions.type !== 'mapId');
    this.customConditions = mapIdConditions.concat(otherConditions);
  };
}
