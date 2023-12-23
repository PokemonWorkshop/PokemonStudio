import { StudioExpandPokemonSetup, StudioGroupEncounter, StudioIvEv } from '@modelEntities/groupEncounter';
import { Teams, PokemonSet } from '@pkmn/sim';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { StatsTable } from '@pkmn/types';

const isTeamValid = (pokemonSets: PokemonSet[]): boolean => {
  for (const set of pokemonSets) {
    if (!set.species || !set.ability) {
      return false;
    }
  }
  return true;
};

const splitIntoTeams = (data: string): string[] => {
  return data
    .trim()
    .split('\n\n')
    .filter((team) => team.trim() !== '');
};

export const convertShowdownInputChange = (data: string) => {
  const teamsData = splitIntoTeams(data);

  const convertedTeams = teamsData.flatMap((teamData) => {
    const team = Teams.import(teamData);

    if (!team || !isTeamValid(team)) {
      return [];
    }

    return team.map(convertShowdownToStudioFormat);
  });

  if (teamsData.length === convertedTeams.length) return [];

  console.log(convertedTeams.length);
  console.log(teamsData.length);

  return convertedTeams;
};

const convertShowdownToStudioFormat = (set: PokemonSet): StudioGroupEncounter => {
  const encounter: StudioGroupEncounter = {
    specie: set.species.toLowerCase() as DbSymbol,
    form: 0,
    shinySetup: set.shiny ? { kind: 'rate', rate: 1 } : { kind: 'automatic', rate: -1 },
    levelSetup: { kind: 'fixed', level: set.level ?? 100 },
    randomEncounterChance: 1,
    expandPokemonSetup: buildExpandPokemonSetupFromShowdown(set),
  };

  return encounter;
};

const buildExpandPokemonSetupFromShowdown = (set: PokemonSet) => {
  const setupFields: StudioExpandPokemonSetup[] = [
    { type: 'originalTrainerName', value: '' },
    { type: 'ability', value: set.ability?.toLowerCase().replace(' ', '_') as DbSymbol },
    { type: 'caughtWith', value: 'poke_ball' as DbSymbol },
    { type: 'evs', value: formatStats(set.evs) },
    { type: 'ivs', value: formatStats(set.ivs) },
    { type: 'gender', value: set.gender == 'F' ? 2 : set.gender == 'M' ? 1 : -1 },
    { type: 'itemHeld', value: set.item?.toLowerCase().replace(' ', '_') as DbSymbol },
    { type: 'loyalty', value: 70 },
    {
      type: 'moves',
      value: set.moves?.slice(0, 4).map((move) => convertMove(move) as DbSymbol),
    },
    { type: 'nature', value: set.nature?.toLowerCase() as DbSymbol },
    { type: 'originalTrainerId', value: 0 },
    { type: 'rareness', value: -1 },
  ];

  return setupFields;
};

const formatStats = (stats: StatsTable): StudioIvEv => {
  return { hp: stats?.hp ?? 31, atk: stats?.atk ?? 31, dfe: stats?.def ?? 31, spd: stats?.spd ?? 31, ats: stats?.spa ?? 31, dfs: stats?.spe ?? 31 };
};

const convertMove = (move: string) => {
  return move.startsWith('Hidden Power') ? 'hidden_power' : move.toLowerCase().replace(/[\s-]+/g, '_');
};
