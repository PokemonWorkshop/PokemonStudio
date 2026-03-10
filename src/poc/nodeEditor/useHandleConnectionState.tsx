import { Edge, useStore, type ReactFlowState } from '@xyflow/react';
import { useCallback } from 'react';

// Slight structural equality on relevant edges to prevent useless renderer
const edgesEquality = (prev: Edge[], next: Edge[]) => {
  return prev.every(
    (e, i) =>
      e.source === next[i].source &&
      e.target === next[i].target &&
      e.sourceHandle === next[i].sourceHandle &&
      e.targetHandle === next[i].targetHandle,
  );
};

export const useHandleConnectionState = (nodeId: string) => {
  const selectNodeEdges = useCallback(
    (store: ReactFlowState) => ({
      edges: store.edges.filter((edge) => edge.source === nodeId || edge.target === nodeId),
      handles: store.nodeLookup.get(nodeId)?.internals?.handleBounds,
    }),
    [nodeId],
  );

  const { edges, handles } = useStore(selectNodeEdges, (prev, next) => {
    if (prev.edges.length !== next.edges.length) return false;
    if (prev.handles?.source?.length !== next.handles?.source?.length) return false;
    if (prev.handles?.target?.length !== next.handles?.target?.length) return false;
    return edgesEquality(prev.edges, next.edges);
  });

  const isHandleConnected = useCallback(
    (handleId: string, type: 'source' | 'target') => {
      if (type === 'target') {
        return edges.some(({ target, targetHandle }) => target === nodeId && targetHandle === handleId);
      }
      return edges.some(({ source, sourceHandle }) => source === nodeId && sourceHandle === handleId);
    },
    [edges, nodeId],
  );

  return { isHandleConnected, handles };
};
