import { AnyT, jsonArrayMember, jsonMember, jsonObject } from 'typedjson';
import PSDKEntity from '../PSDKEntity';

/**
 * This interface represents the data containing the specific information about an objective
 */
interface Objective {
  /**
   * Name of the method that validate the objective in PSDK quest system
   */
  objectiveMethodName: string;

  /**
   * Argument for the objective validation method & text format method
   */
  objectiveMethodArgs: (string | number)[];

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
interface Earning {
  /**
   * Name of the method called in PSDK quest system when the earning is obtained
   */
  earningMethodName: string;

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
   * If the quest is a primary quest
   */
  @jsonMember(Boolean)
  isPrimary!: boolean;

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
}
