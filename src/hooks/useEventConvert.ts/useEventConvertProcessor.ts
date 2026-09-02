import { useEventTree } from '@components/world/event/hooks/useEventTree';
import { toAsyncProcess } from '@hooks/Helper';
import { PROCESS_DONE_STATE, SpecialStateProcessors } from '@hooks/useProcess';
import { useProjectEvents } from '@hooks/useProjectData';
import { EVENT_NAME_TEXT_ID } from '@modelEntities/event/event';
import { DEFAULT_EVENT_TREE } from '@modelEntities/event/event-tree';
import { useGlobalState } from '@src/GlobalStateProvider';
import { cloneEntity } from '@utils/cloneEntity';
import { createEvent } from '@utils/entityCreation';
import { addNewEventToEventTree } from '@utils/events/EventTreeUtils';
import { useLoaderRef } from '@utils/loaderContext';
import { useNewProjectText, useSetProjectText } from '@utils/ReadingProjectText';
import { useMemo, useRef } from 'react';
import { handleFailure } from './helpers';
import { EventConvertFunctionBinding, EventConvertStateObject } from './types';

const DEFAULT_BINDING: EventConvertFunctionBinding = {
  onFailure: () => {},
  onSuccess: () => {},
  onGenericFailure: () => {},
};

export const useEventConvertProcessor = () => {
  const [state] = useGlobalState();
  const { projectDataValues: events, setProjectDataValues: setEvent } = useProjectEvents();
  const { eventTree, setEventTree } = useEventTree();
  const setText = useSetProjectText();
  const setNewProjectText = useNewProjectText();
  const loaderRef = useLoaderRef();
  const binding = useRef<EventConvertFunctionBinding>(DEFAULT_BINDING);

  const processors: SpecialStateProcessors<EventConvertStateObject> = useMemo(
    () => ({
      ...PROCESS_DONE_STATE,
      read: ({ mapId, eventIds }, setState) => {
        return window.api.readRMXPEvents(
          { projectPath: state.projectPath || '', mapId, eventIds },
          ({ rmxpEvents }) => setState({ state: 'createEvents', rmxpEvents }),
          handleFailure(setState, binding),
        );
      },
      createEvents: ({ rmxpEvents }, setState) => {
        return toAsyncProcess(() => {
          if (rmxpEvents.length === 0) return setState({ state: 'done' });

          const newEvent = createEvent(events);
          const currentEventTree = eventTree ?? DEFAULT_EVENT_TREE;
          const dbSymbol = newEvent.dbSymbol;
          setEventTree(addNewEventToEventTree(currentEventTree, dbSymbol, newEvent.id));
          setText(EVENT_NAME_TEXT_ID, newEvent.id, rmxpEvents[0].name);
          setNewProjectText(newEvent.csvFileId);
          setEvent({ [dbSymbol]: { ...newEvent, klass: 'Event' } }, { event: dbSymbol });
          const rmxpEvent = cloneEntity(rmxpEvents[0]);
          delete rmxpEvents[0];
          return setState({ state: 'createTriggers', rmxpEvents, rmxpEvent, eventDbSymbol: dbSymbol, pageIndex: 0 });
        });
      },
      createTriggers: ({ rmxpEvents, rmxpEvent, eventDbSymbol, pageIndex }, setState) => {
        return toAsyncProcess(() => {
          const page = rmxpEvent.pages[pageIndex];
          if (pageIndex === rmxpEvent.pages.length) return setState({ state: 'createEvents', rmxpEvents });

          const event = events[eventDbSymbol];
          // TODO: create trigger command
          return setState({ state: 'createCommands', rmxpEvents, rmxpEvent, eventDbSymbol, pageIndex, commandIndex: 0 });
        });
      },
      createCommands: ({ rmxpEvents, rmxpEvent, eventDbSymbol, pageIndex, commandIndex }, setState) => {
        return toAsyncProcess(() => {
          const page = rmxpEvent.pages[pageIndex];
          if (page.list.length === commandIndex) {
            return setState({ state: 'createTriggers', rmxpEvents, rmxpEvent, eventDbSymbol, pageIndex: ++pageIndex });
          }

          const event = events[eventDbSymbol];
          const rmxpCommand = page.list[commandIndex];
          // TODO: convert rmxp command
          return setState({ state: 'createCommands', rmxpEvents, rmxpEvent, eventDbSymbol, pageIndex, commandIndex: ++commandIndex });
        });
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return { processors, binding };
};
