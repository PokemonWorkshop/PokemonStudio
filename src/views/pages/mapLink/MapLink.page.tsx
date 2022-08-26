import React, { useCallback, useMemo } from 'react';
import ReactFlow, { addEdge, useNodesState, useEdgesState } from 'react-flow-renderer';
import { useTranslation } from 'react-i18next';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { MapLinkControlBar } from '@components/mapLink/mapLinkControlBar';
import CreateNode from '@components/mapLink/createNode';
import MapCard from '@components/mapLink/mapCard';
import theme from '../../../AppTheme';

const initialNodes = [
  {
    id: 'index',
    position: { x: 0, y: 0 },
    type: 'mapCard',
  },
  {
    id: 'createTop',
    position: { x: 108, y: -80 },
    type: 'createButton',
  },
  {
    id: 'createRight',
    position: { x: 296, y: 60 },
    type: 'createButton',
  },
  {
    id: 'createBottom',
    position: { x: 108, y: 200 },
    type: 'createButton',
  },
  {
    id: 'createLeft',
    position: { x: -80, y: 60 },
    type: 'createButton',
  },
];

const initialsEdges = [
  { source: 'index', target: 'createTop', targetHandle: 'Tbottom', type: 'smoothstep', animated: true, style: { stroke: theme.colors.primaryBase } },
  { source: 'index', target: 'createRight', targetHandle: 'Tleft', type: 'smoothstep', animated: true, style: { stroke: theme.colors.primaryBase } },
  { source: 'index', target: 'createBottom', targetHandle: 'Ttop', type: 'smoothstep', animated: true, style: { stroke: theme.colors.primaryBase } },
  { source: 'index', target: 'createLeft', targetHandle: 'Tright', type: 'smoothstep', animated: true, style: { stroke: theme.colors.primaryBase } },
];

const MapLinkPage = () => {
  const { t } = useTranslation('database_maplink');

  const nodeTypes = useMemo(() => ({ createButton: CreateNode, mapCard: MapCard }), []);

  const onInit = (reactFlowInstance) => console.log('flow loaded:', reactFlowInstance);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialsEdges);
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

  return (
    <DatabasePageStyle>
      <MapLinkControlBar onChange={() => {}} zone={''} onClickNewZone={() => {}} />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        attributionPosition="top-right"
        nodesDraggable={false}
        nodesConnectable={false}
        fitView
        fitViewOptions={{
          padding: 1,
        }}
      ></ReactFlow>
    </DatabasePageStyle>
  );
};

export default MapLinkPage;
