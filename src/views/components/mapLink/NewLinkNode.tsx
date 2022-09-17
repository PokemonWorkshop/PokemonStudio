import React from 'react';
import styled from 'styled-components';
import { Handle, Position } from 'react-flow-renderer';

import { SecondaryButtonWithPlusIcon } from '@components/buttons/SecondaryButtonWithPlusIcon';
import { MaplinkHandleStyle } from './MapLinkHandleStyle';

type NewLinkNodeProps = {
  data: { onClick: () => void };
};

const NewLinkButton = styled(SecondaryButtonWithPlusIcon)`
  border-radius: 8px;
  width: 40px;
  height: 40px;
  padding: 0;
  gap: 0;
  cursor: pointer;
`;

export const NewLinkNode = ({ data }: NewLinkNodeProps) => {
  return (
    <>
      <Handle type="target" position={Position.Top} id="Ttop" style={{ ...MaplinkHandleStyle, top: 0 }} />
      <Handle type="target" position={Position.Right} id="Tright" style={{ ...MaplinkHandleStyle, right: 0 }} />
      <Handle type="target" position={Position.Bottom} id="Tbottom" style={{ ...MaplinkHandleStyle, bottom: 0 }} />
      <Handle type="target" position={Position.Left} id="Tleft" style={{ ...MaplinkHandleStyle, left: 0 }} />
      <Handle type="source" position={Position.Top} id="Stop" style={{ ...MaplinkHandleStyle, top: 0 }} />
      <Handle type="source" position={Position.Right} id="Sright" style={{ ...MaplinkHandleStyle, right: 0 }} />
      <Handle type="source" position={Position.Bottom} id="Sbottom" style={{ ...MaplinkHandleStyle, bottom: 0 }} />
      <Handle type="source" position={Position.Left} id="Sleft" style={{ ...MaplinkHandleStyle, left: 0 }} />
      <NewLinkButton onClick={data.onClick} />
    </>
  );
};
