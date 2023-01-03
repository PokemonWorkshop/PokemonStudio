import { StudioEvolutionCondition } from '@modelEntities/creature';

export type InputProps = {
  condition: StudioEvolutionCondition;
  index: number;
  onChange: (condition: StudioEvolutionCondition | undefined, index: number) => void;
};
