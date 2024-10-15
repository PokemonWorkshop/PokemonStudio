import {
  StudioCreatureQuestCondition,
  StudioQuestEarning,
  StudioQuestEarningType,
  StudioQuestObjective,
  StudioQuestObjectiveType,
} from '@modelEntities/quest';
import { State } from '@src/GlobalStateProvider';
import { TFunction } from 'react-i18next';
import { getEntityNameText, getEntityNameTextUsingTextId } from './ReadingProjectText';

const buildSpeakToText = (objective: StudioQuestObjective) => {
  return objective.objectiveMethodArgs[1] as string;
};

const getEntityNameSafe = (state: State, entity?: Parameters<typeof getEntityNameText>[0]) => {
  if (!entity) return '???';

  return getEntityNameText(entity, state);
};

const getEntityNameSafeUsingTextId = (state: State, entity?: Parameters<typeof getEntityNameTextUsingTextId>[0]) => {
  if (!entity) return '???';

  return getEntityNameTextUsingTextId(entity, state);
};

const buildObtainItemText = (objective: StudioQuestObjective, state: State) => {
  const itemName = getEntityNameSafe(state, state.projectData.items[objective.objectiveMethodArgs[0] as string]);
  const amount = objective.objectiveMethodArgs[1] as number;
  return amount === 1 ? itemName : `${amount} ${itemName}`;
};

const buildSeePokemonText = (objective: StudioQuestObjective, state: State) => {
  return getEntityNameSafe(state, state.projectData.pokemon[objective.objectiveMethodArgs[0] as string]);
};

const buildConditionsText = (conditions: StudioCreatureQuestCondition[], state: State, t: TFunction<'database_quests'>) => {
  if (conditions.length === 0) return '-';

  const conditionsTexts = conditions.map(({ type, value }) => {
    switch (type) {
      case 'pokemon':
        return getEntityNameSafe(state, state.projectData.pokemon[value]);
      case 'type':
        return t('of_type', { type: getEntityNameSafeUsingTextId(state, state.projectData.types[value]) });
      case 'nature':
        return t('of_nature', { nature: getEntityNameSafe(state, state.projectData.natures[value]) });
      case 'minLevel':
        return t('of_min_level', { level: value });
      case 'maxLevel':
        return t('of_max_level', { level: value });
      case 'level':
        return t('of_level', { level: value });
      default:
        return ((v: never) => v)(type);
    }
  });
  return conditionsTexts;
};

const buildBeatPokemonText = (objective: StudioQuestObjective, state: State) => {
  const pokemonName = getEntityNameSafe(state, state.projectData.pokemon[objective.objectiveMethodArgs[0] as string]);
  const amount = objective.objectiveMethodArgs[1] as number;
  return amount === 1 ? pokemonName : `${amount} ${pokemonName}`;
};

const buildCatchPokemonText = (objective: StudioQuestObjective, state: State, t: TFunction<'database_quests'>) => {
  const conditionsText = buildConditionsText(objective.objectiveMethodArgs[0] as unknown as StudioCreatureQuestCondition[], state, t);
  const amount = objective.objectiveMethodArgs[1] as number;
  return amount === 1 ? conditionsText : `${amount} ${conditionsText}`;
};

const buildBeatNpcText = (objective: StudioQuestObjective) => {
  const npcName = objective.objectiveMethodArgs[1] as string;
  const amount = objective.objectiveMethodArgs[2] as number;
  return amount === 1 ? npcName : `${amount} ${npcName}`;
};

const buildHatchEggText = (objective: StudioQuestObjective, _state: State, t: TFunction<'database_quests'>) => {
  return `${objective.objectiveMethodArgs[1]} ${t('eggs')}`;
};

const buildObtainEgg = (objective: StudioQuestObjective, _state: State, t: TFunction<'database_quests'>) => {
  return `${objective.objectiveMethodArgs[0]} ${t('eggs')}`;
};

const goalTexts: Record<
  StudioQuestObjectiveType,
  (objective: StudioQuestObjective, state: State, t: TFunction<'database_quests'>) => string | string[]
> = {
  objective_speak_to: buildSpeakToText,
  objective_obtain_item: buildObtainItemText,
  objective_see_pokemon: buildSeePokemonText,
  objective_beat_pokemon: buildBeatPokemonText,
  objective_catch_pokemon: buildCatchPokemonText,
  objective_beat_npc: buildBeatNpcText,
  objective_hatch_egg: buildHatchEggText,
  objective_obtain_egg: buildObtainEgg,
};

export const buildGoalText = (objective: StudioQuestObjective, state: State, t: TFunction<'database_quests'>) => {
  return goalTexts[objective.objectiveMethodName](objective, state, t);
};

const buildMoneyText = (earning: StudioQuestEarning) => {
  return `${earning.earningArgs[0]} P$`;
};

const buildEarningItemText = (earning: StudioQuestEarning, state: State) => {
  const itemName = getEntityNameSafe(state, state.projectData.items[earning.earningArgs[0] as string]);
  return `${earning.earningArgs[1]} ${itemName}`;
};

const buildEarningPokemonText = (earning: StudioQuestEarning, state: State) => {
  const pokemonName = getEntityNameSafe(state, state.projectData.pokemon[earning.earningArgs[0] as string]);
  return `1 ${pokemonName}`;
};

const earningTexts: Record<StudioQuestEarningType, (earning: StudioQuestEarning, state: State) => string> = {
  earning_money: buildMoneyText,
  earning_item: buildEarningItemText,
  earning_pokemon: buildEarningPokemonText,
  earning_egg: buildEarningPokemonText,
};

export const buildEarningText = (earning: StudioQuestEarning, state: State) => {
  return earningTexts[earning.earningMethodName](earning, state);
};
