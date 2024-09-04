import { StudioAbility } from '@modelEntities/ability';
import { StudioCreature, StudioCreatureForm } from '@modelEntities/creature';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { DEX_DEFAULT_NAME_TEXT_ID, StudioDex, StudioDexCreature } from '@modelEntities/dex';
import { StudioCustomGroupCondition, StudioGroup, StudioGroupSystemTag, StudioGroupTool } from '@modelEntities/group';
import { createExpandPokemonSetup, StudioGroupEncounter } from '@modelEntities/groupEncounter';
import { StudioItem, StudioItemStatusCondition } from '@modelEntities/item';
import { StudioMapLink } from '@modelEntities/mapLink';
import { StudioMove, StudioMoveCategory } from '@modelEntities/move';
import {
  StudioCreatureQuestCondition,
  StudioCreatureQuestConditionType,
  StudioQuest,
  StudioQuestEarning,
  StudioQuestEarningType,
  StudioQuestObjective,
  StudioQuestObjectiveType,
  StudioQuestResolution,
} from '@modelEntities/quest';
import { StudioTrainer, StudioTrainerVsType } from '@modelEntities/trainer';
import { StudioType } from '@modelEntities/type';
import { StudioZone } from '@modelEntities/zone';
import { ProjectData } from '@src/GlobalStateProvider';
import { assertUnreachable } from './assertUnreachable';
import { findFirstAvailableFormTextId, findFirstAvailableId, findFirstAvailableTextId } from './ModelUtils';
import { padStr } from './PadStr';
import { StudioTextInfo } from '@modelEntities/textInfo';
import { StudioMap, StudioMapAudio } from '@modelEntities/map';
import { StudioMapInfo, StudioMapInfoMap } from '@modelEntities/mapInfo';
import { StudioNature } from '@modelEntities/nature';
import { mapInfoFindFirstAvailableId, mapInfoFindFirstAvailableTextId } from './MapInfoUtils';
import { cloneEntity } from './cloneEntity';

/**
 * Create a new ability with default values
 * @param allAbilities The project data containing the abilities
 * @returns The new ability
 */
export const createAbility = (allAbilities: ProjectData['abilities'], dbSymbol: DbSymbol): StudioAbility => {
  return {
    id: findFirstAvailableId(allAbilities, 0),
    dbSymbol: dbSymbol,
    textId: findFirstAvailableTextId(allAbilities),
    klass: 'Ability',
  };
};

/**
 * Find the first available csv text index
 * @param allDex The project data containing the dex
 * @returns The csv text index
 */
const findFirstAvailableDexCsvTextIndex = (allDex: ProjectData['dex']) => {
  const dataSortTextId = Object.values(allDex).sort((a, b) => a.csv.csvTextIndex - b.csv.csvTextIndex);
  const holeIndex = dataSortTextId.findIndex((data, index) => data.csv.csvTextIndex !== index);
  if (holeIndex === -1) return dataSortTextId[dataSortTextId.length - 1].csv.csvTextIndex + 1;
  if (holeIndex === 0) return 0;

  return dataSortTextId[holeIndex - 1].csv.csvTextIndex + 1;
};

/**
 * Create a new dex with default values
 * @param allDex The project data containing the dex
 * @returns The new dex
 */
export const createDex = (allDex: ProjectData['dex'], dbSymbol: DbSymbol, startId: number, creatures: StudioDexCreature[]): StudioDex => ({
  klass: 'Dex',
  id: findFirstAvailableId(allDex, 0),
  dbSymbol,
  startId,
  csv: {
    csvFileId: Object.values(allDex).sort((a, b) => a.id - b.id)[0]?.csv?.csvFileId || DEX_DEFAULT_NAME_TEXT_ID,
    csvTextIndex: findFirstAvailableDexCsvTextIndex(allDex),
  },
  creatures,
});

/**
 * Create a new Pokémon with default values
 * @param allPokemon The project data containing the Pokémon
 * @returns The new Pokémon
 */
