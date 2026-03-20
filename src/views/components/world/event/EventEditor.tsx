import { Background, Controls, ReactFlow, ReactFlowProvider } from '@xyflow/react';
import { CommandLibrary } from '@components/world/event/commandLibrary/CommandLibrary';
import { EventProvider } from '@components/world/event/common/EventContext';
import type { CommandId } from '@modelEntities/event/command';
import { CommandEditorAndDeletionKeys, CommandEditorOverlay } from './commands/editors/CommandEditorOverlay';
import { useDialogsRef } from '@src/hooks/useDialogsRef';
import { CommandToNodes } from './common/CommandToNodes';
import { useEventPage } from '@src/hooks/usePage';
import { StudioEvent } from '@modelEntities/event/event';
import { useGlobalState } from '@src/GlobalStateProvider';
import { useTranslation } from 'react-i18next';
import { CustomConnectionLineStyle, edgeTypes } from './common/CustomEdge';
import { useEventFlow } from './hooks/useEventFlow';
import styled from 'styled-components';
import React, { DragEventHandler, useMemo, useRef } from 'react';

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

type EventFlowProps = {
  event: StudioEvent;
};

const EventFlow = ({ event }: EventFlowProps) => {
  const dialogsRef = useDialogsRef<CommandEditorAndDeletionKeys>();
  const nodeTypes = useMemo(() => CommandToNodes, []);
  const eventFlowRef = useRef<HTMLDivElement>(null);
  const {
    currentEditedNode,
    nodes,
    edges,
    onConnect,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    onNodesChange,
    onEdgesChange,
    onBeforeDelete,
    onDelete,
    isValidConnection,
  } = useEventFlow(event, eventFlowRef, dialogsRef);

  return (
    <EventEditorContainer>
      <div className="eventflow">
        <ReactFlow
          ref={eventFlowRef}
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
      <CommandEditorOverlay ref={dialogsRef} commandId={currentEditedNode as CommandId | undefined} event={event} />
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
        <EventFlow event={event} />
      </EventProvider>
    </ReactFlowProvider>
  ) : (
    <div>{t('no_event_found')}</div>
  );
};

/* eslint-enable react-hooks/exhaustive-deps */
