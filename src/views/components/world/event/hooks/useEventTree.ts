import { useGlobalState } from '@src/GlobalStateProvider';
import { StudioEventTree, StudioEventTreeValue } from '@modelEntities/event/event-tree';

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

  const setPartialEventTree = (newEventTreeValue: StudioEventTreeValue, id: keyof StudioEventTree) => {
    const currentEventTreeValue = eventTree[id];
    if (JSON.stringify(currentEventTreeValue) !== JSON.stringify(newEventTreeValue)) {
      setState((currentState) => ({
        ...currentState,
        eventTree: {
          ...eventTree,
          [id]: newEventTreeValue,
        },
        savingEventTree: true,
      }));
    } else {
      setState((currentState) => ({
        ...currentState,
        eventTree: {
          ...eventTree,
          [id]: newEventTreeValue,
        },
      }));
    }
  };

  return {
    eventTree,
    setEventTree,
    setPartialEventTree,
  };
};

export type UseEventTreeReturnType = ReturnType<typeof useEventTree>;
