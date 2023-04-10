import React, { useCallback, useEffect, useMemo, useState } from 'react';
import theme from '@src/AppTheme';
import ReactFlow, { addEdge, Connection, Controls, Edge, useEdgesState, useNodesState, useReactFlow } from 'react-flow-renderer';
import { CurrentMapLinkCardNode, MapLinkCardNode } from './mapLinkCard';
import { NewLinkNode } from './NewLinkNode';
import { PointNode } from './PointNode';
import { assertUnreachable } from '@utils/assertUnreachable';
import { getLinksFromMapLink, MAP_LINK_CARDINAL_LIST, StudioMapLink, StudioMapLinkCardinal } from '@modelEntities/mapLink';

const createInitialNodes = (
  currentMapLink: StudioMapLink,
  mapData: Map<number, string>,
  onClickCreateNewLink: (cardinal: StudioMapLinkCardinal) => void
) => [
  {
    id: 'main-maplink-card',
    position: { x: 0, y: 0 },
    type: 'currentMapLinkCard',
    data: { mapLink: currentMapLink, mapData },
  },
  {
    id: 'create-link-north',
    position: { x: 108, y: -64 - (getLinksFromMapLink(currentMapLink, 'north').length <= 1 ? 0 : 8) },
    type: 'newLink',
    data: { onClick: () => onClickCreateNewLink('north') },
    hidden: getLinksFromMapLink(currentMapLink, 'north').length === 3,
  },
  {
    id: 'create-link-east',
    position: { x: 280 + (getLinksFromMapLink(currentMapLink, 'east').length <= 1 ? 0 : 8), y: 60 },
    type: 'newLink',
    data: { onClick: () => onClickCreateNewLink('east') },
    hidden: getLinksFromMapLink(currentMapLink, 'east').length === 3,
  },
  {
    id: 'create-link-south',
    position: { x: 108, y: 184 + (getLinksFromMapLink(currentMapLink, 'south').length <= 1 ? 0 : 8) },
    type: 'newLink',
    data: { onClick: () => onClickCreateNewLink('south') },
    hidden: getLinksFromMapLink(currentMapLink, 'south').length === 3,
  },
  {
    id: 'create-link-west',
    position: { x: -64 - (getLinksFromMapLink(currentMapLink, 'west').length <= 1 ? 0 : 8), y: 60 },
    type: 'newLink',
    data: { onClick: () => onClickCreateNewLink('west') },
    hidden: getLinksFromMapLink(currentMapLink, 'west').length === 3,
  },
];

const createInitialsEdges = (currentMapLink: StudioMapLink) => [
  {
    id: 'edges-north',
    source: 'main-maplink-card',
    target: 'create-link-north',
    targetHandle: 'Tbottom',
    type: 'smoothstep',
    animated: true,
    style: { stroke: theme.colors.primaryBase },
    hidden: getLinksFromMapLink(currentMapLink, 'north').length === 3,
  },
  {
    id: 'edges-east',
    source: 'main-maplink-card',
    target: 'create-link-east',
    targetHandle: 'Tleft',
    type: 'smoothstep',
    animated: true,
    style: { stroke: theme.colors.primaryBase },
    hidden: getLinksFromMapLink(currentMapLink, 'east').length === 3,
  },
  {
    id: 'edges-south',
    source: 'main-maplink-card',
    target: 'create-link-south',
    targetHandle: 'Ttop',
    type: 'smoothstep',
    animated: true,
    style: { stroke: theme.colors.primaryBase },
    hidden: getLinksFromMapLink(currentMapLink, 'south').length === 3,
  },
  {
    id: 'edges-west',
    source: 'main-maplink-card',
    target: 'create-link-west',
    targetHandle: 'Tright',
    type: 'smoothstep',
    animated: true,
    style: { stroke: theme.colors.primaryBase },
    hidden: getLinksFromMapLink(currentMapLink, 'west').length === 3,
  },
];

const northPositions = [
  [{ x: 0, y: -248 }],
  [
    { x: -136, y: -308 },
    { x: 136, y: -308 },
  ],
  [
    { x: -272, y: -372 },
    { x: 0, y: -372 },
    { x: 272, y: -372 },
  ],
];

