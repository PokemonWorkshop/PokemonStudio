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
import React, { DragEvent, DragEventHandler, useCallback, useEffect, useMemo } from 'react';
import styled from 'styled-components';

import { EventCommandsEditor } from '@components/event/EventCommandsEditor';
import { EventProvider, useEventContext } from '@components/event/EventContext';
import { StudioEventCommand } from '@modelEntities/event/command';
import { BasicNode } from '../nodeEditor/BasicNode';
import { EventDialogsRef, EventEditorAndDeletionKeys, EventEditorOverlay } from '../nodeEditor/EventEditorOverlay';
import { useDialogsRef } from '@src/hooks/useDialogsRef';
import { useGlobalState } from '@src/GlobalStateProvider';
import { ShadowNode } from '../nodeEditor/ShadowNode';

// From example: https://reactflow.dev/examples/interaction/drag-and-drop

type NodeData = {
  dialogsRef?: EventDialogsRef;
  commandType: StudioEventCommand;
  textVersion: number;
};

type NodeEvent = Node<NodeData, StudioEventCommand>;
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

let id = 0;
const getId = () => `event_node_${id++}`;

const EventFlow = () => {
  const reactFlowInstance = useReactFlow();
  const [nodes, setNodes] = useNodesState<NodeEvent | NodeShadow>([
    { id: 'shadow_node', type: 'shadow_node', position: { x: 0, y: 0 }, data: {}, hidden: true },
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const nodeTypes = useMemo(
    () => ({
      add_condition: BasicNode,
      add_jump_another_command: BasicNode,
      call_event: BasicNode,
      insert_loop: BasicNode,
      show_message: BasicNode,
      stop_event_execution: BasicNode,
      shadow_node: ShadowNode,
    }),
    []
  );
  const { screenToFlowPosition } = useReactFlow();
  const { currentEditedNode, type, setCurrentEditedNode, setType } = useEventContext();
  const dialogsRef = useDialogsRef<EventEditorAndDeletionKeys>();
  const [state, setState] = useGlobalState();

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

      const textVersion = state.textVersion + 1;
      const position = screenToFlowPosition({
        x: event.clientX + 8,
        y: event.clientY + 8,
      });
      const newNode: NodeEvent = {
        id: getId(),
        type,
        position,
        data: { commandType: type, dialogsRef, textVersion },
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
      setState((s) => ({ ...s, textVersion: textVersion }));
    },
    [screenToFlowPosition, type, state]
  );

  const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: StudioEventCommand) => {
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
      let textVersion = state.textVersion;
      setNodes((nds) => {
        const updatedChanges = changes.map((change) => {
          if (change.type !== 'remove') return change;

          textVersion--;
          return change;
        });
        return applyNodeChanges(updatedChanges, nds);
      });
      setState((s) => ({ ...s, textVersion }));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [state]
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

    setNodes((nds) =>
      applyNodeChanges(
        [{ id: nodeEdited.id, type: 'replace', item: { ...nodeEdited, data: { ...nodeEdited.data, textVersion: state.textVersion } } }],
        nds
      )
    );
    setCurrentEditedNode(undefined);
  }, [state.textVersion]);

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
      <EventEditorOverlay ref={dialogsRef} />
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
