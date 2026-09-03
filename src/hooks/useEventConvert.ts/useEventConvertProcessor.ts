import { useEventTree } from '@components/world/event/hooks/useEventTree';
import { toAsyncProcess } from '@hooks/Helper';
import { DEFAULT_PROCESS_STATE, PROCESS_DONE_STATE, SpecialStateProcessors } from '@hooks/useProcess';
import { useProjectEvents } from '@hooks/useProjectData';
import { EVENT_NAME_TEXT_ID } from '@modelEntities/event/event';
import { DEFAULT_EVENT_TREE, StudioEventTree } from '@modelEntities/event/event-tree';
import { ProjectData, useGlobalState } from '@src/GlobalStateProvider';
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
};

export const useEventConvertProcessor = () => {
  const [state] = useGlobalState();
  const { projectDataValues: events, setProjectDataValues: setEvent } = useProjectEvents();
  const { eventTree, setEventTree } = useEventTree();
  const setText = useSetProjectText();
  const setNewProjectText = useNewProjectText();
  const loaderRef = useLoaderRef();
  const binding = useRef<EventConvertFunctionBinding>(DEFAULT_BINDING);
  const localEvents = useRef<ProjectData['events']>({ ...events });
  const localEventTree = useRef<StudioEventTree>({ ...eventTree });

  const processors: SpecialStateProcessors<EventConvertStateObject> = useMemo(
    () => ({
      ...PROCESS_DONE_STATE,
      read: ({ mapId, eventIds }, setState) => {
        return window.api.readRMXPEvents(
          { projectPath: state.projectPath || '', mapId, eventIds },
          ({ rmxpEvents }) => setState({ state: 'createEvents', rmxpEvents, rmxpEventIdsToDbSymbols: {}, eventIndex: 0 }),
          handleFailure(setState, binding),
        );
      },
      createEvents: ({ rmxpEvents, rmxpEventIdsToDbSymbols, eventIndex }, setState) => {
        return toAsyncProcess(() => {
          if (rmxpEvents.length === eventIndex) {
            return setState({ state: 'createTriggers', rmxpEvents, rmxpEventIdsToDbSymbols, eventIndex: 0, pageIndex: 0 });
          }
          const rmxpEvent = rmxpEvents[eventIndex];
          const newEvent = createEvent(localEvents.current);
          const currentEventTree = localEventTree.current ?? DEFAULT_EVENT_TREE;
          const dbSymbol = newEvent.dbSymbol;
          localEvents.current = { ...localEvents.current, [dbSymbol]: newEvent };
          localEventTree.current = addNewEventToEventTree(currentEventTree, dbSymbol, newEvent.id);
          rmxpEventIdsToDbSymbols[rmxpEvent.id] = newEvent.dbSymbol;
          setEventTree(addNewEventToEventTree(currentEventTree, dbSymbol, newEvent.id));
          setText(EVENT_NAME_TEXT_ID, newEvent.id, rmxpEvent.name);
          setNewProjectText(newEvent.csvFileId);
          setEvent({ [dbSymbol]: { ...newEvent, klass: 'Event' } });
          return setState({ state: 'createEvents', rmxpEvents, rmxpEventIdsToDbSymbols, eventIndex: ++eventIndex });
        });
      },
      createTriggers: ({ rmxpEvents, rmxpEventIdsToDbSymbols, eventIndex, pageIndex }, setState) => {
        return toAsyncProcess(() => {
          if (rmxpEvents.length === eventIndex) {
            localEvents.current = { ...events };
            localEventTree.current = { ...eventTree };
            binding.current.onSuccess({});
            return setState(DEFAULT_PROCESS_STATE);
          }

          const rmxpEvent = rmxpEvents[eventIndex];
          if (rmxpEvent.pages.length === pageIndex) {
            return setState({ state: 'createTriggers', rmxpEvents, rmxpEventIdsToDbSymbols, eventIndex: ++eventIndex, pageIndex: 0 });
          }

          const page = rmxpEvent.pages[pageIndex];
          const event = events[rmxpEventIdsToDbSymbols[rmxpEvent.id]];
          // TODO: create trigger command
          return setState({ state: 'createCommands', rmxpEvents, rmxpEventIdsToDbSymbols, eventIndex, pageIndex, commandIndex: 0 });
        });
      },
      createCommands: ({ rmxpEvents, rmxpEventIdsToDbSymbols, eventIndex, pageIndex, commandIndex }, setState) => {
        return toAsyncProcess(() => {
          const rmxpEvent = rmxpEvents[eventIndex];
          const page = rmxpEvent.pages[pageIndex];
          if (page.list.length === commandIndex) {
            return setState({ state: 'createTriggers', rmxpEvents, rmxpEventIdsToDbSymbols, eventIndex, pageIndex: ++pageIndex });
          }

          const event = events[rmxpEventIdsToDbSymbols[rmxpEvent.id]];
          const rmxpCommand = page.list[commandIndex];
          // TODO: convert rmxp command
          return setState({ state: 'createCommands', rmxpEvents, rmxpEventIdsToDbSymbols, eventIndex, pageIndex, commandIndex: ++commandIndex });
        });
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [events, eventTree],
  );

  return { processors, binding };
};
