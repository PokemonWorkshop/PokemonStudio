import React from 'react';
import styled from 'styled-components';
import type { StudioMap } from '@modelEntities/map';
import type { StudioMapLink } from '@modelEntities/mapLink';
import { SecondaryButtonWithPlusIcon } from '@components/buttons';

const MapLinkAddMapNodeContainer = styled(SecondaryButtonWithPlusIcon)`
  border-radius: 8px;
  width: 96px;
  height: 96px;
  padding: 0;
  gap: 0;
  cursor: pointer;

  & svg {
    width: 36px;
    height: 36px;
  }
`;

type MapLinkAddMapNodeProps = {
  data: {
    mapLink: StudioMapLink;
    maps: Record<number, StudioMap>;
  };
};

export const MapLinkAddMapNode = ({ data }: MapLinkAddMapNodeProps) => {
  return <MapLinkAddMapNodeContainer />;
};
