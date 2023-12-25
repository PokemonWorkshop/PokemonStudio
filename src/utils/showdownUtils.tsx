import { StudioExpandPokemonSetup, StudioGroupEncounter, StudioIvEv } from '@modelEntities/groupEncounter';
import { Teams, PokemonSet } from '@pkmn/sim';
import { DbSymbol } from '@modelEntities/dbSymbol';
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

export const convertShowdownInputChange = (data: string) => {
  const teamsData = splitIntoTeams(data);

  const convertedTeams = teamsData.flatMap((teamData) => {
    const validTeams = Teams.import(teamData);

    if (!validTeams || !isTeamValid(validTeams)) {
      return [];
    }

    return validTeams.map(convertShowdownToStudioFormat);
  });

  if (teamsData.length !== convertedTeams.length) return [];

  return convertedTeams;
};

const convertShowdownToStudioFormat = (set: PokemonSet): StudioGroupEncounter => {
  const encounter: StudioGroupEncounter = {
    specie: convertToDbSymbol(set.species),
    form: 0,
    shinySetup: set.shiny ? { kind: 'rate', rate: 1 } : { kind: 'automatic', rate: -1 },
    levelSetup: { kind: 'fixed', level: set.level ?? 1 },
    randomEncounterChance: 1,
    expandPokemonSetup: buildExpandPokemonSetupFromShowdown(set),
  };

  return encounter;
};

const buildExpandPokemonSetupFromShowdown = (set: PokemonSet) => {
  const setupFields: StudioExpandPokemonSetup[] = [
    { type: 'ability', value: convertToDbSymbol(set.ability) },
    { type: 'caughtWith', value: convertToDbSymbol(set.pokeball) || ('poke_ball' as DbSymbol) },
    { type: 'evs', value: formatStats(set.evs, 0) },
    { type: 'ivs', value: formatStats(set.ivs, 31) },
    { type: 'gender', value: convertGender(set.gender) },
    { type: 'itemHeld', value: convertToDbSymbol(set.item) || ('__undef__' as DbSymbol) },
    { type: 'loyalty', value: set.happiness ?? 70 },
    { type: 'moves', value: convertMoves(set.moves) },
    { type: 'nature', value: convertToDbSymbol(set.nature) },
    { type: 'originalTrainerId', value: 0 },
    { type: 'rareness', value: -1 },
  ];

  return setupFields;
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
  const defaultMove = '__undef__' as DbSymbol;
  const movesConverted = moves ? moves.slice(0, 4).map((move) => convertMove(move)) : [];

  while (movesConverted.length < 4) {
    movesConverted.push(defaultMove);
  }

  return movesConverted;
};

const convertMove = (move: string) => {
  return move.startsWith('Hidden Power') ? ('hidden_power' as DbSymbol) : convertToDbSymbol(move);
};
