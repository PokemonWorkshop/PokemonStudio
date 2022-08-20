import PSDKConfig from '@modelEntities/PSDKConfig';
import { cleanNaNValue } from '@utils/cleanNaNValue';
import { jsonMember, jsonObject, TypedJSON } from 'typedjson';

/**
 * This class represents the settings config.
 */
@jsonObject
export default class SettingsConfigModel implements PSDKConfig {
  static klass = 'Configs::Project::Settings';

  /**
   * The class of the settings config.
   */
  @jsonMember(String)
  klass!: string;

  /**
   * The pokemon max level
   */
  @jsonMember(Number)
  pokemonMaxLevel!: number;

  /**
   * If the Pokemon always rely on form 0 for evolution
   */
  @jsonMember(Boolean)
  isAlwaysUseForm0ForEvolution!: boolean;

  /**
   * If the Pokemon can use form 0 when no evolution data is found in current form
   */
  @jsonMember(Boolean)
  isUseForm0WhenNoEvolutionData!: boolean;

  /**
   * Number of same item the player can have (0 = infinite)
   */
  @jsonMember(Number)
  maxBagItemCount!: number;

  /**
   * Clone the object
   */
  clone = (): SettingsConfigModel => {
    const newObject = new TypedJSON(SettingsConfigModel).parse(JSON.stringify(this));
    if (!newObject) throw new Error('Could not clone object');

    return newObject as SettingsConfigModel;
  };

  /**
   * Cleaning NaN values in number properties
   */
  cleaningNaNValues = () => {
    this.pokemonMaxLevel = cleanNaNValue(this.pokemonMaxLevel, 100);
    this.maxBagItemCount = cleanNaNValue(this.maxBagItemCount);
  };
}
