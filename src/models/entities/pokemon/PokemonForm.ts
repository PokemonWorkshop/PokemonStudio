import { cleanNaNValue } from '@utils/cleanNaNValue';
import { jsonMember, jsonObject, jsonArrayMember, AnyT } from 'typedjson';

/**
 * This type represents an item held by the Pokémon.
 */
export type ItemHeld = {
  /**
   * db_symbol of the item held.
   */
  dbSymbol: string;

  /**
   * Chance of obtaining the item.
   */
  chance: number;
};

/**
 * This type represents a move from a Pokémon learned by breeding, tech, tutor or evolution.
 */
export type LearnableMove = {
  /**
   * The class of the LearnableMove
   */
  klass: string;

  /**
   * db_symbol of the move
   */
  move: string;
};

/**
 * This type represents a move from a Pokémon learned by level up.
 */
export type LevelLearnableMove = {
  /**
   * Level of move learning
   */
  level: number;
} & LearnableMove;

export type EvolutionCondition =
  | {
      /**
       * The minimum level required for the evolution
       */
      type: 'minLevel';
      value: number;
    }
  | {
      /**
       * The maximum level authorized for the evolution
       */
      type: 'maxLevel';
      value: number;
    }
  | {
      /**
       * db_symbol of the Pokemon required in the trade to triggered the evolution
       */
      type: 'tradeWith';
      value: string;
    }
  | {
      /**
       * db_symbol of the evolution triggered by a trade
       */
      type: 'trade';
      value: true;
    }
  | {
      /**
       * db_symbol of the stone
       */
      type: 'stone';
      value: string;
    }
  | {
      /**
       * db_symbol of the item hold
       */
      type: 'itemHold';
      value: string;
    }
  | {
      /**
       * The minimum loyalty required for the evolution
       */
      type: 'minLoyalty';
      value: number;
    }
  | {
      /**
       * The maximum loyalty authorized for the evolution
       */
      type: 'maxLoyalty';
      value: number;
    }
  | {
      /**
       * Evolution by skill learned
       */
      type: 'skill1';
      value: string;
    }
  | {
      /**
       * Evolution by skill learned
       */
      type: 'skill2';
      value: string;
    }
  | {
      /**
       * Evolution by skill learned
       */
      type: 'skill3';
      value: string;
    }
  | {
      /**
       * Evolution by skill learned
       */
      type: 'skill4';
      value: string;
    }
  | {
      /**
       * db_symbol of the the weather
       */
      type: 'weather';
      value: string;
    }
  | {
      /**
       * Evolution according to the player's position on a specific tag (db_symbol)
       */
      type: 'env';
      value: number;
    }
  | {
      /**
       * The gender required for the evolution
       */
      type: 'gender';
      value: number;
    }
  | {
      /**
       * Evolution depending on the time of day
       */
      type: 'dayNight';
      value: number;
    }
  | {
      /**
       * Evolution by function call
       */
      type: 'func';
      value: string;
    }
  | {
      /**
       * Evolution according to the map where the player is
       */
      type: 'maps';
      value: number[];
    }
  | {
      /**
       * Gem responsive of mega evolve
       */
      type: 'gemme';
      value: string;
    }
  | {
      /**
       * Undesired condition, used internally
       */
      type: 'none';
      value: undefined;
    };

export type EvolutionConditionKeys = EvolutionCondition['type'];

// TODO: Add
// Si un interrupteur est activé // If a game switch is ON
// En fonction de la nature // Depending on the nature
// Avec une capacité de type // By having the move

export const EVOLUTION_CONDITION_KEYS: EvolutionConditionKeys[] = [
  'minLevel',
  'maxLevel',
  'stone',
  'trade',
  'tradeWith',
  'itemHold',
  'maxLoyalty',
  'minLoyalty',
  // 'move_kind',
  'skill1',
  'skill2',
  'skill3',
  'skill4',
  'weather',
  'env',
  'dayNight',
  'maps',
  'gender',
  // 'nature',
  // 'switch',
  'func',
  'gemme',
];

/**
 * This type represents the evolution of a Pokemon
 */
export type Evolution = {
  /**
   * db_symbol of the evolution
   */
  dbSymbol?: string;

  /**
   * The form of the Pokemon of the evolution
   */
  form: number;

  /**
   * The condition of the evolution
   */
  conditions: EvolutionCondition[];
};

/**
 * This class represents the form of the Pokémon.
 */
