import React from 'react';
import styled from 'styled-components';
import type { StudioMap } from '@modelEntities/map';
import type { StudioMapLink, StudioMapLinkCardinal } from '@modelEntities/mapLink';
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
    cardinal?: StudioMapLinkCardinal;
    setCardinal?: (cardinal: StudioMapLinkCardinal) => void;
    dialogsRef?: MapLinkDialogsRef;
  };
};

export const MapLinkAddMapNode = ({ data: { cardinal, dialogsRef, setCardinal } }: MapLinkAddMapNodeProps) => {
  const onClickNewLink = () => {
    if (!dialogsRef || !cardinal || !setCardinal) return undefined;

    setCardinal(cardinal);
    dialogsRef.current?.openDialog('add_map');
  };

  return <MapLinkAddMapNodeButton onClick={onClickNewLink} />;
};
