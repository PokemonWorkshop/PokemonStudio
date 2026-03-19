import {
  addEdge,
  applyNodeChanges,
  Background,
  Connection,
  Controls,
  Edge,
  getOutgoers,
  Node,
  OnNodesChange,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';
import { CommandLibrary } from '@components/world/event/commandLibrary/CommandLibrary';
import { EventProvider, useEventContext } from '@components/world/event/generic/EventContext';
import type {
  CommandId,
  ConnectionId,
  StudioEventCommand,
  StudioEventCommandConnection,
  StudioEventCommandData,
  StudioEventCommandType,
} from '@modelEntities/event/command';
import { EventDialogsRef, EventEditorAndDeletionKeys, EventEditorOverlay } from './commands/editors/EventEditorOverlay';
import { useDialogsRef } from '@src/hooks/useDialogsRef';
import { CommandToNodes } from './generic/CommandToNodes';
import { EventCommandCreation } from '@utils/eventCommandCreation';
import { useEventPage } from '@src/hooks/usePage';
import { StudioEvent } from '@modelEntities/event/event';
import { findFirstAvailableId } from '@utils/ModelUtils';
import { useUpdateEvent } from './hooks/useUpdateEvent';
import { cloneEntity } from '@utils/cloneEntity';
import { useGlobalState } from '@src/GlobalStateProvider';
import { useTranslation } from 'react-i18next';
import { CustomConnectionLineStyle, edgeTypes } from './generic/CustomEdge';
import styled from 'styled-components';
import React, { DragEvent, DragEventHandler, useCallback, useEffect, useMemo } from 'react';

/* eslint-disable react-hooks/exhaustive-deps */

// From example: https://reactflow.dev/examples/interaction/drag-and-drop

type NodeData = {
  dialogsRef?: EventDialogsRef;
  command: StudioEventCommandData<StudioEventCommand>;
  comments: string[];
};

type NodeEvent = Node<NodeData, StudioEventCommandType>;
type NodeShadow = Node;
type ChangeToApplyEventsType = { type: 'position'; commandId: CommandId; position: { x: number; y: number } };

const GRID_SIZE = 32;

const EventEditorContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  color: ${({ theme }) => theme.colors.text400};

  .eventflow {
    width: 100%;
    height: 100%;
    background-color: rgb(17, 18, 19);

    .react-flow__pane:has(.react-flow__connectionline) {
      cursor: grabbing;
    }
  }
`;

const getId = (event: StudioEvent) => {
  const keys = Object.keys(event.commands).map((key) => key.replace('command_', ''));
  const record = keys.reduce<Record<string, { id: number }>>((acc, key) => {
    acc[key] = { id: Number(key) };
    return acc;
  }, {});
  const id = findFirstAvailableId(record, 0);
  return `command_${id}`;
};

const initCommandNodes = (event: StudioEvent, dialogsRef?: EventDialogsRef) => {
  return Object.entries(event.commands).map(([id, command]) => ({
    id,
    type: command?.type,
    position: { x: command?.studioData.x || 0, y: command?.studioData.y || 0 },
    data: { dialogsRef, command, comments: command?.studioData.comments },
  }));
};

const buildEdges = (commandId: CommandId, connections: Partial<Record<ConnectionId, StudioEventCommandConnection>>) => {
  return Object.entries(connections).reduce<Edge[]>((prev, [id, connection]) => {
    if (!connection) return prev;

    return [
      ...prev,
      {
        id: `xy-edge__${id}`,
        ...connection,
        source: commandId,
        selected: false,
      },
    ];
  }, []);
};

const initEdges = (event: StudioEvent) => {
  return Object.entries(event.commands).reduce<Edge[]>((prev, [id, command]) => {
    if (!command || !command.connections) return prev;

    return [...prev, ...buildEdges(id as CommandId, command.connections)];
  }, []);
};

type EventFlowProps = {
  studioEvent: StudioEvent;
};

const EventFlow = ({ studioEvent }: EventFlowProps) => {
  const dialogsRef = useDialogsRef<EventEditorAndDeletionKeys>();
  const reactFlowInstance = useReactFlow();
  const [nodes, setNodes] = useNodesState<NodeEvent | NodeShadow>([
    { id: 'shadow_node', type: 'shadow_node', position: { x: 0, y: 0 }, data: {}, hidden: true },
    ...initCommandNodes(studioEvent, dialogsRef),
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initEdges(studioEvent));
  const nodeTypes = useMemo(() => CommandToNodes, []);
  const { screenToFlowPosition } = useReactFlow();
  const { currentEditedNode, type, setCurrentEditedNode, setType } = useEventContext();
  const updateEvent = useUpdateEvent(studioEvent);

  const onConnect = useCallback(
    (connection: Connection) => {
      const { source, sourceHandle, target, targetHandle } = connection;
      if (!sourceHandle || !targetHandle) return;

      const connectionId = `${source}${sourceHandle}-${target}${targetHandle}` as ConnectionId;
      setEdges((eds) => addEdge(connection, eds));

      const command = cloneEntity(studioEvent.commands[source as CommandId]);
      if (!command) return;

      command.connections[connectionId] = { sourceHandle, target: target as CommandId, targetHandle };

      updateEvent({
        commands: {
          ...studioEvent.commands,
          [source]: command,
        },
      });
    },
    [studioEvent],
  );

  const onDragOver: DragEventHandler<HTMLDivElement> = useCallback((event) => {
    // TODO: check that the drag comes from the event commands
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    const position = screenToFlowPosition({
      x: event.clientX - 160,
      y: event.clientY + 32,
    });

    const shadowNode: NodeShadow = reactFlowInstance.getNode('shadow_node') as NodeShadow;
    setNodes((nds) => applyNodeChanges([{ type: 'replace', id: 'shadow_node', item: { ...shadowNode, position, hidden: false } }], nds));
  }, []);

  const onDrop: DragEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      event.preventDefault();

      // check if the dropped element is valid
      if (!type) {
        return;
      }

      const command = EventCommandCreation[type];
      const id = getId(studioEvent);
      const position = screenToFlowPosition({
        x: event.clientX - 160,
        y: event.clientY + 32,
      });
      const newNode: NodeEvent = {
        id,
        type,
        position,
        data: { dialogsRef, command: { type, ...command } as StudioEventCommandData<StudioEventCommand>, comments: [] },
      };
      const shadowNode = reactFlowInstance.getNode('shadow_node') as NodeShadow;

      setNodes((nds) =>
        applyNodeChanges(
          [
            { type: 'add', item: newNode },
            { type: 'replace', id: 'shadow_node', item: { ...shadowNode, hidden: true } },
          ],
          nds,
        ),
      );

      updateEvent({
        commands: {
          ...studioEvent.commands,
          [id as CommandId]: { type, connections: {}, studioData: { ...position, comments: [] }, ...command },
        },
      });
    },
    [screenToFlowPosition, type, studioEvent],
  );

  const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: StudioEventCommandType) => {
    setType(nodeType);
    event.dataTransfer.setData('text/plain', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragLeave = () => {
    // TODO: improve the drag leave detection to ignore nodes that are already present
    const shadowNode = reactFlowInstance.getNode('shadow_node') as NodeShadow;
    if (shadowNode.hidden) return;

    setNodes((nds) => applyNodeChanges([{ type: 'replace', id: 'shadow_node', item: { ...shadowNode, hidden: true } }], nds));
  };

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

      const commandsEdited = cloneEntity(studioEvent.commands);
      changesToApplyEvents.forEach((change) => {
        if (change.type === 'position') {
          const command = commandsEdited[change.commandId];
          if (!command) return;

          commandsEdited[change.commandId] = { ...command, studioData: { ...command.studioData, ...change.position } };
        }
      });
      updateEvent({ commands: commandsEdited });
    },
    [studioEvent],
  );

  const onBeforeDelete = useCallback(async () => {
    return !document.querySelector('#dialogs')?.textContent;
  }, [dialogsRef]);

  const onDelete = useCallback(
    (params: { nodes: (NodeEvent | NodeShadow)[]; edges: Edge[] }) => {
      const commandsEdited = cloneEntity(studioEvent.commands);
      params.nodes.forEach((node) => delete commandsEdited[node.id as CommandId]);
      params.edges.forEach(({ id, source: commandId }) => {
        const command = commandsEdited[commandId as CommandId];
        if (!command) return;

        delete command.connections[id.replace('xy-edge__', '') as ConnectionId];
      });
      updateEvent({ commands: commandsEdited });
      return params;
    },
    [studioEvent],
  );

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
    [reactFlowInstance.getNodes, reactFlowInstance.getEdges],
  );

  useEffect(() => {
    if (!currentEditedNode) return;

    const nodeEdited = reactFlowInstance.getNode(currentEditedNode) as NodeEvent;
    if (!nodeEdited) return;

    const commandId = nodeEdited.id as CommandId;
    setNodes((nds) =>
      applyNodeChanges(
        [{ id: nodeEdited.id, type: 'replace', item: { ...nodeEdited, data: { ...nodeEdited.data, command: studioEvent.commands[commandId] } } }],
        nds,
      ),
    );
    setCurrentEditedNode(undefined);
  }, [studioEvent.commands]);

  useEffect(() => {
    setNodes([
      { id: 'shadow_node', type: 'shadow_node', position: { x: 0, y: 0 }, data: {}, hidden: true },
      ...initCommandNodes(studioEvent, dialogsRef),
    ]);
    setEdges(initEdges(studioEvent));
    setCurrentEditedNode(undefined);
    // it's necessary to wait that reactFlowInstance has the new nodes and edges to do a correct fitView
    const timer = setTimeout(() => {
      reactFlowInstance.fitView();
    }, 80);
    return () => clearTimeout(timer);
  }, [studioEvent.dbSymbol]);

  return (
    <EventEditorContainer>
      <div className="eventflow">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDelete={onDelete}
          onBeforeDelete={onBeforeDelete}
          onDrop={onDrop}
          onDragStart={onDragStart as DragEventHandler<HTMLDivElement>}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          isValidConnection={isValidConnection}
          connectionLineStyle={CustomConnectionLineStyle}
          fitView
          snapToGrid
          snapGrid={[GRID_SIZE, GRID_SIZE]}
        >
          <Controls position="bottom-right" />
          <Background gap={GRID_SIZE} offset={GRID_SIZE} color="#6c707b" />
        </ReactFlow>
      </div>
      <CommandLibrary />
      <EventEditorOverlay ref={dialogsRef} commandId={currentEditedNode as CommandId | undefined} event={studioEvent} />
    </EventEditorContainer>
  );
};

export const EventEditor = () => {
  const { event } = useEventPage();
  const { t } = useTranslation();
  const [state] = useGlobalState();
  const hasEventAvailable = useMemo(() => Object.keys(state.projectData.events).length > 0, [state.projectData.events]);

  return hasEventAvailable ? (
    <ReactFlowProvider>
      <EventProvider event={event}>
        <EventFlow studioEvent={event} />
      </EventProvider>
    </ReactFlowProvider>
  ) : (
    <div>{t('no_event_found')}</div>
  );
};

/* eslint-enable react-hooks/exhaustive-deps */
