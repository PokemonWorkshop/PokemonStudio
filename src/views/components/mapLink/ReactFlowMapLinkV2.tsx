import type { StudioMapLink } from '@modelEntities/mapLink';
import type { StudioMap } from '@modelEntities/map';
import { applyNodeChanges, Background, BackgroundVariant, Controls, OnNodesChange, ReactFlow, useNodesState, useReactFlow } from '@xyflow/react';
import { MainMapLinkNode } from './mapLinkCard/MainMapLinkNode';
import { buildLinks, getOffset, initMainMapLinkNode, type MapLinkNodeType } from '@utils/MapLinkUtils';
import { MapLinkNode } from './mapLinkCard/MapLinkNode';
import React, { useEffect, useMemo } from 'react';

const TILE_SIZE = 32;

type ReactFlowMapLinkProps = {
  mapLink: StudioMapLink;
  maps: Record<number, StudioMap>;
};

export const ReactFlowMapLinkV2 = ({ mapLink, maps }: ReactFlowMapLinkProps) => {
  const reactFlowInstance = useReactFlow();
  const [nodes, setNodes] = useNodesState<MapLinkNodeType>([initMainMapLinkNode(mapLink, maps), ...buildLinks(mapLink, maps, TILE_SIZE)]);
  const nodeTypes = useMemo(() => ({ mainMapLinkNode: MainMapLinkNode, mapLinkNode: MapLinkNode }), []);

  const onNodesChange: OnNodesChange<MapLinkNodeType> = (changes) => {
    setNodes((nds) => {
      const updatedChanges = changes.map((change) => {
        if (change.type !== 'position') return change;

        const node = nds.find((n) => n.id === change.id);
        if (!node) return change;

        const { cardinal, index } = node.data;
        const newPos = change.position;
        if (!newPos) return change;

        if (change.dragging === false) {
          console.log('drag end'); // TODO: save the change in the global state
          if (!cardinal) return change;

          const offset = getOffset(cardinal, newPos, TILE_SIZE);
          console.log(offset);
        }

        switch (cardinal) {
          case 'north':
          case 'south':
            return {
              ...change,
              position: {
                x: newPos.x,
                y: node.position.y,
              },
            };
          case 'east':
          case 'west':
            return {
              ...change,
              position: {
                x: node.position.x,
                y: newPos.y,
              },
            };
        }
        return change;
      });
      return applyNodeChanges(updatedChanges, nds);
    });
  };

  useEffect(() => {
    setNodes([initMainMapLinkNode(mapLink, maps), ...buildLinks(mapLink, maps, TILE_SIZE)]);

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
