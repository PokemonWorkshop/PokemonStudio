import { StudioCreature, StudioCreatureForm, StudioEvolutionCondition } from '@modelEntities/creature';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { assertUnreachable } from '@utils/assertUnreachable';
import { useEffect, useReducer, useRef } from 'react';
import { useUpdateForm } from '../useUpdateForm';

type EvolutionEditorStateProps = {
  evolutionIndex: number;
  creature: StudioCreature;
  form: StudioCreatureForm;
};

const EVOLUTION_DB_SYMBOL_KEYS = ['gemme', 'itemHold', 'skill1', 'skill2', 'skill3', 'skill4', 'stone', 'tradeWith', 'weather'] as const;
type EvolutionDbSymbolKey = (typeof EVOLUTION_DB_SYMBOL_KEYS)[number];
const isEvolutionDbSymbolKey = (key: string): key is EvolutionDbSymbolKey => EVOLUTION_DB_SYMBOL_KEYS.includes(key as EvolutionDbSymbolKey);

// I use partial here because in any case we have to check that the ref has been set to HTMLInputElement, it makes handling easier!
type EvolutionConditionRefs = Partial<Record<Exclude<StudioEvolutionCondition['type'], EvolutionDbSymbolKey>, HTMLInputElement | null>>;
type EvolutionConditionStates = Record<EvolutionDbSymbolKey, DbSymbol> & {
  conditionInUse: StudioEvolutionCondition['type'][];
  evolveTo: DbSymbol;
  evolveToForm: number;
  isMega: boolean;
  defaults: Record<StudioEvolutionCondition['type'], StudioEvolutionCondition['value']>;
  evolutionIndex: number;
};
type EvolutionConditionAction =
  | {
      type: 'update';
      // Key must only be DbSymbol like items (backed by a <select /> element)
      key: EvolutionDbSymbolKey;
      value: DbSymbol;
    }
  | {
      type: 'updateSpecie';
      value: DbSymbol;
    }
  | {
      type: 'updateForm';
      value: number;
    }
  | {
      type: 'add' | 'remove';
      key: StudioEvolutionCondition['type'];
    }
  | {
      type: 'swap';
      originalKey: StudioEvolutionCondition['type'];
      targetKey: StudioEvolutionCondition['type'];
    }
  | {
      type: 'reInit';
      value: EvolutionConditionStates;
    };

const reduceConditions = (state: EvolutionConditionStates, action: EvolutionConditionAction): EvolutionConditionStates => {
  const type = action.type;
  switch (type) {
    case 'update':
      return {
        ...state,
        [action.key]: action.value,
      };
    case 'add':
      return {
        ...state,
        isMega: state.isMega || action.key === 'gemme',
        conditionInUse: state.conditionInUse.includes(action.key) ? state.conditionInUse : [...state.conditionInUse, action.key],
      };
    case 'remove':
      return {
        ...state,
        isMega: state.isMega && action.key !== 'gemme',
        conditionInUse: state.conditionInUse.filter((key) => key !== action.key),
      };
    case 'swap':
      return action.originalKey === action.targetKey ||
        state.conditionInUse.includes(action.targetKey) ||
        !state.conditionInUse.includes(action.originalKey)
        ? state
        : {
            ...state,
            isMega: (state.isMega && action.originalKey !== 'gemme') || action.targetKey === 'gemme',
            conditionInUse: state.conditionInUse.map((key) => (key === action.originalKey ? action.targetKey : key)),
          };
    case 'updateSpecie':
      return {
        ...state,
        evolveTo: action.value,
      };
    case 'updateForm':
      return {
        ...state,
        evolveToForm: action.value,
      };
    case 'reInit':
      return action.value;
    default:
      return assertUnreachable(type);
  }
};

