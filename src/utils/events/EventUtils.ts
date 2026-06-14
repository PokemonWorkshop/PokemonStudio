import type { CommandDialogsRef } from '@components/world/event/commands/editors/CommandEditorOverlay';
import type { CommandId, ConnectionId, StudioEventCommandConnection } from '@modelEntities/event/command';
import type { StudioEvent } from '@modelEntities/event/event';
import { findFirstAvailableId } from '@utils/ModelUtils';
import type { Connection, Edge } from '@xyflow/react';

const XY_EDGE = 'xy-edge__';
const COMMAND = 'command_';

export const reactFlowEdgeToStudioConnection = (id: string): ConnectionId => {
  return id.replace(XY_EDGE, '') as ConnectionId;
};

export const reactFlowConnectionToStudioConnection = (connection: Connection): ConnectionId => {
  const { source, sourceHandle, target, targetHandle } = connection;
  return `${source}${sourceHandle}-${target}${targetHandle}` as ConnectionId;
};

export const getCommandId = (event: StudioEvent) => {
  const keys = Object.keys(event.commands).map((key) => key.replace(COMMAND, ''));
  const record = keys.reduce<Record<string, { id: number }>>((acc, key) => {
    acc[key] = { id: Number(key) };
    return acc;
  }, {});
  const id = findFirstAvailableId(record, 0);
  return `${COMMAND}${id}`;
};

export const initCommandNodes = (event: StudioEvent, dialogsRef?: CommandDialogsRef) => {
  return Object.entries(event.commands).map(([id, command]) => ({
    id,
    type: command?.type,
    position: { x: command?.studioData.x || 0, y: command?.studioData.y || 0 },
    data: { dialogsRef, command, comments: command?.studioData.comments, csvFileId: event.csvFileId },
  }));
};

const buildEdges = (commandId: CommandId, connections: Partial<Record<ConnectionId, StudioEventCommandConnection>>) => {
  return Object.entries(connections).reduce<Edge[]>((prev, [id, connection]) => {
    if (!connection) return prev;

    return [
      ...prev,
      {
        id: `${XY_EDGE}${id}`,
        ...connection,
        source: commandId,
        selected: false,
      },
    ];
  }, []);
};

export const initEdges = (event: StudioEvent) => {
  return Object.entries(event.commands).reduce<Edge[]>((prev, [id, command]) => {
    if (!command || !command.connections) return prev;

    return [...prev, ...buildEdges(id as CommandId, command.connections)];
  }, []);
};
