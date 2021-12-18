import { ProjectData, TextsWithLanguageConfig } from '@src/GlobalStateProvider';
import { assertUnreachable } from '@utils/assertUnreachable';
import { cleanNaNValue } from '@utils/cleanNaNValue';
import { getText, setText } from '@utils/ReadingProjectText';
import { AnyT, jsonArrayMember, jsonMember, jsonObject, TypedJSON } from 'typedjson';
import PSDKEntity from '../PSDKEntity';

export const QuestCategories = ['primary', 'secondary'] as const;
export type QuestCategory = typeof QuestCategories[number];
export const QuestResolutions = ['default', 'progressive'] as const;
export type QuestResolution = typeof QuestResolutions[number];
export const ObjectiveTypes = [
  'objective_speak_to',
  'objective_beat_npc',
  'objective_obtain_item',
  'objective_see_pokemon',
  'objective_beat_pokemon',
  'objective_catch_pokemon',
  'objective_obtain_egg',
  'objective_hatch_egg',
] as const;
export type ObjectiveType = typeof ObjectiveTypes[number];
export type ObjectiveCategoryType = 'interaction' | 'battle' | 'discovery' | 'exploration';
export const EarningTypes = ['earning_money', 'earning_item', 'earning_pokemon'] as const;
export type EarningType = typeof EarningTypes[number];
export type EarningCategoryType = 'money' | 'item' | 'pokemon';

export const PokemonQuestConditions = ['pokemon', 'type', 'nature', 'minLevel', 'maxLevel', 'level'] as const;
export type PokemonQuestConditionType = typeof PokemonQuestConditions[number];
export type PokemonQuestCondition = {
  type: PokemonQuestConditionType;
  value: string | number;
};

/**
 * This interface represents the data containing the specific information about an objective
 */
export interface Objective {
  /**
   * Name of the method that validate the objective in PSDK quest system
   */
  objectiveMethodName: ObjectiveType;

  /**
   * Argument for the objective validation method & text format method
   */
  objectiveMethodArgs: (string | number | PokemonQuestCondition[] | undefined)[];

  /**
   * Name of the method that formats the text for the objective list
   */
  textFormatMethodName: string;

  /**
   * Boolean telling if it's hidden or not by default
   */
  hiddenByDefault: boolean;
}

/**
 * This interface represents the data containing the specific information about an earning
 */
export interface Earning {
  /**
   * Name of the method called in PSDK quest system when the earning is obtained
   */
  earningMethodName: EarningType;

  /**
   * Argument sent to the give & text format method
   */
  earningArgs: (string | number)[];

  /**
   * Name of the method used to format the text of the earning
   */
  textFormatMethodName: string;
}

/**
 * This class represents a quest.
 */
@jsonObject
export default class QuestModel implements PSDKEntity {
  static klass = 'Quest';

  /**
   * The class of the quest.
   */
  @jsonMember(String)
  klass!: string;

  /**
   * The id of the quest.
   */
  @jsonMember(Number)
  id!: number;

  /**
   * The db_symbol of the quest.
   */
  @jsonMember(String)
  dbSymbol!: string;

  /**
   * If the quest is a primary quest
   */
  @jsonMember(Boolean)
  isPrimary!: boolean;

  /**
   * The resolution of the quest (default or progressive)
   */
  @jsonMember(AnyT)
  resolution!: QuestResolution;

  /**
   * Data containing the specifics informations about objectives
   */
  @jsonArrayMember(AnyT)
  objectives!: Objective[];

  /**
   * Data containing the specifics informations about earnings
   */
  @jsonArrayMember(AnyT)
  earnings!: Earning[];

  /**
   * Text of the project
   */
  public projectText?: TextsWithLanguageConfig;

  /**
   * Get the description of the quest
   * @returns The description of the quest
   */
  descr = () => {
    if (!this.projectText) return `description of quest ${this.id}`;
    return getText(this.projectText, 46, this.id);
  };

  /**
   * Set the description of the quest
   */
  setDescr = (descr: string) => {
    if (!this.projectText) return;
    return setText(this.projectText, 46, this.id, descr);
  };

  /**
   * Get the name of the quest
   * @returns The name of the quest
   */
  name = () => {
    if (!this.projectText) return `name of quest ${this.id}`;
    return getText(this.projectText, 45, this.id);
  };

  /**
   * Set the name of the quest
   */
  setName = (name: string) => {
    if (!this.projectText) return;
    return setText(this.projectText, 45, this.id, name);
  };

  /**
   * Get the default values
   */
  static defaultValues = () => ({
    klass: QuestModel.klass,
    id: 0,
    dbSymbol: 'quest_0',
    isPrimary: true,
    resolution: 'default' as QuestResolution,
    objectives: [] as Objective[],
    earnings: [] as Earning[],
  });

  /**
   * Clone the object
   */
  clone = (): QuestModel => {
    const newObject = new TypedJSON(QuestModel).parse(JSON.stringify(this));
    if (!newObject) throw new Error('Could not clone object');

    newObject.projectText = this.projectText;
    return newObject as QuestModel;
  };

  /**
   * Create a new quest with default values
   * @param allQuests The project data containing the quests
   * @returns The new quest
   */
  static createQuest = (allQuests: ProjectData['quests']): QuestModel => {
    const newQuest = new QuestModel();
    Object.assign(newQuest, QuestModel.defaultValues());
    newQuest.id =
      Object.entries(allQuests)
        .map(([, questData]) => questData)
        .sort((a, b) => b.id - a.id)[0].id + 1;
    newQuest.dbSymbol = `quest_${newQuest.id}`;
    return newQuest;
  };

