import { SelectedDataIdentifier } from '@src/GlobalStateProvider';
import { PreGlobalState } from './useProjectLoadV2';

const firstByName = <T extends { name: () => string; dbSymbol: string }>(data: Record<string, T>): string => {
  return Object.values(data).sort((a, b) => a.name().localeCompare(b.name()))[0].dbSymbol;
};

const firstById = <T extends { id: number; dbSymbol: string }>(data: Record<string, T>): string => {
  return Object.values(data).sort((a, b) => a.id - b.id)[0].dbSymbol;
};

export const generateSelectedIdentifier = (preState: PreGlobalState): SelectedDataIdentifier => {
  const projectData = preState.projectData;
  const validMaps = Object.values(projectData.zones)
    .filter((zone) => zone.isFlyAllowed && !zone.isWarpDisallowed)
    .flatMap((zone) => zone.maps);
  return {
    pokemon: {
      specie: firstById(projectData.pokemon),
      form: 0,
    },
    move: firstById(projectData.moves),
    item: firstById(projectData.items),
    quest: firstById(projectData.quests),
    trainer: firstById(projectData.trainers),
    type: firstByName(projectData.types),
    zone: firstById(projectData.zones),
    ability: firstByName(projectData.abilities),
    group: firstById(projectData.groups),
    dex: firstById(projectData.dex),
    mapLink:
      Object.values(preState.rmxpMaps)
        .filter(({ id }) => validMaps.includes(id))
        .sort((a, b) => a.id - b.id)[0]
        ?.id.toString() || '__undef__',
  };
};