const eastPositions = [
  [{ x: 344, y: 0 }],
  [
    { x: 404, y: -88 },
    { x: 404, y: 88 },
  ],
  [
    { x: 468, y: -176 },
    { x: 468, y: 0 },
    { x: 468, y: 176 },
  ],
];

const pointPositions = {
  north: [
    { x: 108, y: -104 },
    { x: 108, y: -136 },
  ],
  east: [
    { x: 360, y: 60 },
    { x: 392, y: 60 },
  ],
  south: [
    { x: 108, y: 264 },
    { x: 108, y: 296 },
  ],
  west: [
    { x: -104, y: 60 },
    { x: -136, y: 60 },
  ],
};

const getPosition = (index: number, cardinal: StudioMapLinkCardinal, max: number) => {
  switch (cardinal) {
    case 'north':
      return northPositions[max - 1][index];
    case 'east':
      return eastPositions[max - 1][index];
    case 'south':
      return { ...northPositions[max - 1][index], y: -northPositions[max - 1][index].y };
    case 'west':
      return { ...eastPositions[max - 1][index], x: -eastPositions[max - 1][index].x };
    default:
      assertUnreachable(cardinal);
      return { x: 0, y: 0 };
  }
};

const getEdgeHandle = (cardinal: StudioMapLinkCardinal) => {
  switch (cardinal) {
    case 'north':
      return { source: 'Stop', target: 'Tbottom' };
    case 'east':
      return { source: 'Sright', target: 'Tleft' };
    case 'south':
      return { source: 'Sbottom', target: 'Ttop' };
    case 'west':
      return { source: 'Sleft', target: 'Tright' };
    default:
      assertUnreachable(cardinal);
      return { source: 'Stop', target: 'Tbottom' };
  }
};

const pointTarget: Record<StudioMapLinkCardinal, string> = {
  north: 'Tbottom',
  east: 'Tleft',
  south: 'Ttop',
  west: 'Tright',
};

const getPointHandle = (cardinal: StudioMapLinkCardinal, length: number) => {
  switch (cardinal) {
    case 'north':
    case 'south':
      if (length === 2)
        return [
          { source: 'Sleft', target: pointTarget[cardinal] },
          { source: 'Sright', target: pointTarget[cardinal] },
        ];
      return [
        { source: 'Sleft', target: pointTarget[cardinal] },
        { source: cardinal === 'north' ? 'Stop' : 'Sbottom', target: pointTarget[cardinal] },
        { source: 'Sright', target: pointTarget[cardinal] },
      ];
    case 'east':
    case 'west':
      if (length === 2)
        return [
          { source: 'Stop', target: pointTarget[cardinal] },
          { source: 'Sbottom', target: pointTarget[cardinal] },
        ];
      return [
        { source: 'Stop', target: pointTarget[cardinal] },
        { source: cardinal === 'east' ? 'Sright' : 'Sleft', target: pointTarget[cardinal] },
        { source: 'Sbottom', target: pointTarget[cardinal] },
      ];
    default:
      assertUnreachable(cardinal);
      return [];
  }
};

const createEdge = (id: string, source: string, sourceHandle: string, target: string, targetHandle: string) => ({
  id,
  source,
  sourceHandle,
  target,
  targetHandle,
  type: 'smoothstep',
  animated: true,
  style: { stroke: theme.colors.primaryBase },
});

type ReactFlowMapLinkProps = {
  mapLinks: Record<string, StudioMapLink>;
  mapLink: StudioMapLink;
  mapData: Map<number, string>;
  onClickCreateNewLink: (cardinal: StudioMapLinkCardinal) => void;
  onDeleteLink: (index: number, cardinal: StudioMapLinkCardinal) => void;
  onEditOffset: (index: number, cardinal: StudioMapLinkCardinal, offset: number) => void;
  onEditLink: (index: number, cardinal: StudioMapLinkCardinal) => void;
};

