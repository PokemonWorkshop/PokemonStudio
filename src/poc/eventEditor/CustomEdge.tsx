import theme from '@src/AppTheme';
import { BaseEdge, EdgeProps, getBezierPath } from '@xyflow/react';
import React from 'react';

const CustomEdge = ({ id, selected, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd, style }: EdgeProps) => {
  const [edgePath] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      markerEnd={markerEnd}
      style={{
        ...style,
        stroke: selected ? theme.colors.text400 : '#383a40',
        strokeWidth: selected ? 2 : 1,
      }}
    />
  );
};

export const edgeTypes = { default: CustomEdge };
export const CustomConnectionLineStyle = { stroke: theme.colors.text400, strokeWidth: 1 };
