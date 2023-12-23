import { Teams, PokemonSet } from '@pkmn/sim';

export const cleanShowdownData = (data: string): string => {
  return data
    .split('\n')
    .filter((line) => line.trim() !== '')
    .join('\n');
}; // Si jamais il y a des retour à la ligne vide

export const handleShowdownInputChange = (data: string) => {
  const cleanedData = cleanShowdownData(data);
  console.log(cleanedData);

  const team = Teams.import(cleanedData);
  console.log(team);

  if (!team) {
    console.error('Erreur lors de l’importation de l’équipe');
    return;
  }

  const convertedTeam = team.map(convertShowdownSetToStudioFormat);
  // console.log(convertedTeam);
};

const convertShowdownSetToStudioFormat = () => {};
