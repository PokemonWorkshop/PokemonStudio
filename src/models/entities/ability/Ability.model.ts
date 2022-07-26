import PSDKEntity from '@modelEntities/PSDKEntity';
import PokemonModel from '@modelEntities/pokemon/Pokemon.model';
import { ProjectData, TextsWithLanguageConfig, State } from '@src/GlobalStateProvider';
import { getText, setText } from '@utils/ReadingProjectText';
import { jsonMember, jsonObject, TypedJSON } from 'typedjson';
import { findFirstAvailableId, findFirstAvailableTextId } from '@utils/ModelUtils';

export type AbilityEditors = 'generic' | 'parameters';

/**
 * This class represents the model of the ability.
 */
@jsonObject
export default class AbilityModel implements PSDKEntity {
  static klass = 'Ability';

  public lockedEditors: AbilityEditors[] = ['parameters'];

  /**
   * The class of the ability.
   */
  @jsonMember(String)
  klass!: string;

  /**
   * The id of the ability.
   */
  @jsonMember(Number)
  id!: number;

  /**
   * The db_symbol of the ability.
   */
  @jsonMember(String)
  dbSymbol!: string;

  /**
   * The text id of the ability
   */
  @jsonMember(Number)
  textId!: number;

  /**
   * Text of the project
   */
  public projectText?: TextsWithLanguageConfig;

  /**
   * Get the default values
   */
  static defaultValues = () => ({
    klass: AbilityModel.klass,
    id: 0,
    dbSymbol: 'new_ability',
    textId: 0,
  });

  /**
   * Get the description of the ability
   * @returns The description of the ability
   */
  descr = () => {
    if (!this.projectText) return `description of ${this.dbSymbol}`;
    return getText(this.projectText, 5, this.textId);
  };

  /**
   * Set the description of the ability
   * @param name
   * @returns
   */
  setDescr = (descr: string) => {
    if (!this.projectText) return;
    return setText(this.projectText, 5, this.textId, descr);
  };

  /**
   * Get the name of the ability
   * @returns The name of the ability
   */
  name = () => {
    if (!this.projectText) return `name of ${this.dbSymbol}`;
    return getText(this.projectText, 4, this.textId);
  };

  /**
   * Set the name of the ability
   * @param name
   * @returns
   */
  setName = (name: string) => {
    if (!this.projectText) return;
    return setText(this.projectText, 4, this.textId, name);
  };

  /**
   * Clone the object
   */
  clone = (): AbilityModel => {
    const newObject = new TypedJSON(AbilityModel).parse(JSON.stringify(this));
    if (!newObject) throw new Error('Could not clone object');

    newObject.projectText = this.projectText;
    return newObject as AbilityModel;
  };

  /**
   * Get all the Pokemon with the current ability
   */
  getAllPokemonWithCurrentAbility = (state: State): PokemonModel[] => {
    return Object.values(state.projectData.pokemon)
      .filter((pokemon) =>
        pokemon.forms.find(
          (form) => form.abilities[0] === this.dbSymbol || form.abilities[1] === this.dbSymbol || form.abilities[2] === this.dbSymbol
        )
      )
      .sort((a, b) => a.id - b.id);
  };

  /**
   * Create a new ability with default values
   * @param allAbilities The project data containing the abilities
   * @returns The new ability
   */
  static createAbility = (allAbilities: ProjectData['abilities']): AbilityModel => {
    const newAbility = new AbilityModel();
    Object.assign(newAbility, AbilityModel.defaultValues());
    newAbility.id = findFirstAvailableId(allAbilities, 1);
    newAbility.dbSymbol = '';
    newAbility.textId = findFirstAvailableTextId(allAbilities);
    return newAbility;
  };
}