export const createCreature = (allPokemon: ProjectData['pokemon'], dbSymbol: DbSymbol, type1: DbSymbol, type2: DbSymbol): StudioCreature => {
  const id = findFirstAvailableId(allPokemon, 1);
  const formTextIdName = findFirstAvailableFormTextId(allPokemon, 0, 'name');
  return {
    klass: 'Specie',
    id,
    dbSymbol,
    forms: [
      {
        form: 0,
        formTextId: {
          name: formTextIdName,
          description: 0,
        },
        height: 0.01,
        weight: 0.01,
        type1,
        type2,
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
        babyDbSymbol: dbSymbol,
        babyForm: 0,
        itemHeld: [
          {
            dbSymbol: 'none' as DbSymbol,
            chance: 0,
          },
          {
            dbSymbol: 'none' as DbSymbol,
            chance: 0,
          },
        ],
        abilities: ['__undef__', '__undef__', '__undef__'] as DbSymbol[],
        frontOffsetY: 0,
        moveSet: [],
        resources: {
          icon: '',
          iconShiny: '',
          front: '',
          frontShiny: '',
          back: '',
          backShiny: '',
          footprint: '',
          character: '',
          characterShiny: '',
          cry: '',
          hasFemale: false,
        },
      },
    ],
  };
};

/**
 * Create a creature form
 */
export const createCreatureForm = (
  allPokemon: ProjectData['pokemon'],
  form: StudioCreatureForm,
  types: { type1: DbSymbol; type2: DbSymbol },
  newFormId: number
) => {
  const formTextIdName = findFirstAvailableFormTextId(allPokemon, 0, 'name');
  const formTextIdDescription = findFirstAvailableFormTextId(allPokemon, 0, 'description');
  return cloneEntity({ ...form, ...types, form: newFormId, formTextId: { name: formTextIdName, description: formTextIdDescription } });
};

/**
 * Create a new item based on its klass
 */
export const createItem = <K extends StudioItem['klass']>(klass: K, dbSymbol: DbSymbol, id: number): Extract<StudioItem, { klass: K }> => {
  const itemDefaultValues = {
    klass,
    id,
    dbSymbol,
    icon: '001',
    price: 0,
    socket: 1,
    position: 0,
    isBattleUsable: false,
    isMapUsable: false,
    isLimited: false,
    isHoldable: false,
    flingPower: 30,
  };
  type Output = Extract<StudioItem, { klass: K }>;
  switch (klass) {
    case 'AllPPHealItem':
      return { ppCount: 10, loyaltyMalus: 0, ...itemDefaultValues } as Output;
    case 'BallItem':
      return { spriteFilename: 'ball_1', catchRate: 1, color: { red: 255, green: 0, blue: 0, alpha: 255 }, ...itemDefaultValues } as Output;
    case 'ConstantHealItem':
      return { hpCount: 20, loyaltyMalus: 0, ...itemDefaultValues } as Output;
    case 'EVBoostItem':
      return { stat: 'ATK', count: 1, loyaltyMalus: 0, ...itemDefaultValues } as Output;
    case 'EventItem':
      return { eventId: 1, ...itemDefaultValues } as Output;
    case 'FleeingItem':
      return itemDefaultValues as Output;
    case 'HealingItem':
      return { loyaltyMalus: 0, ...itemDefaultValues } as Output;
    case 'Item':
      return itemDefaultValues as Output;
    case 'LevelIncreaseItem':
      return { levelCount: 1, loyaltyMalus: 0, ...itemDefaultValues } as Output;
    case 'ExpGiveItem':
      return { expCount: 1, loyaltyMalus: 0, ...itemDefaultValues } as Output;
    case 'PPHealItem':
      return { ppCount: 10, loyaltyMalus: 0, ...itemDefaultValues } as Output;
    case 'PPIncreaseItem':
      return { isMax: false, loyaltyMalus: 0, ...itemDefaultValues } as Output;
    case 'RateHealItem':
      return { hpRate: 0.5, loyaltyMalus: 0, ...itemDefaultValues } as Output;
    case 'RepelItem':
      return { repelCount: 1, ...itemDefaultValues } as Output;
    case 'StatBoostItem':
      return { count: 1, stat: 'ATK_STAGE', loyaltyMalus: 0, ...itemDefaultValues } as Output;
    case 'StatusConstantHealItem':
      return { statusList: ['POISONED'] as StudioItemStatusCondition[], hpCount: 20, loyaltyMalus: 0, ...itemDefaultValues } as Output;
    case 'StatusHealItem':
      return { statusList: ['POISONED'] as StudioItemStatusCondition[], loyaltyMalus: 0, ...itemDefaultValues } as Output;
    case 'StatusRateHealItem':
      return { statusList: ['POISONED'] as StudioItemStatusCondition[], hpRate: 0.5, loyaltyMalus: 0, ...itemDefaultValues } as Output;
    case 'StoneItem':
      return itemDefaultValues as Output;
    case 'TechItem':
      return { isHm: false, move: '__undef__' as DbSymbol, ...itemDefaultValues } as Output;
    default:
      return assertUnreachable(klass);
  }
};

