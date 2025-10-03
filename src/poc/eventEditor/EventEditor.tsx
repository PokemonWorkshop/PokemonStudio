import {
  addEdge,
  Background,
  Connection,
  Controls,
  Edge,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';
import React, { DragEvent, DragEventHandler, useCallback, useRef } from 'react';
import styled from 'styled-components';

import { EventCommandsEditor } from '@components/event/EventCommandsEditor';
import { EventProvider, useEventDnD } from '@components/event/EventDnDContext';
import { useTranslation } from 'react-i18next';

// From example: https://reactflow.dev/examples/interaction/drag-and-drop

type NodeEvent = {
  id: string;
  type: string;
  data: { label: string };
  position: { x: number; y: number };
};

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
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeEvent>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { screenToFlowPosition } = useReactFlow();
  const { type, setType } = useEventDnD();
  const { t } = useTranslation();

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), []);

  const onDragOver: DragEventHandler<HTMLDivElement> = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop: DragEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      event.preventDefault();

      // check if the dropped element is valid
      if (!type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode = {
        id: getId(),
        type: 'default', // TODO: use the type of the command
        position,
        data: { label: t(`event_command_${type}`) },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, type]
  );

  const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: string) => {
    setType(nodeType);
    event.dataTransfer.setData('text/plain', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <EventEditorContainer>
      <div className="eventflow" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
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
