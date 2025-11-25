import {
  addEdge,
  applyNodeChanges,
  Background,
  Connection,
  Controls,
  Edge,
  Node,
  OnNodesChange,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';
import React, { DragEvent, DragEventHandler, useCallback, useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';

import { EventCommandsEditor } from '@components/event/EventCommandsEditor';
import { EventProvider, useEventContext } from '@components/event/EventContext';
import { StudioEventCommand } from '@modelEntities/event/command';
import { BasicNode } from '../nodeEditor/BasicNode';
import { EventDialogsRef, EventEditorAndDeletionKeys, EventEditorOverlay } from '../nodeEditor/EventEditorOverlay';
import { useDialogsRef } from '@src/hooks/useDialogsRef';
import { useGlobalState } from '@src/GlobalStateProvider';

// From example: https://reactflow.dev/examples/interaction/drag-and-drop

type NodeData = {
  dialogsRef?: EventDialogsRef;
  commandType: StudioEventCommand;
  textVersion: number;
};

type NodeEvent = Node<NodeData, StudioEventCommand>;

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
const getId = () => `dndnode_${id++}`;

const EventFlow = () => {
  const reactFlowInstance = useReactFlow();
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes] = useNodesState<NodeEvent>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const nodeTypes = useMemo(
    () => ({
      add_condition: BasicNode,
      add_jump_another_command: BasicNode,
      call_event: BasicNode,
      insert_loop: BasicNode,
      show_message: BasicNode,
      stop_event_execution: BasicNode,
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
    /*const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    const shadowNode = {
      id: 'node-shadow',
      type: 'default', // TODO: change type
      position,
      data: { label: 'shadow' },
    };
    setNodes((nds) => nds.filter((node) => node.id !== 'node-shadow').concat(shadowNode));*/
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
        x: event.clientX,
        y: event.clientY,
      });
      const newNode: NodeEvent = {
        id: getId(),
        type,
        position,
        data: { commandType: type, dialogsRef, textVersion },
      };

      setNodes((nds) => applyNodeChanges([{ type: 'add', item: newNode }], nds));
      setState((s) => ({ ...s, textVersion: textVersion }));

      //setNodes((nds) => nds.filter((node) => node.id !== 'node-shadow').concat(newNode));
    },
    [screenToFlowPosition, type, state]
  );

  const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: StudioEventCommand) => {
    setType(nodeType);
    event.dataTransfer.setData('text/plain', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onNodesChange: OnNodesChange<NodeEvent> = useCallback(
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
      <div className="eventflow" ref={reactFlowWrapper}>
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
          fitView
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