export const createMove = (allMoves: ProjectData['moves'], dbSymbol: DbSymbol, type: DbSymbol, category: StudioMoveCategory): StudioMove => {
  const id = findFirstAvailableId(allMoves, 1);
  return {
    klass: 'Move',
    id,
    dbSymbol,
    type,
    category,
    isAuthentic: false,
    isBallistics: false,
    isBite: false,
    isBlocable: false,
    isCharge: false,
    isDance: false,
    isDirect: false,
    isDistance: false,
    isEffectChance: false,
    isGravity: false,
    isHeal: false,
    isKingRockUtility: false,
    isMagicCoatAffected: false,
    isMental: false,
    isMirrorMove: false,
    isNonSkyBattle: false,
    isPowder: false,
    isPulse: false,
    isPunch: false,
    isRecharge: false,
    isSnatchable: false,
    isSoundAttack: false,
    isSlicingAttack: false,
    isUnfreeze: false,
    isWind: false,
    power: 0,
    pp: 0,
    priority: 0,
    accuracy: 0,
    movecriticalRate: 1,
    effectChance: 100,
    moveStatus: [],
    battleEngineMethod: 's_basic',
    battleStageMod: [],
    battleEngineAimedTarget: 'adjacent_pokemon',
    mapUse: 0,
  };
};

export const createGroup = (
  dbSymbol: DbSymbol,
  id: number,
  systemTag: StudioGroupSystemTag,
  terrainTag: number,
  tool: StudioGroupTool,
  isDoubleBattle: boolean,
  customCondition: StudioCustomGroupCondition | undefined,
  stepsAverage: number
): StudioGroup => ({
  klass: 'Group',
  id,
  dbSymbol,
  encounters: [],
  isDoubleBattle,
  systemTag,
  terrainTag,
  customConditions: customCondition ? [customCondition] : [],
  tool,
  isHordeBattle: false,
  stepsAverage,
});

export const createEncounter = (isWild: boolean): StudioGroupEncounter => ({
  specie: '__undef__' as DbSymbol,
  form: 0,
  shinySetup: { kind: 'automatic', rate: -1 },
  levelSetup: isWild ? { kind: 'minmax', level: { minimumLevel: 1, maximumLevel: 1 } } : { kind: 'fixed', level: 1 },
  randomEncounterChance: 1,
  expandPokemonSetup: [
    createExpandPokemonSetup('evs'),
    createExpandPokemonSetup('ivs'),
    createExpandPokemonSetup('itemHeld'),
    createExpandPokemonSetup('loyalty'),
    createExpandPokemonSetup('moves'),
    createExpandPokemonSetup('originalTrainerName'),
    createExpandPokemonSetup('originalTrainerId'),
  ],
});

