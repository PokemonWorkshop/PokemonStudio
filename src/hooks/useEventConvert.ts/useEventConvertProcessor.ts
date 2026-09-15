import { useEventTree } from '@components/world/event/hooks/useEventTree';
import { toAsyncProcess } from '@hooks/Helper';
import { DEFAULT_PROCESS_STATE, PROCESS_DONE_STATE, SpecialStateProcessors } from '@hooks/useProcess';
import { useProjectEvents } from '@hooks/useProjectData';
import { EVENT_NAME_TEXT_ID } from '@modelEntities/event/event';
import { DEFAULT_EVENT_TREE } from '@modelEntities/event/event-tree';
import type { CommandId } from '@modelEntities/event/globalCommand';
import { useGlobalState } from '@src/GlobalStateProvider';
import { createEvent } from '@utils/entityCreation';
import { convertCommand, convertTrigger } from '@utils/events/EventConvertUtils';
import { addNewEventToEventTree } from '@utils/events/EventTreeUtils';
import { EVENT_GRID_SIZE, getCommandId } from '@utils/events/EventUtils';
import { ConversionData } from '@utils/events/types';
import { useLoaderRef } from '@utils/loaderContext';
import { useNewProjectText, useSetProjectText } from '@utils/ReadingProjectText';
import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  const processors: SpecialStateProcessors<EventConvertStateObject> = useMemo(
    () => ({
      ...PROCESS_DONE_STATE,
      read: ({ mapId, eventIds }, setState) => {
        loaderRef.current.open('converting_events', 1, 3, t('read_data_rmxp_maps'));
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
        loaderRef.current.setProgress(2, 3, `${t('create_events')} (${eventIndex + 1}/${rmxpEvents.length})`);
        return toAsyncProcess(() => {
          if (rmxpEvents.length === eventIndex) {
            return setState({
              state: 'createCommands',
              rmxpEvents,
              rmxpEventIdsToDbSymbols,
              preState,
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
      createCommands: ({ rmxpEvents, rmxpEventIdsToDbSymbols, preState }, setState) => {
        return toAsyncProcess(() => {
          const totalCommands = rmxpEvents.reduce((acc, event) => acc + event.pages.reduce((pageAcc, page) => pageAcc + page.list.length, 0), 0);
          let commandCount = 1;
          rmxpEvents.forEach((rmxpEvent, eventIndex) => {
            const conversionData: ConversionData = { commandsPerPage: [] };

            rmxpEvent.pages.forEach((page, pageIndex) => {
              const event = preState.events[rmxpEventIdsToDbSymbols[rmxpEvent.id]];
              const { command, commandId } = convertTrigger(event, rmxpEvent, page, pageIndex);
              const commands = { ...event.commands, [commandId]: command };
              conversionData.commandsPerPage[pageIndex] = 1;
              conversionData.lastCommandId = commandId;
              preState.events = { ...preState.events, [event.dbSymbol]: { ...event, commands } };

              const commandProgression = (commandCount++ / totalCommands).toFixed(1);
              page.list.forEach((rmxpCommand) => {
                loaderRef.current.setProgress(3, 3, `${t('create_commands')} (${eventIndex + 1}/${rmxpEvents.length}) ${commandProgression}%`);
                const updatedEvent = preState.events[rmxpEventIdsToDbSymbols[rmxpEvent.id]];
                const resultConvertCommand = convertCommand(rmxpCommand, updatedEvent.commands, event, conversionData);

                if (!resultConvertCommand || !conversionData.lastCommandId) return;

                const { command, isNewCommand } = resultConvertCommand;
                if (isNewCommand) {
                  command.studioData = {
                    ...command.studioData,
                    x: EVENT_GRID_SIZE * 12 * conversionData.commandsPerPage[pageIndex],
                    y: (rmxpEvent.pages.length - pageIndex) * EVENT_GRID_SIZE * 8,
                  };
                  conversionData.commandsPerPage[pageIndex]++;
                }
                const commandId = isNewCommand ? (getCommandId(updatedEvent) as CommandId) : conversionData.lastCommandId;
                const updatedCommands = { ...updatedEvent.commands, [commandId]: command };
                conversionData.lastCommandId = commandId;
                preState.events = { ...preState.events, [updatedEvent.dbSymbol]: { ...updatedEvent, commands: updatedCommands } };
              });
            });
          });
          setGlobalState((gs) => ({ ...gs, projectData: { ...gs.projectData, events: preState.events }, eventTree: preState.eventTree }));
          binding.current.onSuccess({});
          return setState(DEFAULT_PROCESS_STATE);
        });
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return { processors, binding };
};
