/* eslint-disable @typescript-eslint/no-explicit-any */
import { jsonMember, jsonObject, jsonArrayMember, AnyT } from 'typedjson';

/**
 * This interface represents an item held by the Pokémon.
 */
interface ItemHeld {
  /**
   * db_symbol of the item held.
   */
  dbSymbol: string;

  /**
   * Chance of obtaining the item.
   */
  chance: number;
}

/**
 * This interface represents a move from a Pokémon learned by level up.
 */
interface LevelLearnableMove {
  /**
   * The class of the LevelLearnableMove
   */
  klass: string;

  /**
   * db_symbol of the move
   */
  move: string;

  /**
   * Level of move learning
   */
  level: number;
}

/**
 * This interface represents a move from a Pokémon learned by breeding, tech, tutor or evolution.
 */
interface LearnableMove {
  /**
   * The class of the LearnableMove
   */
  klass: string;

  /**
   * db_symbol of the move
   */
  move: string;
}

/**
 * This interface represents the special evolution of a Pokemon
 */
interface SpecialEvolution {
  /**
   * db_symbol of the evolution
   */
  dbSymbol: string;

  /**
   * The minimum level required for the evolution
   */
  minLevel: number;

  /**
   * The maximum level authorized for the evolution
   */
  maxLevel: number;

  /**
   * db_symbol of the Pokemon required in the trade to triggered the evolution
   */
  tradeWith: string;

  /**
   * db_symbol of the evolution triggered by a trade
   */
  trade: string;

  /**
   * db_symbol of the stone
   */
  stone: string;

  /**
   * db_symbol of the item hold
   */
  itemHold: string;

  /**
   * The minimum loyalty required for the evolution
   */
  minLoyalty: number;

  /**
   * The maximum loyalty authorized for the evolution
   */
  maxLoyalty: number;

  /**
   * Evolution by skill learned
   */
  skill1: string;

  /**
   * Evolution by skill learned
   */
  skill2: string;

  /**
   * Evolution by skill learned
   */
  skill3: string;

  /**
   * Evolution by skill learned
   */
  skill4: string;

  /**
   * db_symbol of the the weather
   */
  weather: string;

  /**
   * Evolution according to the player's position on a specific tag (db_symbol)
   */
  env: string;

  /**
   * The gender required for the evolution
   */
  gender: number;

  /**
   * Evolution depending on the time of day
   */
  dayNight: number;

  /**
   * Evolution by function call
   */
  func: string;

  /**
   * Evolution according to the map where the player is
   */
  maps: number[];
}

@jsonObject({
  beforeSerialization: 'beforeSerializationMoveSet',
  onDeserialized: 'onDeserializedMoveSet',
})
/**
 * This class represents the form of the Pokémon.
 */
@jsonObject
export default class PokemonForm {
  /**
   * Current form of the Pokemon.
   */
  @jsonMember(Number)
  form!: number;

  /**
   * Height of the Pokemon in metter.
   */
  @jsonMember(Number)
  height!: number;

  /**
   * Weight of the Pokemon in Kg.
   */
  @jsonMember(Number)
  weight!: number;

  /**
   * First type of the Pokemon.
   */
  @jsonMember(String)
  type1!: string;

  /**
   * Second type of the Pokemon.
   */
  @jsonMember(String)
  type2!: string;

  /**
   * HP statistic of the Pokemon.
   */
  @jsonMember(Number)
  baseHp!: number;

  /**
   * ATK statistic of the Pokemon.
   */
  @jsonMember(Number)
  baseAtk!: number;

  /**
   * DFE statistic of the Pokemon.
   */
  @jsonMember(Number)
  baseDfe!: number;

  /**
   * SPD statistic of the Pokemon.
   */
  @jsonMember(Number)
  baseSpd!: number;

  /**
   * ATS statistic of the Pokemon.
   */
  @jsonMember(Number)
  baseAts!: number;

  /**
   * DFS statistic of the Pokemon.
   */
  @jsonMember(Number)
  baseDfs!: number;

  /**
   * HP EVs givent by the Pokemon when defeated.
   */
  @jsonMember(Number)
  evHp!: number;

  /**
   * ATK EVs givent by the Pokemon when defeated.
   */
  @jsonMember(Number)
  evAtk!: number;

  /**
   * DFE EVs givent by the Pokemon when defeated.
   */
  @jsonMember(Number)
  evDfe!: number;

