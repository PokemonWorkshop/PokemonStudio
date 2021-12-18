import PokemonModel from '@modelEntities/pokemon/Pokemon.model';
import PokemonForm from '@modelEntities/pokemon/PokemonForm';

export type PokemonDataProps = {
  pokemonWithForm: PokemonWithForm;
  onClick?: () => void;
};

export type PokemonWithForm = {
  species: PokemonModel;
  form: PokemonForm;
};
