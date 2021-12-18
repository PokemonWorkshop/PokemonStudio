import { ProjectData, SelectedDataIdentifier } from '@src/GlobalStateProvider';

const firstByName = <T extends { name: () => string; dbSymbol: string }>(data: Record<string, T>): string => {
  return Object.values(data).sort((a, b) => a.name().localeCompare(b.name()))[0].dbSymbol;
};

const firstById = <T extends { id: number; dbSymbol: string }>(data: Record<string, T>): string => {
  return Object.values(data).sort((a, b) => a.id - b.id)[0].dbSymbol;
};

export const generateSelectedIdentifier = (projectData: ProjectData): SelectedDataIdentifier => {
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
  };
};
