import { StudioEvolutionCondition } from '@modelEntities/creature';
import { EvolutionEditorStateHookOutput } from './useEvolutionEditorState';

export type EvolutionConditionEditorInput = {
  type: StudioEvolutionCondition['type'];
} & Pick<EvolutionEditorStateHookOutput, 'state' | 'dispatch' | 'inputRefs'>;