const initializeConditions = ({ form, evolutionIndex }: Pick<EvolutionEditorStateProps, 'form' | 'evolutionIndex'>): EvolutionConditionStates => {
  const evolution = form.evolutions[evolutionIndex];
  const evolutionConditions = evolution?.conditions || [];
  return {
    gemme: '__undef__' as DbSymbol,
    itemHold: '__undef__' as DbSymbol,
    skill1: '__undef__' as DbSymbol,
    skill2: '__undef__' as DbSymbol,
    skill3: '__undef__' as DbSymbol,
    skill4: '__undef__' as DbSymbol,
    stone: '__undef__' as DbSymbol,
    tradeWith: '__undef__' as DbSymbol,
    weather: '__undef__' as DbSymbol,
    conditionInUse: evolutionConditions.map(({ type }) => type),
    isMega: evolutionConditions.some(({ type }) => type === 'gemme'),
    evolveTo: evolution?.dbSymbol || ('__undef__' as DbSymbol),
    evolveToForm: evolution?.form || 0,
    defaults: Object.fromEntries(evolutionConditions.map((c) => [c.type, c.value])) as EvolutionConditionStates['defaults'],
    evolutionIndex,
    ...Object.fromEntries(evolutionConditions.filter(({ type }) => isEvolutionDbSymbolKey(type)).map((value) => [value.type, value.value])),
  };
};

const useEvolutionConditionState = (form: StudioCreatureForm, evolutionIndex: number) => {
  const [state, dispatch] = useReducer(reduceConditions, { form, evolutionIndex }, initializeConditions);

  // Ensure the condition state depends on evolutionIndex
  useEffect(() => {
    if (evolutionIndex !== state.evolutionIndex && form.evolutions[evolutionIndex]) {
      dispatch({ type: 'reInit', value: initializeConditions({ form, evolutionIndex }) });
    }
  }, [evolutionIndex, form]);

  return { state, dispatch };
};

export const useEvolutionEditorState = ({ evolutionIndex, creature, form }: EvolutionEditorStateProps) => {
  const updateForm = useUpdateForm(creature, form);
  const { state, dispatch } = useEvolutionConditionState(form, evolutionIndex);
  const inputRefs = useRef<EvolutionConditionRefs>({});

  const areConditionValid = () =>
    state.conditionInUse.every((key) => {
      if (key === 'trade') return true; // Trade has litteraly no input to validate with
      if (isEvolutionDbSymbolKey(key)) {
        return state[key] !== '__undef__';
      }
      return !!inputRefs.current[key]?.validity.valid;
    });

  const getEvolutionChanges = () => ({
    dbSymbol: state.isMega ? undefined : state.evolveTo,
    form: state.evolveToForm,
    conditions: state.conditionInUse.map((type): StudioEvolutionCondition => {
      if (isEvolutionDbSymbolKey(type)) {
        return { type, value: state[type] };
      }
      if (type === 'trade') return { type, value: true };
      if (type === 'func') return { type, value: inputRefs.current.func?.value || '' };
      if (type === 'maps') {
        const value = inputRefs.current.maps?.value
          .split(',')
          .map(Number)
          .filter((id) => !isNaN(id));
        return {
          type,
          value: value || [],
        };
      }
      if (type === 'none') return { type, value: undefined };
      // We have to do that because valueAsNumber of hidden = NaN for some reason
      if (type === 'dayNight') return { type, value: Number(inputRefs.current[type]?.value || 0) as 0 };
      if (type === 'gender') return { type, value: Number(inputRefs.current[type]?.value || 0) as 0 };

      return { type, value: inputRefs.current[type]?.valueAsNumber || 0 } as StudioEvolutionCondition; // It's confused with none for some reason
    }),
  });

  const commitChanges = () => {
    if (!areConditionValid()) return;

    if (form.evolutions.length === 0 && state.evolveTo !== '__undef__') {
      addEvolution();
    } else {
      updateForm({
        evolutions: form.evolutions.map((evolution, index) => {
          if (index !== evolutionIndex) return evolution;

          return getEvolutionChanges();
        }),
      });
    }
  };

  const addEvolution = () => {
    if (!areConditionValid()) return;
    updateForm({
      evolutions: [
        ...form.evolutions.map((evolution, index) => {
          if (index !== evolutionIndex) return evolution;

          return getEvolutionChanges();
        }),
        form.evolutions.length === 0
          ? getEvolutionChanges()
          : {
              dbSymbol: '__undef__' as DbSymbol,
              form: 0,
              conditions: [],
            },
      ],
    });
  };

  const removeEvolution = () => {
    updateForm({
      evolutions: form.evolutions.filter((_, index) => index !== evolutionIndex),
    });
  };

  return {
    state,
    inputRefs,
    dispatch,
    areConditionValid,
    commitChanges,
    addEvolution,
    removeEvolution,
  };
};
export type EvolutionEditorStateHookOutput = ReturnType<typeof useEvolutionEditorState>;
