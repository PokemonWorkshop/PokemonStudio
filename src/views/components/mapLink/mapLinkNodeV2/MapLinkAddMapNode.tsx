import React from 'react';
import styled from 'styled-components';
import type { StudioMap } from '@modelEntities/map';
import type { StudioMapLink } from '@modelEntities/mapLink';
import { SecondaryButtonWithPlusIcon } from '@components/buttons';
import type { MapLinkDialogsRef } from '../editors/MapLinkEditorOverlay';

const MapLinkAddMapNodeButton = styled(SecondaryButtonWithPlusIcon)`
  border-radius: 8px;
  width: 96px;
  height: 96px;
  padding: 0;
  gap: 0;

  & svg {
    width: 36px;
    height: 36px;
  }
`;

type MapLinkAddMapNodeProps = {
  data: {
    mapLink: StudioMapLink;
    maps: Record<number, StudioMap>;
    dialogsRef?: MapLinkDialogsRef;
  };
};

export const MapLinkAddMapNode = ({ data: { dialogsRef } }: MapLinkAddMapNodeProps) => {
  const onClickNewLink = dialogsRef ? () => dialogsRef.current?.openDialog('add_map') : undefined;
  return <MapLinkAddMapNodeButton onClick={onClickNewLink} />;
};
