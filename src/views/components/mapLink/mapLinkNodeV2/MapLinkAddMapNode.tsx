import React from 'react';
import styled from 'styled-components';
import type { StudioMap } from '@modelEntities/map';
import type { StudioMapLink } from '@modelEntities/mapLink';

const MapLinkAddMapNodeContainer = styled.div`
  width: 64px;
  height: 64px;
  background-color: white;
`;

type MapLinkAddMapNodeProps = {
  data: {
    mapLink: StudioMapLink;
    maps: Record<number, StudioMap>;
  };
};

export const MapLinkAddMapNode = ({ data }: MapLinkAddMapNodeProps) => {
  //const map = data.maps[data.mapLink.mapId];
  return <MapLinkAddMapNodeContainer></MapLinkAddMapNodeContainer>;
};
