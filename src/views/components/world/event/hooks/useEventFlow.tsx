import { StudioEventCommand, StudioEventCommandData, StudioEventCommandType } from '@modelEntities/event/command';
import { StudioEvent } from '@modelEntities/event/event';
import { CommandId } from '@modelEntities/event/globalCommand';
import { StudioEventCommandShowChoice } from '@modelEntities/event/messageCommands/showChoice';
import { StudioEventCommandShowMessage } from '@modelEntities/event/messageCommands/showMessage';
import { StudioEventCommandStart } from '@modelEntities/event/startCommands/start';
import { cloneEntity } from '@utils/cloneEntity';
import { EventCommandCreation } from '@utils/eventCommandCreation';
import { getEventClipboard, setEventClipboard, type EventClipboardEntry } from '@utils/events/EventClipboard';
import {
  buildEdges,
  EVENT_GRID_SIZE,
  getCommandId,
  getCommandIds,
  initCommandNodes,
  initEdges,
  reactFlowConnectionToStudioConnection,
  reactFlowEdgeToStudioConnection,
} from '@utils/events/EventUtils';
import { findMultipleAvailablePriorityEvent, findMultipleAvailableTextIdsEvent } from '@utils/ModelUtils';
import { useCopyProjectText, useSetProjectText } from '@utils/ReadingProjectText';
import {
  addEdge,
  applyNodeChanges,
  Connection,
  Edge,
  getOutgoers,
  Node,
  OnNodesChange,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';
import { DragEventHandler, RefObject, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { CommandDialogsRef } from '../commands/editors/CommandEditorOverlay';
import { useEventContext } from '../common/EventContext';
import { useUpdateEvent } from './useUpdateEvent';

const SHADOW_NODE_ID = 'shadow_node';

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
};

type NodeData = {
  dialogsRef?: CommandDialogsRef;
  command: StudioEventCommandData<StudioEventCommand>;
  comments: string[];
  csvFileId: number;
};

type NodeEvent = Node<NodeData, StudioEventCommandType>;
type NodeShadow = Node;
type ChangeToApplyEventsType = { type: 'position'; commandId: CommandId; position: { x: number; y: number } };

export const useEventFlow = (event: StudioEvent, eventFlowRef?: RefObject<HTMLDivElement | null>, dialogsRef?: CommandDialogsRef) => {
  const { currentEditedNode, type, setCurrentEditedNode, setType } = useEventContext();
  const reactFlowInstance = useReactFlow();
  const { t } = useTranslation();
  const [nodes, setNodes] = useNodesState<NodeEvent | NodeShadow>([
    { id: 'shadow_node', type: 'shadow_node', position: { x: 0, y: 0 }, data: {}, hidden: true },
    ...initCommandNodes(event, dialogsRef),
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initEdges(event));
  const updateEvent = useUpdateEvent(event);
  const setText = useSetProjectText();
  const copyProjectText = useCopyProjectText();
  const lastCursorScreenPositionRef = useRef<{ x: number; y: number } | null>(null);

  const onConnect = useCallback(
    (connection: Connection) => {
      const { source, sourceHandle, target, targetHandle } = connection;
      if (!sourceHandle || !targetHandle) return;

      const connectionId = reactFlowConnectionToStudioConnection(connection);
      setEdges((eds) => addEdge(connection, eds));

      const command = cloneEntity(event.commands[source as CommandId]);
      if (!command) return;

      command.connections[connectionId] = { sourceHandle, target: target as CommandId, targetHandle };

      updateEvent({
        commands: {
          ...event.commands,
          [source]: command,
        },
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [event],
  );

  const onDragOver: DragEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      if (!type) return;

      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - 160,
        y: event.clientY + 32,
      });

      const shadowNode: NodeShadow = reactFlowInstance.getNode(SHADOW_NODE_ID) as NodeShadow;
      setNodes((nds) => applyNodeChanges([{ type: 'replace', id: SHADOW_NODE_ID, item: { ...shadowNode, position, hidden: false } }], nds));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [type],
  );

  const onDragLeave = () => {
    const shadowNode = reactFlowInstance.getNode(SHADOW_NODE_ID) as NodeShadow;
    if (shadowNode.hidden) return;

    setNodes((nds) => applyNodeChanges([{ type: 'replace', id: SHADOW_NODE_ID, item: { ...shadowNode, hidden: true } }], nds));
  };

  const onDrop: DragEventHandler<HTMLDivElement> = useCallback(
    (eventDrop) => {
      eventDrop.preventDefault();

      // check if the dropped element is valid
      if (!type) return;

      const command = EventCommandCreation[type](event);
      const id = getCommandId(event);
      const position = reactFlowInstance.screenToFlowPosition({
        x: eventDrop.clientX - 160,
        y: eventDrop.clientY + 32,
      });
      const newNode: NodeEvent = {
        id,
        type,
        position,
        data: { dialogsRef, command: { type, ...command } as StudioEventCommandData<StudioEventCommand>, comments: [], csvFileId: event.csvFileId },
      };
      const shadowNode = reactFlowInstance.getNode(SHADOW_NODE_ID) as NodeShadow;

      setNodes((nds) =>
        applyNodeChanges(
          [
            { type: 'add', item: newNode },
            { type: 'replace', id: SHADOW_NODE_ID, item: { ...shadowNode, hidden: true } },
          ],
          nds,
        ),
      );
      setType(undefined);

      if (type === 'show_message') {
        const showMessageCommand = command as StudioEventCommandData<StudioEventCommandShowMessage>;
        setText(event.csvFileId, showMessageCommand.message, '');
        setText(event.csvFileId, showMessageCommand.narrator, '');
      }

      if (type === 'show_choice') {
        const showChoiceCommand = command as StudioEventCommandData<StudioEventCommandShowChoice>;
        setText(event.csvFileId, showChoiceCommand.choices[0], t(`event_command_yes`));
        setText(event.csvFileId, showChoiceCommand.choices[1], t(`event_command_no`));
      }

      updateEvent({
        commands: {
          ...event.commands,
          [id as CommandId]: { type, connections: {}, studioData: { ...position, comments: [] }, ...command },
        },
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reactFlowInstance.screenToFlowPosition, type, event],
  );

  const onNodesChange: OnNodesChange<NodeEvent | NodeShadow> = useCallback(
    (changes) => {
      const changesToApplyEvents: ChangeToApplyEventsType[] = [];
      changes.forEach((change) => {
        if (change.type === 'position' && !change.dragging && change.position) {
          changesToApplyEvents.push({ type: 'position', commandId: change.id as CommandId, position: change.position });
        }
        return change;
      });
      setNodes((nds) => applyNodeChanges(changes, nds));
      if (changesToApplyEvents.length === 0) return;

      const commandsEdited = cloneEntity(event.commands);
      changesToApplyEvents.forEach((change) => {
        if (change.type === 'position') {
          const command = commandsEdited[change.commandId];
          if (!command) return;

          commandsEdited[change.commandId] = { ...command, studioData: { ...command.studioData, ...change.position } };
        }
      });
      updateEvent({ commands: commandsEdited });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [event],
  );

  const reorderPriorities = (commandsEdited: Partial<Record<CommandId, StudioEventCommand>>, nodes: (NodeEvent | NodeShadow)[]) => {
    if (!nodes.some((n) => n.type === 'start')) return;

    const changes = Object.entries(commandsEdited)
      .filter(([, command]) => !!command && command.type === 'start')
      .sort(([, a], [, b]) => (a as StudioEventCommandStart).priority - (b as StudioEventCommandStart).priority)
      .map(([id, command], i) => {
        const commandId = id as CommandId;
        commandsEdited[commandId] = { ...(command as StudioEventCommandStart), priority: i + 1 };

        const nodeEdited = reactFlowInstance.getNode(id) as NodeEvent;
        if (!nodeEdited) return;

        return { id, type: 'replace' as const, item: { ...nodeEdited, data: { ...nodeEdited.data, command: commandsEdited[commandId] } } };
      })
      .filter((change) => !!change);

    if (changes.length > 0) {
      setNodes((nds) => applyNodeChanges(changes, nds));
    }
  };

  const onBeforeDelete = useCallback(async () => {
    // prevent command deletion when the editor is opened
    return !document.querySelector('#dialogs')?.textContent;
  }, []);

  const onDelete = useCallback(
    (params: { nodes: (NodeEvent | NodeShadow)[]; edges: Edge[] }) => {
      const commandsEdited = cloneEntity(event.commands);
      params.nodes.forEach((node) => delete commandsEdited[node.id as CommandId]);
      params.edges.forEach(({ id, source: commandId }) => {
        const command = commandsEdited[commandId as CommandId];
        if (!command) return;

        delete command.connections[reactFlowEdgeToStudioConnection(id)];
      });
      reorderPriorities(commandsEdited, nodes);
      updateEvent({ commands: commandsEdited });
      return params;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [event],
  );

  const onCopy = useCallback(() => {
    const selectedNodes = reactFlowInstance.getNodes().filter((node) => node.type !== 'shadow_node' && node.selected) as NodeEvent[];
    if (selectedNodes.length === 0) return;

    const selectedIds = new Set(selectedNodes.map((node) => node.id as CommandId));
    const entries = selectedNodes.reduce<EventClipboardEntry[]>((prev, node) => {
      const command = event.commands[node.id as CommandId];
      if (!command) return prev;

      const clonedCommand = cloneEntity(command);
      const connections = Object.entries(clonedCommand.connections).reduce<StudioEventCommand['connections']>((acc, [connectionId, connection]) => {
        if (!connection || !selectedIds.has(connection.target)) return acc;
        return { ...acc, [connectionId]: connection };
      }, {});

      prev.push({ originalId: node.id as CommandId, command: { ...clonedCommand, connections } });
      return prev;
    }, []);

    if (entries.length === 0) return;
    setEventClipboard({ sourceCsvFileId: event.csvFileId, entries });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  const onPaste = useCallback(() => {
    if (document.querySelector('#dialogs')?.textContent) return;

    const clipboard = getEventClipboard();
    if (!clipboard || clipboard.entries.length === 0) return;

    const containerRect = eventFlowRef?.current?.getBoundingClientRect();
    const fallbackScreenPosition = containerRect
      ? { x: containerRect.left + containerRect.width / 2, y: containerRect.top + containerRect.height / 2 }
      : { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const pastePosition = reactFlowInstance.screenToFlowPosition(lastCursorScreenPositionRef.current ?? fallbackScreenPosition);

    const minX = Math.min(...clipboard.entries.map(({ command }) => command.studioData.x));
    const minY = Math.min(...clipboard.entries.map(({ command }) => command.studioData.y));

    const newIds = getCommandIds(event, clipboard.entries.length);
    const idMapping = new Map<CommandId, CommandId>(clipboard.entries.map(({ originalId }, index) => [originalId, newIds[index]]));

    const startCommandCount = clipboard.entries.filter(({ command }) => command.type === 'start').length;
    const newStartPriorities = startCommandCount > 0 ? findMultipleAvailablePriorityEvent(event, 1, startCommandCount) : [];
    let nextStartPriorityIndex = 0;

    const usedTextIds: number[] = [];
    const textsToDuplicate: { srcTextId: number; destTextId: number }[] = [];

    const newCommands = clipboard.entries.map(({ command: originalCommand }, index) => {
      const newId = newIds[index];
      const position = {
        x: Math.round((pastePosition.x + (originalCommand.studioData.x - minX)) / EVENT_GRID_SIZE) * EVENT_GRID_SIZE,
        y: Math.round((pastePosition.y + (originalCommand.studioData.y - minY)) / EVENT_GRID_SIZE) * EVENT_GRID_SIZE,
      };

      const connections = Object.values(originalCommand.connections).reduce<StudioEventCommand['connections']>((acc, connection) => {
        if (!connection) return acc;
        const newTarget = idMapping.get(connection.target);
        if (!newTarget) return acc;

        const newConnectionId = reactFlowConnectionToStudioConnection({
          source: newId,
          sourceHandle: connection.sourceHandle,
          target: newTarget,
          targetHandle: connection.targetHandle,
        });
        return { ...acc, [newConnectionId]: { ...connection, target: newTarget } };
      }, {});

      let overrides: Partial<StudioEventCommand> = {};

      if (originalCommand.type === 'show_message') {
        const [newMessageId, newNarratorId] = findMultipleAvailableTextIdsEvent(event, 0, 2, usedTextIds);
        usedTextIds.push(newMessageId, newNarratorId);
        textsToDuplicate.push(
          { srcTextId: originalCommand.message, destTextId: newMessageId },
          { srcTextId: originalCommand.narrator, destTextId: newNarratorId },
        );
        overrides = { message: newMessageId, narrator: newNarratorId };
      } else if (originalCommand.type === 'show_choice') {
        const choiceAmount = originalCommand.choices.length;
        const newChoiceIds = findMultipleAvailableTextIdsEvent(event, 0, choiceAmount, usedTextIds);
        usedTextIds.push(...newChoiceIds);
        textsToDuplicate.push(...originalCommand.choices.map((choiceId, i) => ({ srcTextId: choiceId, destTextId: newChoiceIds[i] })));
        overrides = { choices: newChoiceIds };
      } else if (originalCommand.type === 'start') {
        overrides = { priority: newStartPriorities[nextStartPriorityIndex++] };
      }

      const command = {
        ...cloneEntity(originalCommand),
        ...overrides,
        connections,
        studioData: { ...originalCommand.studioData, ...position },
      } as StudioEventCommand;

      return { id: newId, command };
    });

    textsToDuplicate.forEach(({ srcTextId, destTextId }) => {
      setText(event.csvFileId, destTextId, '');
      copyProjectText({ fileId: clipboard.sourceCsvFileId, textId: srcTextId + 1 }, { fileId: event.csvFileId, textId: destTextId + 1 });
    });

    const newNodes: NodeEvent[] = newCommands.map(({ id, command }) => ({
      id,
      type: command.type,
      position: { x: command.studioData.x, y: command.studioData.y },
      data: { dialogsRef, command, comments: command.studioData.comments, csvFileId: event.csvFileId },
      selected: true,
    }));

    const newEdges = newCommands.reduce<Edge[]>((prev, { id, command }) => [...prev, ...buildEdges(id, command.connections)], []);

    const deselectPreviousSelection = reactFlowInstance
      .getNodes()
      .filter((node) => node.selected)
      .map((node) => ({ id: node.id, type: 'select' as const, selected: false }));

    setNodes((nds) => applyNodeChanges([...deselectPreviousSelection, ...newNodes.map((item) => ({ type: 'add' as const, item }))], nds));
    setEdges((eds) => [...eds, ...newEdges]);

    updateEvent({
      commands: {
        ...event.commands,
        ...Object.fromEntries(newCommands.map(({ id, command }) => [id, command])),
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, dialogsRef]);

  // Documentation: https://reactflow.dev/examples/interaction/prevent-cycles
  const isValidConnection = useCallback(
    (connection: Edge | Connection) => {
      // we are using getNodes and getEdges helpers here
      // to make sure we create isValidConnection function only once
      const nodes = reactFlowInstance.getNodes() as NodeEvent[];
      const edges = reactFlowInstance.getEdges();
      const target = nodes.find((node) => node.id === connection.target);
      if (!target) return false;

      const hasCycle = (node: NodeEvent, visited = new Set()) => {
        if (visited.has(node.id)) return false;

        visited.add(node.id);
        for (const outgoer of getOutgoers(node, nodes, edges)) {
          if (outgoer.id === connection.source) return true;
          if (hasCycle(outgoer, visited)) return true;
        }
      };

      if (target.id === connection.source) return false;
      return !hasCycle(target);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reactFlowInstance.getNodes, reactFlowInstance.getEdges],
  );

  const updatePriorities = (currentNode: NodeEvent) => {
    const dataCommand = currentNode.data.command;
    if (dataCommand.type !== 'start') return;

    const oldPriority = (dataCommand as StudioEventCommandData<StudioEventCommandStart>).priority;
    const newPriority = (event.commands[currentNode.id as CommandId] as StudioEventCommandStart)?.priority;
    if (!newPriority || oldPriority === newPriority) return;

    const updatedCommands = { ...event.commands };

    const changes = Object.entries(updatedCommands)
      .map(([id, command]) => {
        if (!command || command.type !== 'start') return;
        if (id === currentNode.id) return;

        const commandId = id as CommandId;
        let needToBeUpdated = false;

        if (newPriority < oldPriority) {
          if (command.priority >= newPriority && command.priority < oldPriority) {
            updatedCommands[commandId] = { ...command, priority: command.priority + 1 };
            needToBeUpdated = true;
          }
        } else {
          if (command.priority > oldPriority && command.priority <= newPriority) {
            updatedCommands[commandId] = { ...command, priority: command.priority - 1 };
            needToBeUpdated = true;
          }
        }

        if (needToBeUpdated) {
          const nodeEdited = reactFlowInstance.getNode(id) as NodeEvent;
          if (!nodeEdited) return;

          return { id, type: 'replace' as const, item: { ...nodeEdited, data: { ...nodeEdited.data, command: updatedCommands[commandId] } } };
        }
      })
      .filter((changes) => !!changes);

    if (changes.length > 0) {
      setNodes((nds) => applyNodeChanges(changes, nds));
    }
    updateEvent({ commands: updatedCommands });
  };

  useEffect(() => {
    if (!currentEditedNode) return;

    const nodeEdited = reactFlowInstance.getNode(currentEditedNode) as NodeEvent;
    if (!nodeEdited) return;

    const commandId = nodeEdited.id as CommandId;
    setNodes((nds) =>
      applyNodeChanges(
        [{ id: nodeEdited.id, type: 'replace', item: { ...nodeEdited, data: { ...nodeEdited.data, command: event.commands[commandId] } } }],
        nds,
      ),
    );
    updatePriorities(nodeEdited);
    setCurrentEditedNode(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event.commands]);

  useEffect(() => {
    // reset states
    const commands = initCommandNodes(event, dialogsRef);
    setNodes([{ id: 'shadow_node', type: 'shadow_node', position: { x: 0, y: 0 }, data: {}, hidden: true }, ...commands]);
    setEdges(initEdges(event));
    setCurrentEditedNode(undefined);
    // hide the flow
    if (eventFlowRef?.current) {
      eventFlowRef.current.style.opacity = '0';
      eventFlowRef.current.style.pointerEvents = 'none';
    }
    // it's necessary to wait that reactFlowInstance has the new nodes and edges to do a correct fitView and show the flow
    const timer = setTimeout(() => {
      if (commands.length > 0) reactFlowInstance.fitView();
      else reactFlowInstance.zoomTo(1);
      if (eventFlowRef?.current) {
        eventFlowRef.current.style.opacity = '1';
        eventFlowRef.current.style.pointerEvents = 'auto';
      }
    }, 80);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event.dbSymbol]);

  useEffect(() => {
    const handlePointerMove = (pointerEvent: MouseEvent) => {
      lastCursorScreenPositionRef.current = { x: pointerEvent.clientX, y: pointerEvent.clientY };
    };

    const handleKeyDown = (keyboardEvent: KeyboardEvent) => {
      if (!(keyboardEvent.ctrlKey || keyboardEvent.metaKey) || isEditableTarget(keyboardEvent.target)) return;

      const key = keyboardEvent.key.toLowerCase();
      if (key === 'c') {
        onCopy();
      } else if (key === 'v') {
        keyboardEvent.preventDefault();
        onPaste();
      }
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCopy, onPaste]);

  return {
    currentEditedNode,
    nodes,
    edges,
    onConnect,
    onDragOver,
    onDragLeave,
    onDrop,
    onNodesChange,
    onEdgesChange,
    onBeforeDelete,
    onDelete,
    isValidConnection,
  };
};