  /**
   * Build the objective object
   * @param type The type of objective
   * @param args Argument for the objective validation method
   * @returns The new objective
   */
  private static buildObjective = (type: ObjectiveType, args: (string | number | PokemonQuestCondition[] | undefined)[]): Objective => ({
    objectiveMethodName: type,
    objectiveMethodArgs: args,
    textFormatMethodName: type.replace('objective', 'text'),
    hiddenByDefault: false,
  });

  /**
   * Create the array of the conditions and can add the first condition
   * @param condition The first condition (no required)
   * @returns The new array of conditions
   */
  private static createPokemonQuestCondition = (condition?: PokemonQuestCondition) => {
    const pokemonQuestCondition: PokemonQuestCondition[] = [];
    if (condition) pokemonQuestCondition.push(condition);
    return pokemonQuestCondition;
  };

  /**
   * Create the new objective
   * @param type The type of objective
   * @returns The new objective
   */
  static createObjective = (type: ObjectiveType): Objective => {
    switch (type) {
      case 'objective_speak_to':
        return QuestModel.buildObjective(type, [0, '']);
      case 'objective_beat_npc':
        return QuestModel.buildObjective(type, [0, '', 1]);
      case 'objective_obtain_item':
        return QuestModel.buildObjective(type, ['__undef__', 1]);
      case 'objective_see_pokemon':
        return QuestModel.buildObjective(type, ['__undef__', 1]);
      case 'objective_beat_pokemon':
        return QuestModel.buildObjective(type, ['__undef__', 1]);
      case 'objective_catch_pokemon':
        return QuestModel.buildObjective(type, [QuestModel.createPokemonQuestCondition({ type: 'pokemon', value: '__undef__' }), 1]);
      case 'objective_obtain_egg':
        return QuestModel.buildObjective(type, [1]);
      case 'objective_hatch_egg':
        return QuestModel.buildObjective(type, [undefined, 1]);
      default:
        assertUnreachable(type);
    }
    return QuestModel.buildObjective(type, [0, '']);
  };

  /**
   * Create the new condition
   * @param type The type of the condition
   * @returns The new condition
   */
  static createCondition = (type: PokemonQuestConditionType): PokemonQuestCondition => {
    switch (type) {
      case 'level':
      case 'maxLevel':
      case 'minLevel':
        return { type: type, value: 1 };
      case 'nature':
        return { type: type, value: 'hardy' };
      case 'pokemon':
        return { type: type, value: '__undef__' };
      case 'type':
        return { type: type, value: '__undef__' };
      default:
        assertUnreachable(type);
    }
    return { type: type, value: '__undef__' };
  };

  /**
   * Update the index for objective speak_to and beat_npc
   */
  updateIndexSpeakToBeatNpc = () => {
    const index = { speakTo: 0, beatNpc: 0 };
    this.objectives.forEach((objective) => {
      if (objective.objectiveMethodName === 'objective_speak_to' || objective.objectiveMethodName === 'objective_beat_npc') {
        if (objective.objectiveMethodName === 'objective_speak_to') objective.objectiveMethodArgs[0] = index.speakTo++;
        else objective.objectiveMethodArgs[0] = index.beatNpc++;
      }
    });
  };

  /**
   * Build the earning object
   * @param type The type of earning
   * @param args Argument sent to the give
   * @returns The new earning
   */
  private static buildEarning = (type: EarningType, args: (string | number)[]): Earning => ({
    earningMethodName: type,
    earningArgs: args,
    textFormatMethodName: type.replace('earning', 'text_earn'),
  });

  /**
   * Create the new earning
   * @param type The type of earning
   * @returns The new earning
   */
  static createEarning = (type: EarningType): Earning => {
    switch (type) {
      case 'earning_money':
        return QuestModel.buildEarning(type, [100]);
      case 'earning_item':
        return QuestModel.buildEarning(type, ['__undef__', 1]);
      case 'earning_pokemon':
        return QuestModel.buildEarning(type, ['__undef__']);
      default:
        assertUnreachable(type);
    }
    return QuestModel.buildEarning(type, [1]);
  };

  /**
   * Cleaning NaN values in number properties
   */
  cleaningNaNValues = () => {
    this.objectives.map(({ objectiveMethodName, objectiveMethodArgs }) => {
      switch (objectiveMethodName) {
        case 'objective_beat_npc':
          objectiveMethodArgs[2] = cleanNaNValue(objectiveMethodArgs[2] as number, 1);
          break;
        case 'objective_obtain_egg':
          objectiveMethodArgs[0] = cleanNaNValue(objectiveMethodArgs[0] as number, 1);
          break;
        case 'objective_obtain_item':
        case 'objective_beat_pokemon':
        case 'objective_catch_pokemon':
        case 'objective_hatch_egg':
          objectiveMethodArgs[1] = cleanNaNValue(objectiveMethodArgs[1] as number, 1);
          break;
      }
    });
    this.earnings.map(({ earningMethodName, earningArgs }) => {
      switch (earningMethodName) {
        case 'earning_money':
          earningArgs[0] = cleanNaNValue(earningArgs[0] as number, 100);
          break;
        case 'earning_item':
          earningArgs[1] = cleanNaNValue(earningArgs[1] as number, 1);
          break;
      }
    });
  };
}