export const createTrainer = (
  allTrainers: ProjectData['trainers'],
  ai: number,
  vsType: StudioTrainerVsType,
  battleId: number,
  baseMoney: number
): StudioTrainer => {
  const id = findFirstAvailableId(allTrainers, 0);
  const dbSymbol = `trainer_${id}` as DbSymbol;
  return {
    klass: 'TrainerBattleSetup',
    id,
    dbSymbol,
    vsType,
    isCouple: false,
    baseMoney,
    ai,
    party: [],
    bagEntries: [],
    battleId,
    resources: {
      artworkFull: '',
      artworkSmall: '',
      character: '',
      musics: {
        bgm: '',
        defeat: '',
        encounter: '',
        victory: '',
      },
      sprite: '',
    },
  };
};

export const createMapLink = (id: number, mapId: number): StudioMapLink => ({
  klass: 'MapLink',
  id,
  dbSymbol: `maplink_${id}` as DbSymbol,
  mapId,
  northMaps: [],
  eastMaps: [],
  southMaps: [],
  westMaps: [],
});

export const createZone = (dbSymbol: DbSymbol, id: number): StudioZone => ({
  klass: 'Zone',
  id,
  dbSymbol,
  maps: [],
  worldmaps: [],
  panelId: 0,
  warp: { x: null, y: null },
  position: { x: null, y: null },
  isFlyAllowed: false,
  isWarpDisallowed: false,
  forcedWeather: null,
  wildGroups: [],
});

export const createType = (dbSymbol: DbSymbol, id: number, textId: number, color: string): StudioType => ({
  klass: 'Type',
  id,
  dbSymbol,
  color,
  textId,
  damageTo: [],
});

/**
 * Create the new objective
 * @param type The type of objective
 * @returns The new objective
 */
export const createQuestObjective = (type: StudioQuestObjectiveType): StudioQuestObjective => {
  const textFormatMethodName = type.replace('objective', 'text');
  const hiddenByDefault = false;
  switch (type) {
    case 'objective_speak_to':
      return { objectiveMethodName: type, objectiveMethodArgs: [0, ''], textFormatMethodName, hiddenByDefault };
    case 'objective_beat_npc':
      return { objectiveMethodName: type, objectiveMethodArgs: [0, '', 1], textFormatMethodName, hiddenByDefault };
    case 'objective_obtain_item':
      return { objectiveMethodName: type, objectiveMethodArgs: ['__undef__', 1], textFormatMethodName, hiddenByDefault };
    case 'objective_see_pokemon':
      return { objectiveMethodName: type, objectiveMethodArgs: ['__undef__', 1], textFormatMethodName, hiddenByDefault };
    case 'objective_beat_pokemon':
      return { objectiveMethodName: type, objectiveMethodArgs: ['__undef__', 1], textFormatMethodName, hiddenByDefault };
    case 'objective_catch_pokemon':
      return {
        objectiveMethodName: type,
        objectiveMethodArgs: [[{ type: 'pokemon' as const, value: '__undef__' as DbSymbol }], 1],
        textFormatMethodName,
        hiddenByDefault,
      };
    case 'objective_obtain_egg':
      return { objectiveMethodName: type, objectiveMethodArgs: [1], textFormatMethodName, hiddenByDefault };
    case 'objective_hatch_egg':
      return { objectiveMethodName: type, objectiveMethodArgs: [undefined, 1], textFormatMethodName, hiddenByDefault };
    default:
      assertUnreachable(type);
  }
  return { objectiveMethodName: type, objectiveMethodArgs: [0, ''], textFormatMethodName, hiddenByDefault };
};

export const createCreatureQuestCondition = (type: StudioCreatureQuestConditionType): StudioCreatureQuestCondition => {
  switch (type) {
    case 'level':
    case 'maxLevel':
    case 'minLevel':
      return { type: type, value: 1 };
    case 'nature':
      return { type: type, value: 'hardy' as DbSymbol };
    case 'pokemon':
      return { type: type, value: '__undef__' as DbSymbol };
    case 'type':
      return { type: type, value: '__undef__' as DbSymbol };
    default:
      assertUnreachable(type);
  }
  return { type: type, value: '__undef__' as DbSymbol };
};

