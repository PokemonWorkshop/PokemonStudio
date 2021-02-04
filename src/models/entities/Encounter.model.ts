/**
 * This interface represents an encounter with a Pokemon (wild or trainer).
 */
export default interface Encounter {
  /**
   * The specie of the Pokemon.
   */
  specie: string;

  /**
   * The index of the form.
   */
  formIndex: number;

  /**
   * Shiny setup.
   */
  shinySetup: ShinySetup;

  /**
   * Level setup.
   */
  levelSetup: LevelSetup;

  /**
   * The given name of the Pokemon.
   */
  givenName: string;

  /**
   * The db_symbol of the ball uses to catch the Pokemon.
   */
  caughtWith: string;

  /**
   * The gender of the Pokemon.
   */
  gender: number;

  /**
   * The nature ID of the Pokemon.
   */
  nature: number;

  /**
   * The Pokemon IVs list.
   */
  ivs: IEv[];

  /**
   * The Pokemon EVs list.
   */
  evs: IEv[];

  /**
   * The db_symbol of item held by the Pokemon.
   */
  itemHeld: string;

  /**
   * The db_symbol of the ability of the Pokemon.
   */
  ability: number;

  /**
   * The rareness of the Pokemon.
   */
  rareness: number;

  /**
   * The loyalty of the Pokemon.
   */
  loyalty: number;

  /**
   * The list of the moves (db_symbol) of the Pokemon.
   */
  moves: string[];

  /**
   * The original trainer name of the Pokemon.
   */
  originalTrainerName: string;

  /**
   * The original trainer id of the Pokemon.
   */
  originalTrainerId: string;
}

/**
 * This interface represents the shiny setup.
 */
interface ShinySetup {
  /**
   * Kind of the setup
   */
  kind: string;

  /**
   * The chance of the Pokemon to be shiny.
   */
  rate: number;
}

/**
 * This interface represents the level setup.
 */
interface LevelSetup {
  /**
   * Kind of the setup
   */
  kind: string;

  /**
   * The minimum level of the Pokemon encountered.
   */
  minimumLevel: number;

  /**
   * The maximum level of the Pokemon encountered.
   */
  maximumLevel: number;

  /**
   * The chance of encounter the Pokemon.
   */
  randomEncounterChance: number;
}

/**
 * This interface represents individual values or effort values.
 */
interface IEv {
  hp: number;
  atk: number;
  dfe: number;
  spd: number;
  ats: number;
  dfs: number;
}
