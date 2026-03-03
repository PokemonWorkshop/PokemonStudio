import { useStore, type ReactFlowState } from '@xyflow/react';

const selectNodeEdges = (nodeId: string) => (store: ReactFlowState) => store.edges.filter((edge) => edge.source === nodeId || edge.target === nodeId);

// TODO: Improve this hooks to manage more handles
export const useHandleConnectionState = (nodeId: string) => {
  const nodeEdges = useStore(selectNodeEdges(nodeId), (prev, next) => {
    if (prev.length !== next.length) return false;
    // Slight structural equality on relevant edges to prevent useless renderer
    return prev.every(
      (e, i) =>
        e.source === next[i].source &&
        e.target === next[i].target &&
        e.sourceHandle === next[i].sourceHandle &&
        e.targetHandle === next[i].targetHandle,
    );
  });
  const handleLeftIsConnected = nodeEdges.some(({ target, targetHandle }) => target === nodeId && targetHandle === 'Tleft_default');
  const handleRightIsConnected = nodeEdges.some(({ source, sourceHandle }) => source === nodeId && sourceHandle === 'Sright_default');

  return { handleLeftIsConnected, handleRightIsConnected };
};
