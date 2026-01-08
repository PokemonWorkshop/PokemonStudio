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
import { EventCommandsEditor } from '@components/event/EventCommandsEditor';
import { EventProvider, useEventContext } from '@components/event/EventContext';
import type { StudioEventCommand, StudioEventCommandType } from '@modelEntities/event/command';
import { EventDialogsRef, EventEditorAndDeletionKeys, EventEditorOverlay } from '../nodeEditor/EventEditorOverlay';
import { useDialogsRef } from '@src/hooks/useDialogsRef';
import { CommandNodes } from './CommandNodes';

import React, { DragEvent, DragEventHandler, useCallback, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { EventCommandCreation } from '@utils/eventCommandCreation';
import { useEventPage } from '@src/hooks/usePage';
import { CommandListId, StudioEvent } from '@modelEntities/event/event';
import { findFirstAvailableId } from '@utils/ModelUtils';
import { useUpdateEvent } from './useUpdateEvent';
import { cloneEntity } from '@utils/cloneEntity';

/* eslint-disable react-hooks/exhaustive-deps */

// From example: https://reactflow.dev/examples/interaction/drag-and-drop

type NodeData = {
  dialogsRef?: EventDialogsRef;
  command: StudioEventCommand;
};

type NodeEvent = Node<NodeData, StudioEventCommandType>;
type NodeShadow = Node;

const EventEditorContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  color: ${({ theme }) => theme.colors.text400};

  .eventflow {
    width: 100%;
    height: 100%;
  }
`;

const getId = (event: StudioEvent) => {
  const keys = Object.keys(event.commandLists).map((key) => key.replace('command_', ''));
  const record = keys.reduce<Record<string, { id: number }>>((acc, key) => {
    acc[key] = { id: Number(key) };
    return acc;
  }, {});
  const id = findFirstAvailableId(record, 0);
  return `command_${id}`;
};

const initCommandNodes = (event: StudioEvent, dialogsRef?: EventDialogsRef) => {
  return Object.entries(event.commandLists).map(([id, command]) => ({
    id,
    type: command?.commandType,
    position: { x: 0, y: 0 },
    data: { dialogsRef, command },
  }));
};

const EventFlow = () => {
  const { event: studioEvent } = useEventPage();
  const dialogsRef = useDialogsRef<EventEditorAndDeletionKeys>();
  const reactFlowInstance = useReactFlow();
  const [nodes, setNodes] = useNodesState<NodeEvent | NodeShadow>([
    { id: 'shadow_node', type: 'shadow_node', position: { x: 0, y: 0 }, data: {}, hidden: true },
    ...initCommandNodes(studioEvent, dialogsRef),
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const nodeTypes = useMemo(() => CommandNodes, []);
  const { screenToFlowPosition } = useReactFlow();
  const { currentEditedNode, type, setCurrentEditedNode, setType } = useEventContext();
  const updateEvent = useUpdateEvent(studioEvent);

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), []);

  const onDragOver: DragEventHandler<HTMLDivElement> = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    const position = screenToFlowPosition({
      x: event.clientX + 8,
      y: event.clientY + 8,
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
        x: event.clientX + 8,
        y: event.clientY + 8,
      });
      const newNode: NodeEvent = {
        id,
        type,
        position,
        data: { dialogsRef, command: { commandType: type, ...command } as StudioEventCommand },
      };
      const shadowNode = reactFlowInstance.getNode('shadow_node') as NodeShadow;

      setNodes((nds) =>
        applyNodeChanges(
          [
            { type: 'add', item: newNode },
            { type: 'replace', id: 'shadow_node', item: { ...shadowNode, hidden: true } },
          ],
          nds
        )
      );

      updateEvent({
        commandLists: {
          ...studioEvent.commandLists,
          [id as CommandListId]: { commandType: type, ...command },
        },
      });
    },
    [screenToFlowPosition, type, studioEvent]
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
      setNodes((nds) => {
        const updatedChanges = changes.map((change) => {
          if (change.type === 'remove') {
            const commandListsEdited = cloneEntity(studioEvent.commandLists);
            delete commandListsEdited[change.id as CommandListId];
            updateEvent({ commandLists: commandListsEdited });
          }

          return change;
        });
        return applyNodeChanges(updatedChanges, nds);
      });
    },
    [studioEvent]
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
    [reactFlowInstance.getNodes, reactFlowInstance.getEdges]
  );

  useEffect(() => {
    if (!currentEditedNode) return;

    const nodeEdited = reactFlowInstance.getNode(currentEditedNode) as NodeEvent;
    if (!nodeEdited) return;

    const commandId = nodeEdited.id as CommandListId;
    setNodes((nds) =>
      applyNodeChanges(
        [{ id: nodeEdited.id, type: 'replace', item: { ...nodeEdited, data: { ...nodeEdited.data, command: studioEvent.commandLists[commandId] } } }],
        nds
      )
    );
    setCurrentEditedNode(undefined);
  }, [studioEvent.commandLists]);

  return (
    <EventEditorContainer>
      <div className="eventflow">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragStart={onDragStart as DragEventHandler<HTMLDivElement>}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          isValidConnection={isValidConnection}
        >
          <Controls position="bottom-right" />
          <Background />
        </ReactFlow>
      </div>
      <EventCommandsEditor />
      <EventEditorOverlay ref={dialogsRef} commandId={currentEditedNode as CommandListId | undefined} event={studioEvent} />
    </EventEditorContainer>
  );
};

export const EventEditor = () => {
  return (
    <ReactFlowProvider>
      <EventProvider>
        <EventFlow />
      </EventProvider>
    </ReactFlowProvider>
  );
};

/* eslint-enable react-hooks/exhaustive-deps */
