import { StudioCreature, StudioCreatureForm } from '@modelEntities/creature';

export type PokemonDataProps = {
  pokemonWithForm: PokemonWithForm;
  onClick?: () => void;
};

export type PokemonWithForm = {
  species: StudioCreature;
  form: StudioCreatureForm;
};