export const createQuestEarning = (type: StudioQuestEarningType): StudioQuestEarning => {
  const textFormatMethodName = type.replace('earning', 'text_earn');
  switch (type) {
    case 'earning_money':
      return { earningMethodName: type, earningArgs: [100], textFormatMethodName };
    case 'earning_item':
      return { earningMethodName: type, earningArgs: ['__undef__', 1], textFormatMethodName };
    case 'earning_pokemon':
    case 'earning_egg':
      return { earningMethodName: type, earningArgs: ['__undef__'], textFormatMethodName };
    default:
      assertUnreachable(type);
  }
  return { earningMethodName: type, earningArgs: [1], textFormatMethodName };
};

export const createQuest = (dbSymbol: DbSymbol, id: number, isPrimary: boolean, resolution: StudioQuestResolution): StudioQuest => ({
  klass: 'Quest',
  id,
  dbSymbol,
  isPrimary,
  resolution,
  objectives: [],
  earnings: [],
});

export const createConfigTextsMessage = () => ({
  windowSkin: null,
  nameWindowSkin: null,
  lineCount: 1,
  borderSpacing: 0,
  defaultFont: 0,
  defaultColor: 0,
  colorMapping: {},
});

export const createConfigTextsChoice = () => ({
  windowSkin: null,
  borderSpacing: 0,
  defaultFont: 0,
  defaultColor: 0,
  colorMapping: {},
});

export const createTextInfo = (textInfos: StudioTextInfo[]): StudioTextInfo => {
  const allTextInfos: Record<string, { id: number; textId: number }> = {};
  textInfos.forEach(({ fileId, textId }) => {
    allTextInfos[fileId.toString()] = { id: fileId, textId };
  });
  const id = findFirstAvailableId(allTextInfos, 0);
  const textId = findFirstAvailableTextId(textInfos);
  return {
    klass: 'TextInfo',
    fileId: id,
    textId,
  };
};

export const createMap = (
  allMaps: ProjectData['maps'],
  stepsAverage: number,
  tiledFilename: string,
  bgm: StudioMapAudio,
  bgs: StudioMapAudio,
  excludeIds?: number[]
): StudioMap => {
  const id = findFirstAvailableId(allMaps, 1, excludeIds);
  const dbSymbol = `map${padStr(id, 3)}` as DbSymbol;
  return {
    klass: 'Map',
    id,
    dbSymbol,
    stepsAverage,
    bgm,
    bgs,
    mtime: 1,
    sha1: '',
    tiledFilename,
  };
};

export const duplicateMap = (allMaps: ProjectData['maps'], mapToDuplicate: StudioMap): StudioMap => {
  const id = findFirstAvailableId(allMaps, 1);
  const dbSymbol = `map${padStr(id, 3)}` as DbSymbol;
  return {
    ...mapToDuplicate,
    id,
    dbSymbol,
  };
};

export const createMapInfo = (mapInfo: StudioMapInfo, data: StudioMapInfoMap['data'] | { klass: 'MapInfoFolder' }) => {
  const id = mapInfoFindFirstAvailableId(mapInfo);
  const defaultMapInfo = {
    id,
    children: [],
    hasChildren: false,
    isExpanded: false,
  };
  if (data.klass === 'MapInfoMap') {
    return {
      ...defaultMapInfo,
      data,
    };
  } else {
    return {
      ...defaultMapInfo,
      data: {
        ...data,
        textId: mapInfoFindFirstAvailableTextId(mapInfo),
      },
    };
  }
};

export const createNature = (allNatures: ProjectData['natures'], dbSymbol: DbSymbol): StudioNature => {
  const id = findFirstAvailableId(allNatures, 0);
  return {
    klass: 'Nature',
    dbSymbol,
    id,
    stats: {
      atk: 100,
      dfe: 100,
      ats: 100,
      dfs: 100,
      spd: 100,
    },
    flavors: {
      favourite: 'none',
      detested: 'none',
    },
  };
};
