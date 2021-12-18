import { ProjectData } from '@src/GlobalStateProvider';
import { assertUnreachable } from '@utils/assertUnreachable';
import { cleanNaNValue } from '@utils/cleanNaNValue';

export const GenderCategories = [-1, 0, 1, 2] as const;
export const ShinyCategories = ['default', 'always', 'never', 'custom'] as const;
export type ShinyCategory = typeof ShinyCategories[number];

export type ExpandPokemonSetup =
  | {
      /**
       * The given name of the Pokemon.
       */
      type: 'givenName';
      value: string;
    }
  | {
      /**
       * The db_symbol of the ball uses to catch the Pokemon.
       */
      type: 'caughtWith';
      value: string;
    }
  | {
      /**
       * The gender of the Pokemon.
       */
      type: 'gender';
      value: number;
    }
  | {
      /**
       * The nature of the Pokemon.
       */
      type: 'nature';
      value: string;
    }
  | {
      /**
       * The Pokemon IVs list.
       */
      type: 'ivs';
      value: IEv;
    }
  | {
      /**
       * The Pokemon EVs list.
       */
      type: 'evs';
      value: IEv;
    }
  | {
      /**
       * The db_symbol of item held by the Pokemon.
       */
      type: 'itemHeld';
      value: string;
    }
  | {
      /**
       * The db_symbol of the ability of the Pokemon.
       */
      type: 'ability';
      value: string;
    }
  | {
      /**
       * The rareness of the Pokemon.
       */
      type: 'rareness';
      value: number;
    }
  | {
      /**
       * The loyalty of the Pokemon.
       */
      type: 'loyalty';
      value: number;
    }
  | {
      /**
       * The list of the moves (db_symbol) of the Pokemon.
       */
      type: 'moves';
      value: string[];
    }
  | {
      /**
       * The original trainer name of the Pokemon.
       */
      type: 'originalTrainerName';
      value: string;
    }
  | {
      /**
       * The original trainer id of the Pokemon.
       */
      type: 'originalTrainerId';
      value: number;
    };

export type ExpandPokemonSetupKeys = ExpandPokemonSetup['type'];

export const ShinySetupTypes = ['automatic', 'rate'] as const;
export type ShinySetupType = typeof ShinySetupTypes[number];

/**
 * This interface represents an encounter with a Pokemon (wild or trainer).
 */
export default interface Encounter {
  /**
   * The specie of the Pokemon.
   */
  specie: string;

  /**
   * The form of the Pokemon.
   */
  form: number;

  /**
   * Shiny setup.
   */
  shinySetup: ShinySetup;

  /**
   * Level setup.
   */
  levelSetup: LevelSetup;

  /**
   * The chance of encounter the Pokemon.
   */
  randomEncounterChance: number;

  /**
   * The Pokemon setup with the extended data.
   */
  expandPokemonSetup: ExpandPokemonSetup[];
}

/**
 * This type represents the shiny setup.
 */
export type ShinySetup = {
  /**
   * Kind of the setup
   */
  kind: ShinySetupType;

  /**
   * The chance of the Pokemon to be shiny.
   */
  rate: number;
};

export type LevelMinMax = {
  /**
   * The minimum level of the Pokemon encountered.
   */
  minimumLevel: number;

  /**
   * The maximum level of the Pokemon encountered.
   */
  maximumLevel: number;
};

/**
 * This type represents the level setup.
 */
type LevelSetup =
  | {
      /**
       * Kind of the setup
       */
      kind: 'fixed';

      /**
       * The level of the Pokemon.
       */
      level: number;
    }
  | {
      /**
       * Kind of the setup
       */
      kind: 'minmax';

      /**
       * The level of the Pokemon.
       */
      level: LevelMinMax;
    };

export type LevelSetupKeys = LevelSetup['kind'];

/**
 * This type represents individual values or effort values.
 */
export type IEv = {
  hp: number;
  atk: number;
  dfe: number;
  spd: number;
  ats: number;
  dfs: number;
};

export const createExpandPokemonSetup = (type: ExpandPokemonSetupKeys): ExpandPokemonSetup => {
  switch (type) {
    case 'givenName':
    case 'originalTrainerName':
      return { type: type, value: '' };
    case 'ability':
      return { type: type, value: '__undef__' };
    case 'caughtWith':
      return { type: type, value: 'poke_ball' };
    case 'evs':
    case 'ivs':
      return { type: type, value: { hp: 0, atk: 0, dfe: 0, spd: 0, ats: 0, dfs: 0 } as IEv };
    case 'gender':
      return { type: type, value: -1 };
    case 'itemHeld':
      return { type: type, value: '__undef__' };
    case 'loyalty':
      return { type: type, value: 70 };
    case 'moves':
      return { type: type, value: ['__undef__', '__undef__', '__undef__', '__undef__'] };
    case 'nature':
      return { type: type, value: '__undef__' };
    case 'originalTrainerId':
      return { type: type, value: 0 };
    case 'rareness':
      return { type: type, value: -1 };
    default:
      assertUnreachable(type);
  }
  return { type: type, value: '' };
};

