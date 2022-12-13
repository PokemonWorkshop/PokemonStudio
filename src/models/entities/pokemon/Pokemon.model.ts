import { jsonMember, jsonObject, jsonArrayMember, TypedJSON } from 'typedjson';
import PokemonForm from './PokemonForm';
import PSDKEntity from '../PSDKEntity';
import { ProjectData, TextsWithLanguageConfig } from '@src/GlobalStateProvider';
import { getText, setText } from '@utils/ReadingProjectText';
import { padStr } from '@utils/PadStr';
import { findFirstAvailableId } from '@utils/ModelUtils';

export const FormCategories = ['classic', 'mega-evolution'] as const;
export type FormCategory = typeof FormCategories[number];

/**
 * This class represents the model of the Pokémon.
 */
@jsonObject
export default class PokemonModel implements PSDKEntity {
  static klass = 'Specie';

  /**
   * The class of the Pokémon.
   */
  @jsonMember(String)
  klass!: string;

  /**
   * The id of the Pokémon.
   */
  @jsonMember(Number)
  id!: number;

  /**
   * The db_symbol of the Pokémon.
   */
  @jsonMember(String)
  dbSymbol!: string;

  /**
   * The forms of the Pokémon
   */
  @jsonArrayMember(PokemonForm)
  forms!: PokemonForm[];

  /**
   * Text of the project
   */
  public projectText?: TextsWithLanguageConfig;

  /**
   * Get the default values
   */
  static defaultValues = () => {
    const form = new PokemonForm();
    Object.assign(form, PokemonForm.defaultValues());
    return {
      klass: PokemonModel.klass,
      id: 0,
      dbSymbol: 'new_pokemon',
      forms: [form],
    };
  };

  /**
   * Get the description of the Pokémon
   * @returns The description of the Pokémon
   */
  descr = () => {
    if (!this.projectText) return `description of ${this.dbSymbol}`;
    return getText(this.projectText, 2, this.id);
  };

  /**
   * Set the description of the Pokémon
   * @param name
   * @returns
   */
  setDescr = (name: string) => {
    if (!this.projectText) return;
    return setText(this.projectText, 2, this.id, name);
  };

  /**
   * Get the name of the Pokémon
   * @returns The name of the Pokémon
   */
  name = () => {
    if (!this.projectText) return `name of ${this.dbSymbol}`;
    return getText(this.projectText, 0, this.id);
  };

  /**
   * Set the name of the Pokémon
   * @param name
   * @returns
   */
  setName = (name: string) => {
    if (!this.projectText) return;
    return setText(this.projectText, 0, this.id, name);
  };

  /**
   * Get the species of the Pokémon
   * @returns The species of the Pokémon
   */
  species = () => {
    if (!this.projectText) return `species of ${this.dbSymbol}`;
    return getText(this.projectText, 1, this.id);
  };

  /**
   * Set the species of the Pokémon
   * @param name
   * @returns
   */
  setSpecies = (name: string) => {
    if (!this.projectText) return;
    return setText(this.projectText, 1, this.id, name);
  };

  /**
   * Clone the object
   */
  clone = (): PokemonModel => {
    this.forms.map((form) => form.beforeSerializationMoveSet());
    const newObject = new TypedJSON(PokemonModel).parse(JSON.stringify(this));
    if (!newObject) throw new Error('Could not clone object');

    newObject.projectText = this.projectText;
    return newObject as PokemonModel;
  };

  /**
   * Create a new Pokémon with default values
   * @param allPokemon The project data containing the Pokémon
   * @returns The new Pokémon
   */
  static createPokemon = (allPokemon: ProjectData['pokemon']): PokemonModel => {
    const newPokemon = new PokemonModel();
    Object.assign(newPokemon, PokemonModel.defaultValues());
    newPokemon.forms[0].onDeserializedMoveSet();
    newPokemon.id = findFirstAvailableId(allPokemon, 1);
    newPokemon.dbSymbol = '';
    newPokemon.forms[0].babyDbSymbol = '';
    return newPokemon;
  };
}

export const pokemonSpritePath = (species: PokemonModel, form?: number) => {
  if (form) return `graphics/pokedex/pokefront/${padStr(species.id, 3)}_${padStr(form, 2)}.png`;

  return `graphics/pokedex/pokefront/${padStr(species.id, 3)}.png`;
};

export const pokemonIconPath = (species: PokemonModel, form?: number) => {
  if (form) return `graphics/pokedex/pokeicon/${padStr(species.id, 3)}_${padStr(form, 2)}.png`;

  return `graphics/pokedex/pokeicon/${padStr(species.id, 3)}.png`;
};