  /**
   * SPD EVs givent by the Pokemon when defeated.
   */
  @jsonMember(Number)
  evSpd!: number;

  /**
   * ATS EVs givent by the Pokemon when defeated.
   */
  @jsonMember(Number)
  evAts!: number;

  /**
   * DFS EVs givent by the Pokemon when defeated.
   */
  @jsonMember(Number)
  evDfs!: number;

  /**
   * ID of the Pokemon after its evolution.
   */
  @jsonMember(Number)
  evolutionId!: number;

  /**
   * Level when the Pokemon can naturally evolve.
   */
  @jsonMember(Number, { preserveNull: true })
  evolutionLevel!: number | null;

  /**
   * Special evolution informations.
   */
  @jsonArrayMember(AnyT, { preserveNull: true })
  specialEvolutions!: SpecialEvolution[] | null;

  /**
   * Index of the Pokemon exp curve.
   */
  @jsonMember(Number)
  experienceType!: number;

  /**
   * Base experience the Pokemon give when defeated (used in the exp caculation).
   */
  @jsonMember(Number)
  baseExperience!: number;

  /**
   * Loyalty the Pokemon has at the begining.
   */
  @jsonMember(Number)
  baseLoyalty!: number;

  /**
   * Catch rate of the Pokemon, between 0 and 255.
   */
  @jsonMember(Number)
  catchRate!: number;

  /**
   * Chance in % the Pokemon has to be a female, if -1 it'll have no gender.
   */
  @jsonMember(Number)
  femaleRate!: number;

  /**
   * The two groupes of compatibility for breeding.
   */
  @jsonArrayMember(Number)
  breedGroups!: number[];

  /**
   * Number of step before the egg hatch.
   */
  @jsonMember(Number)
  hatchSteps!: number;

  /**
   * ID of the baby the Pokemon can have while breeding.
   */
  @jsonMember(Number)
  babyId!: number;

  /**
   * List of items with change (in percent) the Pokemon can have when generated
   */
  @jsonArrayMember(AnyT)
  itemHeld!: ItemHeld[];

  /**
   * List of ability db_symbol the Pokemon can have [common, rare, ultra rare].
   */
  @jsonArrayMember(String)
  abilities!: string[];

  /**
   * Front offset y of the Pokemon for Summary & Pokédex.
   */
  @jsonMember(Number)
  frontOffsetY!: number;

  /**
   * List of moves the Pokémon can learn.
   */
  @jsonArrayMember(AnyT)
  private moveSet!: any[];

  /**
   * List of moves the Pokemon can learn by level.
   */
  levelLearnableMove!: LevelLearnableMove[];

  /**
   * List of moves (id in the database) the Pokemon can learn from a NPC.
   */
  tutorLearnableMove!: LearnableMove[];

  /**
   * List of moves (id in the database) the Pokemon can learn by using HM and TM.
   */
  techLearnableMove!: LearnableMove[];

  /**
   * List of move ID the Pokemon can have after hatching if one of its parent has the move.
   */
  breedLearnableMove!: LearnableMove[];

  /**
   * List of moves the Pokemon can learn by evolution.
   */
  evolutionLearnableMove!: LearnableMove[];

  /**
   * Split the Pokémon's moveset into different lists.
   */
  onDeserializedMoveSet(): void {
    this.levelLearnableMove = this.moveSet.filter(
      (data: any) => data.klass === 'LevelLearnableMove'
    );
    this.tutorLearnableMove = this.moveSet.filter(
      (data: any) => data.klass === 'TutorLearnableMove'
    );
    this.techLearnableMove = this.moveSet.filter(
      (data: any) => data.klass === 'TechLearnableMove'
    );
    this.breedLearnableMove = this.moveSet.filter(
      (data: any) => data.klass === 'BreedLearnableMove'
    );
    this.evolutionLearnableMove = this.moveSet.filter(
      (data: any) => data.klass === 'EvolutionLearnableMove'
    );
  }

  /**
   * Build Pokémon moveset
   */
  beforeSerializationMoveSet(): void {
    this.moveSet = this.levelLearnableMove;
    this.moveSet = this.moveSet
      .concat(this.tutorLearnableMove)
      .concat(this.techLearnableMove)
      .concat(this.breedLearnableMove)
      .concat(this.evolutionLearnableMove);
  }
}
