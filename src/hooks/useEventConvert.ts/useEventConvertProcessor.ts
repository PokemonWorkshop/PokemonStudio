import { useEventTree } from '@components/world/event/hooks/useEventTree';
import { toAsyncProcess } from '@hooks/Helper';
import { DEFAULT_PROCESS_STATE, PROCESS_DONE_STATE, SpecialStateProcessors } from '@hooks/useProcess';
import { useProjectEvents } from '@hooks/useProjectData';
import { EVENT_NAME_TEXT_ID } from '@modelEntities/event/event';
import { DEFAULT_EVENT_TREE } from '@modelEntities/event/event-tree';
import type { CommandId } from '@modelEntities/event/globalCommand';
import { StudioEventCommandStart } from '@modelEntities/event/startCommands/start';
import { useGlobalState } from '@src/GlobalStateProvider';
import { cloneEntity } from '@utils/cloneEntity';
import { createEvent } from '@utils/entityCreation';
import { convertCommand, RMXP_TRIGGER_TO_STUDIO_TRIGGER } from '@utils/events/EventConvertUtils';
import { addNewEventToEventTree } from '@utils/events/EventTreeUtils';
import { EVENT_GRID_SIZE, getCommandId } from '@utils/events/EventUtils';
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
  const [state, setGlobalState] = useGlobalState();
  const { projectDataValues: events } = useProjectEvents();
  const { eventTree } = useEventTree();
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
          ({ rmxpEvents }) =>
            setState({
              state: 'createEvents',
              rmxpEvents,
              rmxpEventIdsToDbSymbols: {},
              eventIndex: 0,
              preState: { events, eventTree, projectText: state.projectText },
            }),
          handleFailure(setState, binding),
        );
      },
      createEvents: ({ rmxpEvents, rmxpEventIdsToDbSymbols, eventIndex, preState }, setState) => {
        return toAsyncProcess(() => {
          if (rmxpEvents.length === eventIndex) {
            return setState({
              state: 'createTriggers',
              rmxpEvents,
              rmxpEventIdsToDbSymbols,
              eventIndex: 0,
              pageIndex: 0,
              preState,
              conversionData: { commandsPerPage: [] },
            });
          }
          const rmxpEvent = rmxpEvents[eventIndex];
          const newEvent = createEvent(preState.events);
          const currentEventTree = preState.eventTree ?? DEFAULT_EVENT_TREE;
          const dbSymbol = newEvent.dbSymbol;
          preState.events = { ...preState.events, [dbSymbol]: newEvent };
          preState.eventTree = addNewEventToEventTree(currentEventTree, dbSymbol, newEvent.id);
          rmxpEventIdsToDbSymbols[rmxpEvent.id] = newEvent.dbSymbol;
          setText(EVENT_NAME_TEXT_ID, newEvent.id, rmxpEvent.name);
          setNewProjectText(newEvent.csvFileId);
          return setState({ state: 'createEvents', rmxpEvents, rmxpEventIdsToDbSymbols, eventIndex: ++eventIndex, preState });
        });
      },
      createTriggers: ({ rmxpEvents, rmxpEventIdsToDbSymbols, eventIndex, pageIndex, preState, conversionData }, setState) => {
        return toAsyncProcess(() => {
          if (rmxpEvents.length === eventIndex) {
            setGlobalState((gs) => ({ ...gs, projectData: { ...gs.projectData, events: preState.events }, eventTree: preState.eventTree }));
            binding.current.onSuccess({});
            return setState(DEFAULT_PROCESS_STATE);
          }

          const rmxpEvent = rmxpEvents[eventIndex];
          if (rmxpEvent.pages.length === pageIndex) {
            return setState({
              state: 'createTriggers',
              rmxpEvents,
              rmxpEventIdsToDbSymbols,
              eventIndex: ++eventIndex,
              pageIndex: 0,
              preState,
              conversionData: { commandsPerPage: [] },
            });
          }

          const page = rmxpEvent.pages[pageIndex];
          const event = preState.events[rmxpEventIdsToDbSymbols[rmxpEvent.id]];
          const commandId = getCommandId(event) as CommandId;
          const command: StudioEventCommandStart = {
            type: 'start',
            connections: {},
            priority: rmxpEvent.pages.length - pageIndex,
            studioData: { comments: [], x: 0, y: pageIndex * EVENT_GRID_SIZE * 8 },
            trigger: RMXP_TRIGGER_TO_STUDIO_TRIGGER[page.trigger],
          };
          const commands = cloneEntity({
            ...event.commands,
            [commandId]: command,
          });
          conversionData.commandsPerPage[pageIndex] = 1;
          conversionData.lastCommandId = commandId;
          preState.events = { ...preState.events, [event.dbSymbol]: { ...event, commands } };
          return setState({
            state: 'createCommands',
            rmxpEvents,
            rmxpEventIdsToDbSymbols,
            eventIndex,
            pageIndex,
            commandIndex: 0,
            preState,
            conversionData,
          });
        });
      },
      createCommands: ({ rmxpEvents, rmxpEventIdsToDbSymbols, eventIndex, pageIndex, preState, conversionData }, setState) => {
        return toAsyncProcess(() => {
          const rmxpEvent = rmxpEvents[eventIndex];
          const page = rmxpEvent.pages[pageIndex];

          page.list.forEach((_, commandIndex) => {
            const event = preState.events[rmxpEventIdsToDbSymbols[rmxpEvent.id]];
            const resultConvertCommand = convertCommand(page, commandIndex, event.commands, conversionData);

            if (!resultConvertCommand || !conversionData.lastCommandId) return;

            const { command, isNewCommand } = resultConvertCommand;
            if (isNewCommand) {
              command.studioData = {
                ...command.studioData,
                x: EVENT_GRID_SIZE * 12 * conversionData.commandsPerPage[pageIndex],
                y: pageIndex * EVENT_GRID_SIZE * 8,
              };
            }
            const commandId = isNewCommand ? (getCommandId(event) as CommandId) : conversionData.lastCommandId;
            const commands = cloneEntity({ ...event.commands, [commandId]: command });
            if (isNewCommand) conversionData.commandsPerPage[pageIndex]++;
            conversionData.lastCommandId = commandId;
            preState.events = { ...preState.events, [event.dbSymbol]: { ...event, commands } };
          });

          return setState({
            state: 'createTriggers',
            rmxpEvents,
            rmxpEventIdsToDbSymbols,
            eventIndex,
            pageIndex: ++pageIndex,
            preState,
            conversionData,
          });
        });
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return { processors, binding };
};