export const ReactFlowMapLink = ({
  mapLinks,
  mapLink,
  mapData,
  onClickCreateNewLink,
  onDeleteLink,
  onEditOffset,
  onEditLink,
}: ReactFlowMapLinkProps) => {
  const reactFlowInstance = useReactFlow();
  const initialNodes = useMemo(() => createInitialNodes(mapLink, mapData, onClickCreateNewLink), [mapLink, mapData, onClickCreateNewLink]);
  const nodeTypes = useMemo(
    () => ({ newLink: NewLinkNode, currentMapLinkCard: CurrentMapLinkCardNode, mapLinkCard: MapLinkCardNode, point: PointNode }),
    []
  );
  const initialEdges = useMemo(() => createInitialsEdges(mapLink), [mapLink]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const onConnect = useCallback((params: Edge<never> | Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);
  const [currentMapId, setCurrentMapId] = useState<number>(mapLink.mapId);

  useEffect(() => {
    // reset nodes and edges with initial data
    setNodes(initialNodes);
    setEdges(initialEdges);
    MAP_LINK_CARDINAL_LIST.forEach((cardinal) => {
      const mapLinkLinks = getLinksFromMapLink(mapLink, cardinal);
      const edgeHandle = getEdgeHandle(cardinal);
      // create point nodes and the edges associated
      if (mapLinkLinks.length >= 2) {
        const newPointNode = {
          id: `point-${cardinal}`,
          position: pointPositions[cardinal][mapLinkLinks.length - 2],
          type: 'point',
          data: {
            cardinal,
          },
        };
        setNodes((nds) => nds.concat(newPointNode));
        if (mapLinkLinks.length === 2) {
          const newEdgeButtonToPoint = createEdge(
            `edges-link-point-${cardinal}`,
            `create-link-${cardinal}`,
            edgeHandle.source,
            `point-${cardinal}`,
            edgeHandle.target
          );
          setEdges((eds) => eds.concat(newEdgeButtonToPoint));
        } else if (mapLinkLinks.length === 3) {
          const newEdge = createEdge(`edges-main-point-${cardinal}`, `main-maplink-card`, edgeHandle.source, `point-${cardinal}`, edgeHandle.target);
          setEdges((eds) => eds.concat(newEdge));
        }
      }
      // create mapLinkLink nodes and the edges associated
      mapLinkLinks.forEach((mapLinkLink, index) => {
        const newLinkNode = {
          id: `${cardinal}-${index}`,
          position: getPosition(index, cardinal, mapLinkLinks.length),
          type: 'mapLinkCard',
          data: { mapLinkLink, index, cardinal, mapData, onDeleteLink, onEditOffset, onEditLink },
        };
        setNodes((nds) => nds.concat(newLinkNode));
        if (mapLinkLinks.length === 1) {
          const newEdge = createEdge(
            `edges-link-${cardinal}-${cardinal}-${index}`,
            `create-link-${cardinal}`,
            edgeHandle.source,
            `${cardinal}-${index}`,
            edgeHandle.target
          );
          setEdges((eds) => eds.concat(newEdge));
        } else if (mapLinkLinks.length >= 2) {
          const pointHandle = getPointHandle(cardinal, mapLinkLinks.length);
          const newEdge = createEdge(
            `edges-point-${cardinal}-${cardinal}-${index}`,
            `point-${cardinal}`,
            pointHandle[index].source,
            `${cardinal}-${index}`,
            pointHandle[index].target
          );
          setEdges((eds) => eds.concat(newEdge));
        }
      });
    });
    if (currentMapId !== mapLink.mapId) {
      // there is not properties to hide the viewport, but it can be moved outside the window ; it's necessary to prevent a blink
      reactFlowInstance.setViewport({ x: 0, y: -10000, zoom: 1 });
    }
    // it's necessary to wait that reactFlowInstance has the new nodes and edges to do a correct fitView
    const timer = setTimeout(() => {
      if (currentMapId !== mapLink.mapId) {
        reactFlowInstance.fitView();
        setCurrentMapId(mapLink.mapId);
      }
    }, 50);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLink, mapLinks, setNodes, setEdges]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      attributionPosition="bottom-right"
      nodesDraggable={false}
      nodesConnectable={false}
      fitView
      style={{
        zIndex: 1,
      }}
      minZoom={0.7}
      maxZoom={1}
      deleteKeyCode={null}
    >
      <Controls showInteractive={false} />
    </ReactFlow>
  );
};
