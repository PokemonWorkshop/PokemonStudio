import { EvolutionCondition } from '@modelEntities/pokemon/PokemonForm';

export type InputProps = {
  condition: EvolutionCondition;
  index: number;
  onChange: (condition: EvolutionCondition | undefined, index: number) => void;
};
