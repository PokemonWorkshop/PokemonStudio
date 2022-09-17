import React from 'react';
import styled from 'styled-components';
import { Handle, Position } from 'react-flow-renderer';
import { MaplinkHandleStyle } from './MapLinkHandleStyle';
import { Cardinal } from '@modelEntities/maplinks/MapLink.model';

type PointNodeStyleProps = {
  cardinal: Cardinal;
};

const PointNodeStyle = styled.div<PointNodeStyleProps>`
  width: ${({ cardinal }) => (cardinal === 'north' || cardinal === 'south' ? '40px' : '2px')};
  height: ${({ cardinal }) => (cardinal === 'east' || cardinal === 'west' ? '40px' : '2px')};
  cursor: default;
`;

type PointNodeProps = {
  data: {
    cardinal: Cardinal;
  };
};

export const PointNode = ({ data }: PointNodeProps) => {
  return (
    <>
      <Handle type="target" position={Position.Top} id="Ttop" style={{ ...MaplinkHandleStyle, top: 0 }} />
      <Handle type="target" position={Position.Right} id="Tright" style={{ ...MaplinkHandleStyle, right: 0 }} />
      <Handle type="target" position={Position.Bottom} id="Tbottom" style={{ ...MaplinkHandleStyle, bottom: 0 }} />
      <Handle type="target" position={Position.Left} id="Tleft" style={{ ...MaplinkHandleStyle, left: 0 }} />
      <Handle
        type="source"
        position={Position.Top}
        id="Stop"
        style={{ ...MaplinkHandleStyle, top: ['north', 'south'].includes(data.cardinal) ? 0 : 19 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="Sright"
        style={{ ...MaplinkHandleStyle, right: ['east', 'west'].includes(data.cardinal) ? 0 : 19 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="Sbottom"
        style={{ ...MaplinkHandleStyle, bottom: ['north', 'south'].includes(data.cardinal) ? 0 : 19 }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="Sleft"
        style={{ ...MaplinkHandleStyle, left: ['east', 'west'].includes(data.cardinal) ? 0 : 19 }}
      />
      <PointNodeStyle cardinal={data.cardinal} />
    </>
  );
};
