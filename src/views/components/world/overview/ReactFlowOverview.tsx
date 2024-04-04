import React, { useEffect, useMemo } from 'react';
import ReactFlow, { Background, BackgroundVariant, Controls, useNodesState, useReactFlow } from 'react-flow-renderer';
import { MapOverviewNode } from './MapOverviewNode';
import { StudioMap } from '@modelEntities/map';
import { cloneEntity } from '@utils/cloneEntity';
import { useDialogsRef } from '@utils/useDialogsRef';
import { MapEditorAndDeletionKeys } from '../map/editors/MapEditorOverlay';

type ReactFlowOverviewProps = {
  map: StudioMap;
};

export const ReactFlowOverview = ({ map }: ReactFlowOverviewProps) => {
  const reactFlowInstance = useReactFlow();
  const dialogsRef = useDialogsRef<MapEditorAndDeletionKeys>();
  const nodeTypes = useMemo(() => ({ mapOverview: MapOverviewNode }), []);
  const [nodes, setNodes, onNodesChange] = useNodesState([
    {
      id: 'map-overview',
      position: { x: 0, y: 0 },
      type: 'mapOverview',
      data: { tiledFilename: map.tiledFilename, dialogsRef },
    },
  ]);

  useEffect(() => {
    setNodes((nodes) => {
      nodes[0].data.tiledFilename = map.tiledFilename;
      return cloneEntity(nodes);
    });
    // there is not properties to hide the viewport, but it can be moved outside the window ; it's necessary to prevent a blink
    reactFlowInstance.setViewport({ x: 0, y: -10000, zoom: 1 });
    // it's necessary to wait that reactFlowInstance has the new node to do a correct fitView
    setTimeout(() => reactFlowInstance.fitView(), 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map.dbSymbol]);

  return (
    <ReactFlow
      nodeTypes={nodeTypes}
      nodes={nodes}
      onNodesChange={onNodesChange}
      snapToGrid
      snapGrid={[16, 16]}
      style={{
        zIndex: 1,
      }}
      fitView
      nodesDraggable={true}
      nodesConnectable={false}
      deleteKeyCode={null}
      minZoom={0.5}
      maxZoom={2}
    >
      <Background gap={16} variant={BackgroundVariant.Dots} />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
};
