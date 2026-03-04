import { Edge, useStore, type ReactFlowState } from '@xyflow/react';
import { useCallback } from 'react';

// Slight structural equality on relevant edges to prevent useless renderer
const edgesEquality = (prev: Edge[], next: Edge[]) => {
  if (prev.length !== next.length) return false;
  return prev.every(
    (e, i) =>
      e.source === next[i].source &&
      e.target === next[i].target &&
      e.sourceHandle === next[i].sourceHandle &&
      e.targetHandle === next[i].targetHandle,
  );
};

// TODO: Improve this hooks to manage more handles
export const useHandleConnectionState = (nodeId: string) => {
  const selectNodeEdges = useCallback(
    (store: ReactFlowState) => store.edges.filter((edge) => edge.source === nodeId || edge.target === nodeId),
    [nodeId],
  );

  const nodeEdges = useStore(selectNodeEdges, edgesEquality);
  const handleLeftIsConnected = nodeEdges.some(({ target, targetHandle }) => target === nodeId && targetHandle === 'Tleft_default');
  const handleRightIsConnected = nodeEdges.some(({ source, sourceHandle }) => source === nodeId && sourceHandle === 'Sright_default');

  return { handleLeftIsConnected, handleRightIsConnected };
};
