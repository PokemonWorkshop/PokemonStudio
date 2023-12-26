import { StudioExpandPokemonSetup, StudioGroupEncounter, StudioIvEv } from '@modelEntities/groupEncounter';
import { DbSymbol } from '@modelEntities/dbSymbol';

import { Teams, PokemonSet } from '@pkmn/sim';
import { StatsTable } from '@pkmn/types';

const splitIntoTeams = (data: string): string[] => {
  return data
    .trim()
    .split('\n\n')
    .filter((team) => team.trim() !== '');
};

/**
 * The Showdown format minimum
 */
const isTeamValid = (pokemonSets: PokemonSet[]): boolean => {
  return pokemonSets.every((set) => set.species && set.ability);
};

export const convertShowdownToStudio = (data: string, from: string) => {
  const teamsData = splitIntoTeams(data);

  const convertedTeams = teamsData.flatMap((teamData) => {
    const validTeams = Teams.import(teamData);

    if (!validTeams || !isTeamValid(validTeams)) {
      return [];
    }

    return validTeams.map(convertShowdownFormatToStudioFormat(from));
  });

  if (teamsData.length !== convertedTeams.length) return [];

  return convertedTeams;
};

const convertShowdownFormatToStudioFormat =
  (from: string) =>
  (set: PokemonSet): StudioGroupEncounter => {
    const encounter: StudioGroupEncounter = {
      specie: convertToDbSymbol(extractBaseName(set.species)),
      form: 0,
      shinySetup: set.shiny ? { kind: 'rate', rate: 1 } : { kind: 'automatic', rate: -1 },
      levelSetup: { kind: 'fixed', level: set.level ?? 1 },
      randomEncounterChance: 1,
      expandPokemonSetup: buildExpandPokemonSetup(set, from),
    };

    return encounter;
  };

const buildExpandPokemonSetup = (set: PokemonSet, from: string) => {
  const setupFields: StudioExpandPokemonSetup[] | undefined[] = [
    { type: 'ability', value: convertToDbSymbol(set.ability) },
    { type: 'evs', value: formatStats(set.evs, 0) },
    { type: 'gender', value: convertGender(set.gender) },
    { type: 'moves', value: convertMoves(set.moves) },
    { type: 'nature', value: convertToDbSymbol(set.nature) },
    { type: 'rareness', value: -1 },
  ];

  if (from === 'trainer') {
    setupFields.push({ type: 'caughtWith', value: convertToDbSymbol(set.pokeball) || ('poke_ball' as DbSymbol) });
    setupFields.push({ type: 'itemHeld', value: convertToDbSymbol(set.item) });
    setupFields.push({ type: 'givenName', value: set.name || set.species });
    setupFields.push({ type: 'ivs', value: formatStats(set.ivs, 31) });
    setupFields.push({ type: 'loyalty', value: set.happiness ?? 70 });
    setupFields.push({ type: 'originalTrainerId', value: 0 });
  }

  return setupFields.filter((field) => field.value !== undefined);
};

const extractBaseName = (name: string): string => {
  const exceptions = ['Ho-Oh', 'Porygon-Z'];
  if (exceptions.includes(name)) return name;

  const index = name.indexOf('-');
  if (index === -1) return name;

  return name.substring(0, index);
};

const convertToDbSymbol = (str: string | undefined): DbSymbol => str?.toLowerCase().replace(/[\s-]+/g, '_') as DbSymbol;

const convertGender = (gender: string): 0 | 1 | 2 | -1 => {
  switch (gender) {
    case 'F':
      return 2;
    case 'M':
      return 1;
    default:
      return -1;
  }
};

const formatStats = (stats: StatsTable, defaultValue: number): StudioIvEv => {
  return {
    hp: stats?.hp ?? defaultValue,
    atk: stats?.atk ?? defaultValue,
    dfe: stats?.def ?? defaultValue,
    spd: stats?.spd ?? defaultValue,
    ats: stats?.spa ?? defaultValue,
    dfs: stats?.spe ?? defaultValue,
  };
};

const convertMoves = (moves: string[] | undefined) => {
  const defaultMove = '__remove__' as DbSymbol;
  const movesConverted = moves ? moves.slice(0, 4).map((move) => convertMove(move)) : [];

  while (movesConverted.length < 4) {
    movesConverted.push(defaultMove);
  }

  return movesConverted;
};

const convertMove = (move: string) => {
  return move.startsWith('Hidden Power') ? ('hidden_power' as DbSymbol) : convertToDbSymbol(move);
};
