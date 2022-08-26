import React from 'react';
import styled from 'styled-components';
import { Handle, Position } from 'react-flow-renderer';

import { SecondaryButtonWithPlusIcon } from '@components/buttons/SecondaryButtonWithPlusIcon';

type MapCardProps = {
  onClick: () => void;
};

const handleStyle = {
  background: 'none',
  color: 'none',
  border: 'none',
};

const SquareButton = styled.div`
  border-radius: 4px;
  width: 256px;
  height: 160px;
  background-color: ${({ theme }) => theme.colors.dark16};
  color: ${({ theme }) => theme.colors.text100};
  cursor: default;
`;

const MapCard = ({ onClick }: MapCardProps) => {
  return (
    <>
      <Handle type="target" position={Position.Top} id="Ttop" style={{ ...handleStyle, top: 0 }} />
      <Handle type="target" position={Position.Right} id="Tright" style={{ ...handleStyle, right: 0 }} />
      <Handle type="target" position={Position.Bottom} id="Tbottom" style={{ ...handleStyle, bottom: 0 }} />
      <Handle type="target" position={Position.Left} id="Tleft" style={{ ...handleStyle, left: 0 }} />
      <Handle type="source" position={Position.Top} id="Stop" style={{ ...handleStyle, top: 0 }} />
      <Handle type="source" position={Position.Right} id="Sright" style={{ ...handleStyle, right: 0 }} />
      <Handle type="source" position={Position.Bottom} id="Sbottom" style={{ ...handleStyle, bottom: 0 }} />
      <Handle type="source" position={Position.Left} id="Sleft" style={{ ...handleStyle, left: 0 }} />
      <SquareButton onClick={onClick}></SquareButton>
    </>
  );
};

export default MapCard;
