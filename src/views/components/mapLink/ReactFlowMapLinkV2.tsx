import type { StudioMapLink } from '@modelEntities/mapLink';
import type { StudioMap } from '@modelEntities/map';
import { cloneEntity } from '@utils/cloneEntity';
import { Background, BackgroundVariant, Controls, Node, ReactFlow, ReactFlowProvider, useNodesState, useReactFlow } from '@xyflow/react';
import { MainMapLinkNode } from './mapLinkCard/MainMapLinkNode';
import React, { useEffect, useMemo } from 'react';

type MapLinkNodeData = {
  index?: number;
  mapLink?: StudioMapLink;
  maps: Record<number, StudioMap>;
  cardinal?: string;
};

type MapLinkNodeType = Node<MapLinkNodeData, 'mainMapLinkCard' | 'mapLinkCard'>;

type ReactFlowMapLinkProps = {
  mapLink: StudioMapLink;
  maps: Record<number, StudioMap>;
};

export const ReactFlowMapLinkV2 = ({ mapLink, maps }: ReactFlowMapLinkProps) => {
  //const reactFlowInstance = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState<MapLinkNodeType>([
    {
      id: 'main-map-link-card',
      position: { x: 0, y: 0 },
      type: 'mainMapLinkCard',
      data: { mapLink, maps },
      draggable: false,
      className: 'nopan',
    },
  ]);
  const nodeTypes = useMemo(() => ({ mainMapLinkCard: MainMapLinkNode }), []);

  useEffect(() => {
    setNodes((nodes) => {
      const newNodes = cloneEntity(nodes);
      newNodes[0].data = { ...nodes[0].data, mapLink };
      return newNodes;
    });
  }, [mapLink]);

  return (
    <ReactFlow
      nodes={nodes}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      snapToGrid
      snapGrid={[32, 32]}
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
      <Background gap={32} variant={BackgroundVariant.Dots} />
      <Controls showInteractive={false} position="bottom-right" />
    </ReactFlow>
  );
};
