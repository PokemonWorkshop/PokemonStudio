import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { MapLinkCard } from './MapLinkCard';
import { MaplinkHandleStyle } from '../MapLinkHandleStyle';
import { StudioMapLinkCardinal, StudioMapLinkLink } from '@modelEntities/mapLink';

type MapLinkCardNodeData = {
  mapLinkLink: StudioMapLinkLink;
  index: number;
  cardinal: StudioMapLinkCardinal;
  mapData: Map<number, string>;
  onDeleteLink: (index: number, cardinal: StudioMapLinkCardinal) => void;
  onEditOffset: (index: number, cardinal: StudioMapLinkCardinal, offset: number) => void;
  onEditLink: (index: number, cardinal: StudioMapLinkCardinal) => void;
};

type MapLinkCardNodeProps = {
  data: MapLinkCardNodeData;
};

export const MapLinkCardNode = ({ data }: MapLinkCardNodeProps) => {
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
      <MapLinkCard
        mapLinkLink={data.mapLinkLink}
        index={data.index}
        cardinal={data.cardinal}
        mapData={data.mapData}
        onDeleteLink={data.onDeleteLink}
        onEditOffset={data.onEditOffset}
        onEditLink={data.onEditLink}
      />
    </>
  );
};
