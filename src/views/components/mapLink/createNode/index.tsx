import React from 'react';
import styled from 'styled-components';
import { Handle, Position } from 'react-flow-renderer';

import { SecondaryButtonWithPlusIcon } from '@components/buttons/SecondaryButtonWithPlusIcon';

type CreateNodeProps = {
  onClick: () => void;
};

const handleStyle = {
  background: 'none',
  color: 'none',
  border: 'none',
  cursor: 'pointer',
};

const SquareButton = styled(SecondaryButtonWithPlusIcon)`
  border-radius: 8px;
  width: 40px;
  height: 40px;
  padding: 0;
  gap: 0;
`;

const CreateNode = ({ onClick }: CreateNodeProps) => {
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

export default CreateNode;
