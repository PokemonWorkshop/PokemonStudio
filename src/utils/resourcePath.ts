import { StudioCreature } from '@modelEntities/creature';
import { padStr } from './PadStr';

export const pokemonSpritePath = (species: StudioCreature, form?: number) => {
  if (form) return `graphics/pokedex/pokefront/${padStr(species.id, 3)}_${padStr(form, 2)}.png`;

  return `graphics/pokedex/pokefront/${padStr(species.id, 3)}.png`;
};

export const pokemonIconPath = (species: StudioCreature, form?: number) => {
  if (form) return `graphics/pokedex/pokeicon/${padStr(species.id, 3)}_${padStr(form, 2)}.png`;

  return `graphics/pokedex/pokeicon/${padStr(species.id, 3)}.png`;
};
