import { EditorContainer } from '@components/editor/EditorContainer';
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
import { EventProvider, useEventDnD } from './EventDnDContext';

// From example: https://reactflow.dev/examples/interaction/drag-and-drop

type NodeCommandType = 'input' | 'default' | 'output';

type NodeEvent = {
  id: string;
  type: NodeCommandType;
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

const CommandsContainer = styled(EditorContainer)`
  position: unset;
  min-width: 308px;
  gap: 8px;
  ${({ theme }) => theme.fonts.normalRegular}
  color: ${({ theme }) => theme.colors.text100};

  .dndnode {
    height: 24px;
    padding: 4px;
    border: 1px solid #449c50;
    border-radius: 2px;
    margin-bottom: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: grab;
    background-color: ${({ theme }) => theme.colors.dark22};
  }

  .dndnode.input {
    border-color: #0041d0;
  }

  .dndnode.output {
    border-color: #ff0072;
  }
`;

let id = 0;
const getId = () => `dndnode_${id++}`;

const CommandsEditor = () => {
  const { setType } = useEventDnD();

  const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType?: NodeCommandType) => {
    setType(nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <CommandsContainer>
      <div className="description">You can drag these commands.</div>
      <div className="dndnode input" onDragStart={(event) => onDragStart(event, 'input')} draggable>
        Input Command
      </div>
      <div className="dndnode" onDragStart={(event) => onDragStart(event, 'default')} draggable>
        Default Command
      </div>
      <div className="dndnode output" onDragStart={(event) => onDragStart(event, 'output')} draggable>
        Output Command
      </div>
    </CommandsContainer>
  );
};

const EventFlow = () => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeEvent>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { screenToFlowPosition } = useReactFlow();
  const { type, setType } = useEventDnD();

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
        type: type as NodeCommandType,
        position,
        data: { label: `${type} command` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, type]
  );

  const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: NodeCommandType) => {
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
      <CommandsEditor />
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