const defaultValuesExpandPokemonSetup = () => {
  const expandPokemonSetup: ExpandPokemonSetup[] = [];
  expandPokemonSetup.push(createExpandPokemonSetup('evs'));
  expandPokemonSetup.push(createExpandPokemonSetup('ivs'));
  expandPokemonSetup.push(createExpandPokemonSetup('itemHeld'));
  expandPokemonSetup.push(createExpandPokemonSetup('loyalty'));
  expandPokemonSetup.push(createExpandPokemonSetup('moves'));
  expandPokemonSetup.push(createExpandPokemonSetup('originalTrainerName'));
  expandPokemonSetup.push(createExpandPokemonSetup('originalTrainerId'));
  return expandPokemonSetup;
};

export const createEncounter = (isWild: boolean): Encounter => ({
  specie: '__undef__',
  form: 0,
  shinySetup: { kind: 'automatic', rate: -1 } as ShinySetup,
  levelSetup: (isWild ? { kind: 'minmax', level: { minimumLevel: 1, maximumLevel: 1 } } : { kind: 'fixed', level: 1 }) as LevelSetup,
  randomEncounterChance: 1,
  expandPokemonSetup: defaultValuesExpandPokemonSetup(),
});

const removeExpandPokemonSetup = (encounter: Encounter, type: ExpandPokemonSetupKeys) => {
  const index = encounter.expandPokemonSetup.findIndex((eps) => eps.type === type);
  if (index !== -1) encounter.expandPokemonSetup.splice(index, 1);
};

const removeExpandPokemonSetupWithCondition = (encounter: Encounter, type: ExpandPokemonSetupKeys, condition: string | number) => {
  const index = encounter.expandPokemonSetup.findIndex((eps) => eps.type === type && eps.value === condition);
  if (index !== -1) encounter.expandPokemonSetup.splice(index, 1);
};

export const createOptionalExpandPokemonSetup = (encounter: Encounter) => {
  const eps: ExpandPokemonSetupKeys[] = ['ability', 'nature', 'givenName', 'itemHeld', 'givenName', 'gender', 'caughtWith', 'rareness', 'ivs', 'evs'];
  eps.forEach(
    (key) => encounter.expandPokemonSetup.find((setup) => setup.type === key) || encounter.expandPokemonSetup.push(createExpandPokemonSetup(key))
  );
};

const cleanNanValueEncounter = (encounter: Encounter) => {
  if (encounter.shinySetup.kind === 'rate') encounter.shinySetup.rate = cleanNaNValue(encounter.shinySetup.rate, 0);
  cleanNaNValue(encounter.randomEncounterChance, 1);
  if (encounter.levelSetup.kind === 'fixed') encounter.levelSetup.level = cleanNaNValue(encounter.levelSetup.level, 1);
  else {
    encounter.levelSetup.level.minimumLevel = cleanNaNValue(encounter.levelSetup.level.minimumLevel, 1);
    encounter.levelSetup.level.maximumLevel = cleanNaNValue(encounter.levelSetup.level.maximumLevel, 1);
  }
  ['evs', 'ivs'].forEach((type) => {
    const ievs = encounter.expandPokemonSetup.find((eps) => eps.type === type)?.value as IEv;
    if (!ievs) return;
    ievs.atk = cleanNaNValue(ievs.atk, 0);
    ievs.ats = cleanNaNValue(ievs.ats, 0);
    ievs.dfe = cleanNaNValue(ievs.dfe, 0);
    ievs.dfs = cleanNaNValue(ievs.dfs, 0);
    ievs.spd = cleanNaNValue(ievs.spd, 0);
    ievs.hp = cleanNaNValue(ievs.hp, 0);
  });
  const loyalty = encounter.expandPokemonSetup.find((eps) => eps.type === 'loyalty');
  if (loyalty) loyalty.value = cleanNaNValue(loyalty.value as number, 70);
  const rareness = encounter.expandPokemonSetup.find((eps) => eps.type === 'rareness');
  if (rareness) rareness.value = cleanNaNValue(rareness.value as number, -1);
};

export const cleanExpandPokemonSetup = (encounter: Encounter, species: ProjectData['pokemon'], isWild: boolean) => {
  cleanNanValueEncounter(encounter);
  removeExpandPokemonSetupWithCondition(encounter, 'ability', '__undef__');
  removeExpandPokemonSetupWithCondition(encounter, 'nature', '__undef__');
  removeExpandPokemonSetupWithCondition(encounter, 'itemHeld', '__undef__');
  removeExpandPokemonSetupWithCondition(encounter, 'caughtWith', 'poke_ball');
  removeExpandPokemonSetupWithCondition(encounter, 'gender', -1);
  removeExpandPokemonSetupWithCondition(encounter, 'givenName', '');
  removeExpandPokemonSetupWithCondition(encounter, 'rareness', -1);
  const specie = species[encounter.specie];
  if (specie) {
    removeExpandPokemonSetupWithCondition(encounter, 'givenName', specie.name());
    const form = specie.forms.find((f) => f.form === encounter.form);
    if (form) removeExpandPokemonSetupWithCondition(encounter, 'rareness', form.catchRate);
  }
  if (isWild) {
    removeExpandPokemonSetup(encounter, 'ivs');
    removeExpandPokemonSetup(encounter, 'caughtWith');
    removeExpandPokemonSetup(encounter, 'originalTrainerName');
    removeExpandPokemonSetup(encounter, 'originalTrainerId');
    removeExpandPokemonSetup(encounter, 'givenName');
    removeExpandPokemonSetup(encounter, 'itemHeld');
  } else {
    removeExpandPokemonSetup(encounter, 'rareness');
  }
};
