import { Dispatch, SetStateAction, useEffect, useState } from 'react';

/**
 * Hook responsive of unrolling fastidious process happening in the front-end (sequentially waiting for several services).
 *
 * Example:
 * ```ts
 * type State = { state: 'done' } | { state: 'state2'; payload: string };
 * // ...
 * const processors: SpecialStateProcessors<State> = useMemo(() => ({
 *    ...PROCESS_DONE_STATE,
 *    state2: (state, setState) => {
 *      doSomethingWith(state.payload);
 *      setState({ state: 'done' });
 *      return () => {}
 *    },
 * }), []);
 *
 * const setState = useProcess<State>(processors, DEFAULT_PROCESS_STATE);
 *
 * return (payload: string) => setState({ state: 'state2', payload });
 * ```
 */
export const useProcess = <State extends SpecialState>(
  processors: SpecialStateProcessors<State>,
  initialState: Extract<State, { state: 'done' }>
) => {
  const [state, setState] = useState<State>(initialState);

  useEffect(() => {
    const key: State['state'] = state.state;
    if (!(key in processors)) throw new Error(`Invalid state (${key})`);

    return processors[key](state as Extract<State, { state: typeof key }>, setState);
  }, [processors, state]);

  return setState;
};

type SpecialState = (Record<string, unknown> & { state: string }) | { state: 'done' };
type SpecialStateCleanupFunction = () => void;
export type SpecialStateProcessors<T extends SpecialState> = {
  [K in T['state']]: (state: Extract<T, { state: K }>, setState: Dispatch<SetStateAction<T>>) => SpecialStateCleanupFunction;
};

export const DEFAULT_PROCESS_STATE = { state: 'done' } as const;
export const PROCESS_DONE_STATE = { done: (_state: typeof DEFAULT_PROCESS_STATE) => () => {} };
