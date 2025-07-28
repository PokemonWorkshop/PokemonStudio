import type { StudioMapLink } from '@modelEntities/mapLink';
import type { StudioMap } from '@modelEntities/map';
import { Background, BackgroundVariant, Controls, Node, ReactFlow, useNodesState, useReactFlow } from '@xyflow/react';
import { MainMapLinkNode } from './mapLinkCard/MainMapLinkNode';
import React, { useEffect, useMemo } from 'react';
import { buildLinks } from '@utils/MapLinkUtils';
import { MapLinkNode } from './mapLinkCard/MapLinkNode';

const TILE_SIZE = 32;

type MapLinkNodeData = {
  index?: number;
  mapLink?: StudioMapLink;
  maps: Record<number, StudioMap>;
  cardinal?: string;
};

type MapLinkNodeType = Node<MapLinkNodeData, 'mainMapLinkNode' | 'mapLinkNode'>;

type ReactFlowMapLinkProps = {
  mapLink: StudioMapLink;
  maps: Record<number, StudioMap>;
};

export const ReactFlowMapLinkV2 = ({ mapLink, maps }: ReactFlowMapLinkProps) => {
  const reactFlowInstance = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState<MapLinkNodeType>([
    {
      id: 'main-map-link-node',
      position: { x: 0, y: 0 },
      type: 'mainMapLinkNode',
      data: { mapLink, maps },
      draggable: false,
      className: 'nopan',
    },
    ...buildLinks(mapLink, maps, TILE_SIZE),
  ]);
  console.log(nodes);
  const nodeTypes = useMemo(() => ({ mainMapLinkNode: MainMapLinkNode, mapLinkNode: MapLinkNode }), []);

  useEffect(() => {
    setNodes([
      {
        id: 'main-map-link-node',
        position: { x: 0, y: 0 },
        type: 'mainMapLinkNode',
        data: { mapLink, maps },
        draggable: false,
        className: 'nopan',
      },
      ...buildLinks(mapLink, maps, TILE_SIZE),
    ]);

    // there is not properties to hide the viewport, but it can be moved outside the window ; it's necessary to prevent a blink
    reactFlowInstance.setViewport({ x: 0, y: -10000, zoom: 1 });

    // it's necessary to wait that reactFlowInstance has the new nodes and edges to do a correct fitView
    const timer = setTimeout(() => reactFlowInstance.fitView(), 50);
    return () => clearTimeout(timer);
  }, [mapLink.mapId]);

  return (
    <ReactFlow
      nodes={nodes}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      snapToGrid
      snapGrid={[TILE_SIZE, TILE_SIZE]}
      nodesDraggable={true}
      nodesConnectable={false}
      fitView
      style={{
        zIndex: 1,
      }}
      minZoom={0.2}
      maxZoom={1}
      deleteKeyCode={null}
    >
      <Background gap={TILE_SIZE} offset={TILE_SIZE} variant={BackgroundVariant.Dots} />
      <Controls showInteractive={false} position="bottom-right" />
    </ReactFlow>
  );
};
