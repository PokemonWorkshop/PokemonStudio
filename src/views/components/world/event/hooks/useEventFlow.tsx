import {
  CommandId,
  StudioEventCommand,
  StudioEventCommandData,
  StudioEventCommandShowChoice,
  StudioEventCommandShowMessage,
  StudioEventCommandType,
} from '@modelEntities/event/command';
import { StudioEvent } from '@modelEntities/event/event';
import { cloneEntity } from '@utils/cloneEntity';
import { EventCommandCreation } from '@utils/eventCommandCreation';
import {
  getCommandId,
  initCommandNodes,
  initEdges,
  reactFlowConnectionToStudioConnection,
  reactFlowEdgeToStudioConnection,
} from '@utils/events/EventUtils';
import { useSetProjectText } from '@utils/ReadingProjectText';
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
import { DragEventHandler, RefObject, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CommandDialogsRef } from '../commands/editors/CommandEditorOverlay';
import { useEventContext } from '../common/EventContext';
import { useUpdateEvent } from './useUpdateEvent';

const SHADOW_NODE_ID = 'shadow_node';

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
      updateEvent({ commands: commandsEdited });
      return params;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [event],
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reactFlowInstance.getNodes, reactFlowInstance.getEdges],
  );

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
