import { getLinksFromMapLink, StudioMapLinkCardinal, type StudioMapLink } from '@modelEntities/mapLink';
import type { StudioMap } from '@modelEntities/map';
import {
  applyNodeChanges,
  Background,
  BackgroundVariant,
  Controls,
  Node,
  OnNodesChange,
  ReactFlow,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';
import { MainMapLinkNode } from './mapLinkNodeV2/MainMapLinkNode';
import { buildAddMapNodes, buildLinks, getOffset, initMainMapLinkNode, type MapLinkNodeType } from '@utils/MapLinkUtils';
import { MapLinkNode } from './mapLinkNodeV2/MapLinkNode';
import { MapLinkAddMapNode } from './mapLinkNodeV2/MapLinkAddMapNode';
import { useUpdateMapLink } from './editors';
import { cloneEntity } from '@utils/cloneEntity';
import type { MapLinkDialogsRef } from './editors/MapLinkEditorOverlay';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

const TILE_SIZE = 32;

type UpdateOffsetType = { cardinal: StudioMapLinkCardinal; newPosition: Node['position']; index: number };

type ReactFlowMapLinkProps = {
  mapLink: StudioMapLink;
  maps: Record<number, StudioMap>;
  dialogsRef?: MapLinkDialogsRef;
};

export const ReactFlowMapLinkV2 = ({ mapLink, maps, dialogsRef }: ReactFlowMapLinkProps) => {
  const reactFlowInstance = useReactFlow();
  const [nodes, setNodes] = useNodesState<MapLinkNodeType>([initMainMapLinkNode(mapLink, maps), ...buildLinks(mapLink, maps, TILE_SIZE)]);
  const nodeTypes = useMemo(() => ({ mainMapLinkNode: MainMapLinkNode, mapLinkNode: MapLinkNode, mapLinkAddMapNode: MapLinkAddMapNode }), []);
  const updateMapLink = useUpdateMapLink(mapLink);
  const [updateOffset, setUpdateOffset] = useState<UpdateOffsetType | undefined>(undefined);
  const [showAddMapNode, setShowAddMapNode] = useState<boolean>(false);

  useEffect(() => {
    if (!updateOffset) return;

    setUpdateOffset(undefined);
    const { cardinal, newPosition, index } = updateOffset;
    const offset = getOffset(cardinal, newPosition, TILE_SIZE);
    const links = cloneEntity(getLinksFromMapLink(mapLink, cardinal));
    if (index !== undefined && links[index].offset === offset) return;

    links[index].offset = offset;
    updateMapLink({ [`${cardinal}Maps`]: links });
    // TODO: implement map reverse offset
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateOffset]);

  useEffect(() => {
    setNodes((nds) => {
      const ndsFiltered = nds.filter((node) => !node.id.startsWith('map-link-add-map-node'));
      const addMapNodes = buildAddMapNodes(mapLink, maps, TILE_SIZE, dialogsRef);
      addMapNodes.forEach((node) => (node.hidden = !showAddMapNode));
      return [...ndsFiltered, ...addMapNodes];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAddMapNode]);

  const onNodesChange: OnNodesChange<MapLinkNodeType> = useCallback((changes) => {
    setNodes((nds) => {
      const updatedChanges = changes.map((change) => {
        if (change.type === 'select' && !change.id.startsWith('map-link-node')) {
          const hasSelectedAddMapNode = changes.some(
            (change) => change.type === 'select' && change.id.startsWith('map-link-add-map-node') && change.selected
          );
          setShowAddMapNode(change.selected || hasSelectedAddMapNode);
          return change;
        }

        if (change.type !== 'position') return change;

        const node = nds.find((n) => n.id === change.id);
        if (!node) return change;

        const { cardinal, index } = node.data;
        const newPos = change.position;
        if (!newPos) return change;

        if (change.dragging === false) {
          if (!cardinal || index === undefined) return change;

          setUpdateOffset({ cardinal, newPosition: newPos, index });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // there is not properties to hide the viewport, but it can be moved outside the window ; it's necessary to prevent a blink
    reactFlowInstance.setViewport({ x: 0, y: -10000, zoom: 1 });

    // it's necessary to wait that reactFlowInstance has the new nodes and edges to do a correct fitView
    const timer = setTimeout(() => reactFlowInstance.fitView(), 50);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLink.id]);

  useEffect(() => {
    setNodes([
      initMainMapLinkNode(mapLink, maps),
      ...buildLinks(mapLink, maps, TILE_SIZE),
      ...buildAddMapNodes(mapLink, maps, TILE_SIZE, dialogsRef),
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLink]);

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
      minZoom={0.15}
      maxZoom={1}
      deleteKeyCode={null}
    >
      <Background gap={TILE_SIZE} offset={TILE_SIZE} variant={BackgroundVariant.Dots} />
      <Controls showInteractive={false} position="bottom-right" />
    </ReactFlow>
  );
};
