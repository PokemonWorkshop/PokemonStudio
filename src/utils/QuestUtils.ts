import { Earning, EarningType, Objective, ObjectiveType, PokemonQuestCondition } from '@modelEntities/quest/Quest.model';
import { State } from '@src/GlobalStateProvider';
import { TFunction } from 'react-i18next';
import { getNatureText } from './ReadingProjectText';

const buildSpeakToText = (objective: Objective) => {
  return objective.objectiveMethodArgs[1] as string;
};

const buildObtainItemText = (objective: Objective, state: State) => {
  const itemName = state.projectData.items[objective.objectiveMethodArgs[0] as string]?.name() || '???';
  const amount = objective.objectiveMethodArgs[1] as number;
  return amount === 1 ? itemName : `${amount} ${itemName}`;
};

const buildSeePokemonText = (objective: Objective, state: State) => {
  return state.projectData.pokemon[objective.objectiveMethodArgs[0] as string]?.name() || '???';
};

const buildConditionsText = (conditions: PokemonQuestCondition[], state: State, t: TFunction<'database_quests'>) => {
  if (conditions === []) return '-';
  const conditionsTexts: string[] = [];
  conditions.map(({ type, value }) => {
    if (type === 'pokemon') conditionsTexts.push(state.projectData.pokemon[value]?.name() || '???');
    if (type === 'type') conditionsTexts.push(t('of_type', { type: state.projectData.types[value]?.name() || '???' }));
    if (type === 'nature') conditionsTexts.push(t('of_nature', { nature: getNatureText(state, value as string) }));
    if (type === 'minLevel') conditionsTexts.push(t('of_min_level', { level: value }));
    if (type === 'maxLevel') conditionsTexts.push(t('of_max_level', { level: value }));
    if (type === 'level') conditionsTexts.push(t('of_level', { level: value }));
  });
  const conditionsText = conditionsTexts.join(', ');
  return conditionsText === '' ? '-' : conditionsText[0].toUpperCase() + conditionsText.slice(1);
};

const buildBeatPokemonText = (objective: Objective, state: State) => {
  const pokemonName = state.projectData.pokemon[objective.objectiveMethodArgs[0] as string]?.name() || '???';
  const amount = objective.objectiveMethodArgs[1] as number;
  return amount === 1 ? pokemonName : `${amount} ${pokemonName}`;
};

const buildCatchPokemonText = (objective: Objective, state: State, t: TFunction<'database_quests'>) => {
  const conditionsText = buildConditionsText(objective.objectiveMethodArgs[0] as PokemonQuestCondition[], state, t);
  const amount = objective.objectiveMethodArgs[1] as number;
  return amount === 1 ? conditionsText : `${amount} ${conditionsText}`;
};

const buildBeatNpcText = (objective: Objective) => {
  const npcName = objective.objectiveMethodArgs[1] as string;
  const amount = objective.objectiveMethodArgs[2] as number;
  return amount === 1 ? npcName : `${amount} ${npcName}`;
};

const buildHatchEggText = (objective: Objective, _state: State, t: TFunction<'database_quests'>) => {
  return `${objective.objectiveMethodArgs[1]} ${t('eggs')}`;
};

const buildObtainEgg = (objective: Objective, _state: State, t: TFunction<'database_quests'>) => {
  return `${objective.objectiveMethodArgs[0]} ${t('eggs')}`;
};

const goalTexts: Record<ObjectiveType, (objective: Objective, state: State, t: TFunction<'database_quests'>) => string> = {
  objective_speak_to: buildSpeakToText,
  objective_obtain_item: buildObtainItemText,
  objective_see_pokemon: buildSeePokemonText,
  objective_beat_pokemon: buildBeatPokemonText,
  objective_catch_pokemon: buildCatchPokemonText,
  objective_beat_npc: buildBeatNpcText,
  objective_hatch_egg: buildHatchEggText,
  objective_obtain_egg: buildObtainEgg,
};

export const buildGoalText = (objective: Objective, state: State, t: TFunction<'database_quests'>) => {
  return goalTexts[objective.objectiveMethodName](objective, state, t);
};

const buildMoneyText = (earning: Earning) => {
  return `${earning.earningArgs[0]} P$`;
};

const buildEarningItemText = (earning: Earning, state: State) => {
  const itemName = state.projectData.items[earning.earningArgs[0] as string]?.name() || '???';
  return `${earning.earningArgs[1]} ${itemName}`;
};

const buildEarningPokemonText = (earning: Earning, state: State) => {
  const pokemonName = state.projectData.pokemon[earning.earningArgs[0] as string]?.name() || '???';
  return `1 ${pokemonName}`;
};

const earningTexts: Record<EarningType, (earning: Earning, state: State) => string> = {
  earning_money: buildMoneyText,
  earning_item: buildEarningItemText,
  earning_pokemon: buildEarningPokemonText,
};

export const buildEarningText = (earning: Earning, state: State) => {
  return earningTexts[earning.earningMethodName](earning, state);
};
