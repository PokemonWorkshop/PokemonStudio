import { useGlobalState } from '@src/GlobalStateProvider';
import { StudioEventTree } from '@modelEntities/event/event-tree';

export const useEventTree = () => {
  const [state, setState] = useGlobalState();
  const eventTree = state.eventTree;

  const setEventTree = (newEventTree: StudioEventTree) => {
    if (JSON.stringify(newEventTree) !== JSON.stringify(eventTree)) {
      setState((currentState) => ({
        ...currentState,
        eventTree: newEventTree,
        savingEventTree: true,
      }));
    } else {
      setState((currentState) => ({
        ...currentState,
        eventTree: newEventTree,
      }));
    }
  };

  return {
    eventTree,
    setEventTree,
  };
};

export type UseEventTreeReturnType = ReturnType<typeof useEventTree>;
