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
import { buildLinks, getOffset, getOppositeCardinal, initMainMapLinkNode, type MapLinkNodeType } from '@utils/MapLinkUtils';
import { MapLinkNode } from './mapLinkNodeV2/MapLinkNode';
import { useUpdateMapLink } from './editors';
import { cloneEntity } from '@utils/cloneEntity';
import type { MapLinkDialogsRef } from './editors/MapLinkEditorOverlay';
import { useProjectMapLinks } from '@hooks/useProjectData';
import { FitViewButton } from '@components/buttons';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const TILE_SIZE = 32;

type UpdateOffsetType = { cardinal: StudioMapLinkCardinal; newPosition: Node['position']; index: number };

type MinMaxNodesType = { minNodeX: Node; maxNodeX: Node; minNodeY: Node; maxNodeY: Node };

type ReactFlowMapLinkProps = {
  mapLink: StudioMapLink;
  maps: Record<number, StudioMap>;
  setCardinal: (cardinal: StudioMapLinkCardinal) => void;
  dialogsRef?: MapLinkDialogsRef;
};

export const ReactFlowMapLinkV2 = ({ mapLink, maps, setCardinal, dialogsRef }: ReactFlowMapLinkProps) => {
  const reactFlowInstance = useReactFlow();
  const reactFlowRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useNodesState<MapLinkNodeType>([
    initMainMapLinkNode(mapLink, maps, TILE_SIZE, setCardinal, dialogsRef),
    ...buildLinks(mapLink, maps, TILE_SIZE),
  ]);
  const nodeTypes = useMemo(() => ({ mainMapLinkNode: MainMapLinkNode, mapLinkNode: MapLinkNode }), []);
  const updateMapLink = useUpdateMapLink(mapLink);
  const { projectDataValues: allMapLinks, setProjectDataValues: setMapLink } = useProjectMapLinks();
  const [updateOffset, setUpdateOffset] = useState<UpdateOffsetType | undefined>(undefined);

  const onFitView = () => {
    const rf = reactFlowInstance;
    const allNodes = rf.getNodes();
    const mainNode = allNodes.find((n) => n.id === 'main-map-link-node');
    if (!mainNode || !reactFlowRef.current) return;

    const minMaxNodes: MinMaxNodesType = { minNodeX: mainNode, maxNodeX: mainNode, minNodeY: mainNode, maxNodeY: mainNode };
    const mainCenter = {
      x: mainNode.position.x + (mainNode.measured?.width ?? 0) / 2,
      y: mainNode.position.y + (mainNode.measured?.height ?? 0) / 2,
    };

    allNodes.forEach((n) => {
      minMaxNodes.minNodeX = n.position.x < minMaxNodes.minNodeX.position.x ? n : minMaxNodes.minNodeX;
      minMaxNodes.maxNodeX =
        n.position.x + (n.measured?.width ?? 0) > minMaxNodes.maxNodeX.position.x + (minMaxNodes.maxNodeX.measured?.width ?? 0)
          ? n
          : minMaxNodes.maxNodeX;
      minMaxNodes.minNodeY = n.position.y < minMaxNodes.minNodeY.position.y ? n : minMaxNodes.minNodeY;
      minMaxNodes.maxNodeY =
        n.position.y + (n.measured?.height ?? 0) > minMaxNodes.maxNodeY.position.y + (minMaxNodes.maxNodeY.measured?.height ?? 0)
          ? n
          : minMaxNodes.maxNodeY;
    });

    const maxNodeX = minMaxNodes.maxNodeX;
    const maxNodeY = minMaxNodes.maxNodeY;
    const left = Math.abs(minMaxNodes.minNodeX.position.x);
    const right = Math.abs(
      maxNodeX.position.x < (mainNode.measured?.width ?? 0)
        ? (maxNodeX.measured?.width ?? 0) - (mainNode.measured?.width ?? 0) + maxNodeX.position.x
        : maxNodeX.position.x - (mainNode.measured?.width ?? 0) + (maxNodeX?.measured?.width ?? 0)
    );
    const top = Math.abs(minMaxNodes.minNodeY.position.y);
    const bottom = Math.abs(
      maxNodeY.position.y ?? 0 < (mainNode.measured?.height ?? 0)
        ? (maxNodeY.measured?.height ?? 0) - (mainNode.measured?.height ?? 0) + maxNodeY.position.y
        : maxNodeY.position.y - (mainNode.measured?.height ?? 0) + (maxNodeY?.measured?.height ?? 0)
    );

    const widthBounds = Math.max(left, right) * 2 + (mainNode.measured?.width ?? 0);
    const heightBounds = Math.max(top, bottom) * 2 + (mainNode.measured?.height ?? 0);

    const { clientWidth: width, clientHeight: height } = reactFlowRef.current;
    const zoomX = width / widthBounds;
    const zoomY = height / heightBounds;
    const padding = 0.83;
    const zoom = Math.min(zoomX, zoomY) * padding;

    rf.setViewport({
      x: width / 2 - mainCenter.x * zoom,
      y: height / 2 - mainCenter.y * zoom,
      zoom,
    });
  };

  useEffect(() => {
    if (!updateOffset) return;

    setUpdateOffset(undefined);
    const { cardinal, newPosition, index } = updateOffset;
    const offset = getOffset(cardinal, newPosition, TILE_SIZE);
    const links = cloneEntity(getLinksFromMapLink(mapLink, cardinal));
    if (index !== undefined && links[index].offset === offset) return;

    links[index].offset = offset;
    updateMapLink({ [`${cardinal}Maps`]: links });

    const reverseMapLink = Object.values(allMapLinks).find((mapLink) => mapLink.mapId === links[index].mapId);
    if (!reverseMapLink) return;

    const oppositeCardinal = getOppositeCardinal(cardinal);
    const reverseMapLinkEdited = cloneEntity(reverseMapLink);
    const reverseLink = reverseMapLinkEdited[`${oppositeCardinal}Maps`].find(({ mapId }) => mapId === mapLink.mapId);
    if (!reverseLink) return;

    reverseLink.offset = -offset;
    setMapLink({ [reverseMapLinkEdited.dbSymbol]: reverseMapLinkEdited });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateOffset]);

  const onNodesChange: OnNodesChange<MapLinkNodeType> = useCallback((changes) => {
    setNodes((nds) => {
      const updatedChanges = changes.map((change) => {
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
    const timer = setTimeout(onFitView, 50);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLink.id]);

  useEffect(() => {
    setNodes([initMainMapLinkNode(mapLink, maps, TILE_SIZE, setCardinal, dialogsRef), ...buildLinks(mapLink, maps, TILE_SIZE)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLink]);

  return (
    <ReactFlow
      ref={reactFlowRef}
      nodes={nodes}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      snapToGrid
      snapGrid={[TILE_SIZE, TILE_SIZE]}
      nodesDraggable={true}
      nodesConnectable={false}
      style={{
        zIndex: 1,
      }}
      minZoom={0.15}
      maxZoom={1}
      deleteKeyCode={null}
    >
      <Background gap={TILE_SIZE} offset={TILE_SIZE} variant={BackgroundVariant.Dots} />
      <Controls showInteractive={false} position="bottom-right" showFitView={false}>
        <FitViewButton onClick={onFitView} />
      </Controls>
    </ReactFlow>
  );
};
