import React from 'react';
import { Handle, Position } from 'react-flow-renderer';
import { CurrentMapLinkCard } from './CurrentMapLinkCard';
import { MaplinkHandleStyle } from '../MapLinkHandleStyle';
import { StudioMapLink } from '@modelEntities/mapLink';

type CurrentMapLinkCardNodeProps = {
  data: {
    mapLink: StudioMapLink;
    mapData: Map<number, string>;
  };
};

export const CurrentMapLinkCardNode = ({ data }: CurrentMapLinkCardNodeProps) => {
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
      <CurrentMapLinkCard mapLink={data.mapLink} mapData={data.mapData} />
    </>
  );
};
