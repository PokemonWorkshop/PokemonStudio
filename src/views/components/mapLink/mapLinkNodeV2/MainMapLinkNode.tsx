import { ResourceImage } from '@components/ResourceImage';
import type { StudioMap } from '@modelEntities/map';
import type { StudioMapLink, StudioMapLinkCardinal } from '@modelEntities/mapLink';
import { getMapOverviewPath } from '@utils/resourcePath';
import { useStore } from '@xyflow/react';
import { PrimaryButton } from '@components/buttons';
import type { MapLinkDialogsRef } from '../editors/MapLinkEditorOverlay';
import { getMapSizeStyle } from '@utils/MapLinkUtils';
import PlusIcon from '@assets/icons/global/plus-icon.svg';
import styled from 'styled-components';
import React, { CSSProperties } from 'react';

type MainMapLinkNodeProps = {
  data: {
    mapLink: StudioMapLink;
    maps: Record<number, StudioMap>;
    tileSize: number;
    setCardinal: (cardinal: StudioMapLinkCardinal) => void;
    dialogsRef?: MapLinkDialogsRef;
  };
  selected: boolean;
};

type MapLinkNodeContainer = {
  selected: boolean;
  zoom: number;
};

const MapLinkAddMapNodeButtonContainer = styled(PrimaryButton)`
  position: absolute;
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

type MapLinkAddMapNodeButtonProps = {
  style: CSSProperties;
  onClick: () => void;
};

const MapLinkAddMapNodeButton = ({ style, onClick }: MapLinkAddMapNodeButtonProps) => {
  return (
    <MapLinkAddMapNodeButtonContainer style={style} onClick={onClick}>
      <PlusIcon />
    </MapLinkAddMapNodeButtonContainer>
  );
};

const MainMapLinkNodeContainer = styled.div<MapLinkNodeContainer>`
  display: inline-block;
  position: relative;
  // Maps can be completely transparent, so we set the background color so that they are visible.
  background-color: black;

  & img {
    display: block;
  }

  .react-flow__node.selected &::after {
    content: '';
    position: absolute;
    inset: 0;
    border: ${({ zoom }) => 2 / zoom}px solid ${({ theme }) => theme.colors.primaryBase};
    box-sizing: border-box;
    pointer-events: none;
  }

  ${MapLinkAddMapNodeButtonContainer} {
    display: ${({ selected }) => (selected ? 'flex' : 'none')};
  }
`;

const zoomSelector = (s: { transform: number[] }) => s.transform[2];

export const MainMapLinkNode = ({ data, selected }: MainMapLinkNodeProps) => {
  const currentZoom = useStore(zoomSelector);
  const map = data.maps[data.mapLink.mapId];

  const onClickAddMap = (cardinal: StudioMapLinkCardinal) => {
    const { dialogsRef, setCardinal } = data;
    if (!dialogsRef) return undefined;

    setCardinal(cardinal);
    dialogsRef.current?.openDialog('add_map');
  };

  return (
    <MainMapLinkNodeContainer selected={selected} zoom={currentZoom} style={getMapSizeStyle(map, data.tileSize)}>
      <MapLinkAddMapNodeButton style={{ top: '-192px', left: '50%', transform: 'translateX(-50%)' }} onClick={() => onClickAddMap('north')} />
      <MapLinkAddMapNodeButton style={{ right: '-192px', top: '50%', transform: 'translateY(-50%)' }} onClick={() => onClickAddMap('east')} />
      <MapLinkAddMapNodeButton style={{ bottom: '-192px', left: '50%', transform: 'translateX(-50%)' }} onClick={() => onClickAddMap('south')} />
      <MapLinkAddMapNodeButton style={{ left: '-192px', top: '50%', transform: 'translateY(-50%)' }} onClick={() => onClickAddMap('west')} />
      <ResourceImage imagePathInProject={getMapOverviewPath(map.tiledFilename)} versionId={map.mtime} />
    </MainMapLinkNodeContainer>
  );
};
