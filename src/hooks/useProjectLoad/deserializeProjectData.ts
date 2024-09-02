import { ABILITY_VALIDATOR } from '@modelEntities/ability';
import { CREATURE_VALIDATOR } from '@modelEntities/creature';
import { DEX_VALIDATOR } from '@modelEntities/dex';
import { GROUP_VALIDATOR } from '@modelEntities/group';
import { ITEM_VALIDATOR } from '@modelEntities/item';
import { MAP_VALIDATOR } from '@modelEntities/map';
import { MAP_LINK_VALIDATOR } from '@modelEntities/mapLink';
import { MOVE_VALIDATOR } from '@modelEntities/move';
import { QUEST_VALIDATOR } from '@modelEntities/quest';
import { TRAINER_VALIDATOR } from '@modelEntities/trainer';
import { TYPE_VALIDATOR } from '@modelEntities/type';
import { ZONE_VALIDATOR } from '@modelEntities/zone';
import { NATURE_VALIDATOR } from '@modelEntities/natures';
import type { ProjectData } from '@src/GlobalStateProvider';
import { zodDataToEntries } from '@utils/SerializationUtils';
import { countZodDiscriminatedDataIntegrityFailure, countZodDataIntegrityFailure } from './helpers';
import type { ProjectLoadStateObject } from './types';

export const deserializeProjectData = (state: Extract<ProjectLoadStateObject, { state: 'deserializeProjectData' }>) => {
  const integrityFailureCount = { count: 0 };
  const projectText = state.projectTexts;
  const projectData: ProjectData = {
    items: zodDataToEntries(countZodDiscriminatedDataIntegrityFailure(state.projectData.items, ITEM_VALIDATOR, integrityFailureCount)),
    moves: zodDataToEntries(countZodDataIntegrityFailure(state.projectData.moves, MOVE_VALIDATOR, integrityFailureCount)),
    pokemon: zodDataToEntries(countZodDataIntegrityFailure(state.projectData.pokemon, CREATURE_VALIDATOR, integrityFailureCount)),
    quests: zodDataToEntries(countZodDataIntegrityFailure(state.projectData.quests, QUEST_VALIDATOR, integrityFailureCount)),
    trainers: zodDataToEntries(countZodDataIntegrityFailure(state.projectData.trainers, TRAINER_VALIDATOR, integrityFailureCount)),
    types: zodDataToEntries(countZodDataIntegrityFailure(state.projectData.types, TYPE_VALIDATOR, integrityFailureCount)),
    zones: zodDataToEntries(countZodDataIntegrityFailure(state.projectData.zones, ZONE_VALIDATOR, integrityFailureCount)),
    abilities: zodDataToEntries(countZodDataIntegrityFailure(state.projectData.abilities, ABILITY_VALIDATOR, integrityFailureCount)),
    groups: zodDataToEntries(countZodDataIntegrityFailure(state.projectData.groups, GROUP_VALIDATOR, integrityFailureCount)),
    dex: zodDataToEntries(countZodDataIntegrityFailure(state.projectData.dex, DEX_VALIDATOR, integrityFailureCount)),
    mapLinks: zodDataToEntries(countZodDataIntegrityFailure(state.projectData.maplinks, MAP_LINK_VALIDATOR, integrityFailureCount)),
    maps: zodDataToEntries(countZodDataIntegrityFailure(state.projectData.maps, MAP_VALIDATOR, integrityFailureCount)),
    natures: zodDataToEntries(countZodDataIntegrityFailure(state.projectData.natures, NATURE_VALIDATOR, integrityFailureCount)),
  };

  return { integrityFailureCount: integrityFailureCount.count, projectText, projectData };
};
