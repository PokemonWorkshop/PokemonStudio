import { jsonMember, jsonObject, jsonArrayMember } from 'typedjson';
import PokemonForm from './PokemonForm';
import PSDKEntity from '../PSDKEntity';

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
  @jsonMember(String, { preserveNull: true })
  dbSymbol!: string | null;

  /**
   * The forms of the Pokémon
   */
  @jsonArrayMember(PokemonForm)
  forms!: PokemonForm[];
}
