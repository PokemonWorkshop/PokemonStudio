import { Teams } from '@pkmn/sim';

export const handleShowdownInputChange = (data: string) => {
  console.log(data);
  console.log(Teams.import(data));
};
