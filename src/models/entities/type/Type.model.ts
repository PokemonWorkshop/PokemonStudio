import MoveModel from '@modelEntities/move/Move.model';
import PokemonModel from '@modelEntities/pokemon/Pokemon.model';
import { ProjectData, TextsWithLanguageConfig, State } from '@src/GlobalStateProvider';
import { findFirstAvailableId, findFirstAvailableTextId } from '@utils/ModelUtils';
import { getText, setText } from '@utils/ReadingProjectText';
import { AnyT, jsonArrayMember, jsonMember, jsonObject, TypedJSON } from 'typedjson';
import PSDKEntity from '../PSDKEntity';

/**
 * This interface gives the defensive type and the associated damage multiplier.
 */
interface DamageTo {
  /**
   * The defensive type.
   */
  defensiveType: string;

  /**
   * Return the damage multiplier.
   */
  factor: number;
}

type TypeFactorList = {
  high: TypeModel[];
  low: TypeModel[];
  zero: TypeModel[];
};

type EfficiencyType = 'high_efficience' | 'low_efficience' | 'zero_efficience' | 'neutral';

const getTypesFromFactor = (allTypes: TypeModel[], damageTo: DamageTo[], factor: number) =>
  damageTo
    .filter((dmg) => dmg.factor === factor)
    .map((dmg) => allTypes.find((type) => type.dbSymbol === dmg.defensiveType))
    .filter<TypeModel>((type): type is TypeModel => type !== undefined);

const getTypesFromFactorInOtherTypes = (allTypes: TypeModel[], typeDbSymbol: string, factor: number) =>
  allTypes.filter((type) => type.damageTo.find((dmg) => dmg.defensiveType === typeDbSymbol && dmg.factor === factor));

/**
 * This class represents a type.
 */
@jsonObject({
  onDeserialized: 'onDeserialized',
})
export default class TypeModel implements PSDKEntity {
  static klass = 'Type';

  /**
   * The class of the type.
   */
  @jsonMember(String)
  klass!: string;

  /**
   * The id of the type.
   */
  @jsonMember(Number)
  id!: number;

  /**
   * The db_symbol of the type.
   */
  @jsonMember(String)
  dbSymbol!: string;

  /**
   * ID of the text that gives the type name.
   */
  @jsonMember(Number)
  textId!: number;

  /**
   * A list containing the defensive types and the associated damage multipliers.
   */
  @jsonArrayMember(AnyT)
  damageTo!: DamageTo[];

  /**
   * The color of the type
   */
  @jsonMember(String)
  color!: string | undefined;

  /**
   * Text of the project
   */
  public projectText?: TextsWithLanguageConfig;

  /**
   * Get the default values
   */
  static defaultValues = () => ({
    klass: TypeModel.klass,
    id: 0,
    dbSymbol: 'new_type',
    textId: 0,
    color: '#C3B5B2',
    damageTo: [],
  });

  /**
   * Clone the object
   */
  clone = (): TypeModel => {
    const newObject = new TypedJSON(TypeModel).parse(JSON.stringify(this));
    if (!newObject) throw new Error('Could not clone object');

    newObject.projectText = this.projectText;
    return newObject as TypeModel;
  };

  /**
   * Get the name of the type
   * @return The name of the type
   */
  name = () => {
    if (!this.projectText) return `name of ${this.dbSymbol}`;
    return getText(this.projectText, 3, this.textId);
  };

  /**
   * Set the name of the type
   */
  setName = (name: string) => {
    if (!this.projectText) return;
    return setText(this.projectText, 3, this.textId, name);
  };

  /**
   * Get the efficiencies of the type against other types
   */
  getEfficiencies(allTypes: TypeModel[]): TypeFactorList {
    return {
      high: getTypesFromFactor(allTypes, this.damageTo, 2.0),
      low: getTypesFromFactor(allTypes, this.damageTo, 0.5),
      zero: getTypesFromFactor(allTypes, this.damageTo, 0),
    };
  }

  /**
   * Get the resistances
   */
  getResistances(allTypes: TypeModel[]): TypeFactorList {
    return {
      high: getTypesFromFactorInOtherTypes(allTypes, this.dbSymbol, 0.5),
      low: getTypesFromFactorInOtherTypes(allTypes, this.dbSymbol, 2),
      zero: getTypesFromFactorInOtherTypes(allTypes, this.dbSymbol, 0),
    };
  }

  /**
   * Get all the moves with the current type
   */
  getMovesWithCurrentType(state: State): MoveModel[] {
    return Object.values(state.projectData.moves)
      .filter((move) => move.type === this.dbSymbol)
      .sort((a, b) => a.id - b.id);
  }

  /**
   * Get all the Pokemon with the current type
   */
  getAllPokemonWithCurrentType(state: State): PokemonModel[] {
    return Object.values(state.projectData.pokemon)
      .filter((pokemon) => pokemon.forms.find((form) => form.type1 === this.dbSymbol || form.type2 === this.dbSymbol))
      .sort((a, b) => a.id - b.id);
  }

  /**
   * Get the color of the type
   * @returns The color of type (return the db_symbol of the type for the base types or hex value color otherwise)
   */
  getColor(): string {
    return this.color === undefined ? this.dbSymbol : this.color;
  }

  /**
   * Call when the object is deserialized
   */
  onDeserialized = (): void => {
    this.damageTo = this.damageTo.filter((damage) => damage.factor !== null);
  };

  /**
   * Create a new type with default values
   * @param allTypes The project data containing the types
   * @returns The new type
   */
  static createType = (allTypes: ProjectData['types']): TypeModel => {
    const newType = new TypeModel();
    Object.assign(newType, TypeModel.defaultValues());
    newType.id = findFirstAvailableId(allTypes, 1);
    newType.textId = findFirstAvailableTextId(allTypes);
    newType.dbSymbol = '';
    return newType;
  };

  /**
   * The efficiency of offensive type againt defensive type
   * @param offensiveType The offensive type
   * @param defensiveType The defensive type
   * @param allTypes The project data containing the types
   * @returns The efficiency
   */
  static getEfficiency = (offensiveType: TypeModel, defensiveType: TypeModel, allTypes: TypeModel[]): EfficiencyType => {
    const { high, low, zero } = offensiveType.getEfficiencies(allTypes);
    if (high.includes(defensiveType)) return 'high_efficience';
    if (low.includes(defensiveType)) return 'low_efficience';
    if (zero.includes(defensiveType)) return 'zero_efficience';
    return 'neutral';
  };
}