@jsonObject({
  beforeSerialization: 'beforeSerializationMoveSet',
  onDeserialized: 'onDeserializedMoveSet',
})
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
   * Special evolution informations.
   */
  @jsonArrayMember(AnyT)
  evolutions!: Evolution[];

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
   * dbSymbol of the baby the Pokemon can have while breeding. Equals to \_\_undef\_\_ if no baby
   */
  @jsonMember(String)
  babyDbSymbol!: string;

  /**
   * id of the form of the baby the Pokemon can have while breeding
   */
  @jsonMember(Number)
  babyForm!: number;

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
  private moveSet!: LearnableMove[];

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
    this.levelLearnableMove = this.moveSet.filter((data) => data.klass === 'LevelLearnableMove') as LevelLearnableMove[];
    this.tutorLearnableMove = this.moveSet.filter((data) => data.klass === 'TutorLearnableMove');
    this.techLearnableMove = this.moveSet.filter((data) => data.klass === 'TechLearnableMove');
    this.breedLearnableMove = this.moveSet.filter((data) => data.klass === 'BreedLearnableMove');
    this.evolutionLearnableMove = this.moveSet.filter((data) => data.klass === 'EvolutionLearnableMove');
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

  /**
   * Get the default breeding groups
   */
  breedingGroups(): string[] {
    const groups = [
      'undefined',
      'monster',
      'water_1',
      'bug',
      'flying',
      'field',
      'fairy',
      'grass',
      'human_like',
      'water_3',
      'mineral',
      'amorphous',
      'water_2',
      'ditto',
      'dragon',
      'unknown',
    ];

    return this.breedGroups.map((group) => groups[group]);
  }

  /**
   * Add a new move in level learnable movepool
   * @param dbSymbol The dbSymbol of the move
   * @param level The level of the Pokémon to learn the move
   */
  setLevelLearnableMove(dbSymbol: string, level: number) {
    this.levelLearnableMove.push({
      klass: 'LevelLearnableMove',
      move: dbSymbol,
      level: level,
    });
  }

  /**
   * Add a new move in tutor learnable movepool
   * @param dbSymbol The dbSymbol of the move
   */
  setTutorLearnableMove(dbSymbol: string) {
    this.tutorLearnableMove.push({ klass: 'TutorLearnableMove', move: dbSymbol });
  }

  /**
   * Add a new move in tech learnable movepool
   * @param dbSymbol The dbSymbol of the move
   */
  setTechLearnableMove(dbSymbol: string) {
    this.techLearnableMove.push({ klass: 'TechLearnableMove', move: dbSymbol });
  }

  /**
   * Add a new move in breeding learnable movepool
   * @param dbSymbol The dbSymbol of the move
   */
  setBreedLearnableMove(dbSymbol: string) {
    this.breedLearnableMove.push({ klass: 'BreedLearnableMove', move: dbSymbol });
  }

  /**
   * Add a new move in evolution learnable movepool
   * @param dbSymbol The dbSymbol of the move
   */
  setEvolutionLearnableMove(dbSymbol: string) {
    this.evolutionLearnableMove.push({ klass: 'EvolutionLearnableMove', move: dbSymbol });
  }

  /**
   * Create default values for item held
   */
  static defaultValuesItemHeld = (): ItemHeld[] => [
    {
      dbSymbol: 'none',
      chance: 0,
    },
    {
      dbSymbol: 'none',
      chance: 0,
    },
  ];

  /**
   * Get the default values
   */
  static defaultValues = () => ({
    form: 0,
    height: 0,
    weight: 0,
    type1: 'normal',
    type2: '__undef__',
    baseHp: 100,
    baseAtk: 100,
    baseDfe: 100,
    baseSpd: 100,
    baseAts: 100,
    baseDfs: 100,
    evHp: 0,
    evAtk: 0,
    evDfe: 0,
    evSpd: 0,
    evAts: 0,
    evDfs: 0,
    evolutions: [],
    experienceType: 0,
    baseExperience: 40,
    baseLoyalty: 70,
    catchRate: 45,
    femaleRate: 50,
    breedGroups: [0, 0],
    hatchSteps: 1024,
    babyDbSymbol: 'new_pokemon',
    babyForm: 0,
    itemHeld: PokemonForm.defaultValuesItemHeld(),
    abilities: ['__undef__', '__undef__', '__undef__'],
    frontOffsetY: 0,
    moveSet: [],
  });

  /**
   * Change the default value of the item held
   * @param defaultValue The default value (__undef__ or none)
   */
  changeDefaultValueItemHeld = (defaultValue: '__undef__' | 'none') => {
    this.itemHeld.forEach((itemHeld) => {
      if (itemHeld.dbSymbol === '__undef__' || itemHeld.dbSymbol === 'none') itemHeld.dbSymbol = defaultValue;
    });
  };

  /**
   * Cleaning NaN values in number properties
   */
  cleaningNaNValues = () => {
    this.catchRate = cleanNaNValue(this.catchRate);
    this.hatchSteps = cleanNaNValue(this.hatchSteps);
    this.baseExperience = cleanNaNValue(this.baseExperience, 1);
    this.baseLoyalty = cleanNaNValue(this.baseLoyalty);
    this.baseHp = cleanNaNValue(this.baseHp);
    this.baseAtk = cleanNaNValue(this.baseAtk);
    this.baseDfe = cleanNaNValue(this.baseDfe);
    this.baseAts = cleanNaNValue(this.baseAts);
    this.baseDfs = cleanNaNValue(this.baseDfs);
    this.baseSpd = cleanNaNValue(this.baseSpd);
    this.evHp = cleanNaNValue(this.evHp);
    this.evAtk = cleanNaNValue(this.evAtk);
    this.evDfe = cleanNaNValue(this.evDfe);
    this.evAts = cleanNaNValue(this.evAts);
    this.evDfs = cleanNaNValue(this.evDfs);
    this.evSpd = cleanNaNValue(this.evSpd);
    this.itemHeld.forEach((itemHeld) => (itemHeld.chance = cleanNaNValue(itemHeld.chance)));
  };
}
