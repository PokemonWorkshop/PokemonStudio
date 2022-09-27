import React, { useCallback, useMemo, useState } from 'react';
import { ReactFlowProvider } from 'react-flow-renderer';

import { useProjectMapLinks } from '@utils/useProjectData';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { MapLinkControlBar, ReactFlowMapLink } from '@components/mapLink';
import { LinkEditor, NewLinkEditor } from '@components/mapLink/editors';

import MapLinkModel, { Cardinal, getLinksFromMapLink, setLinksFromMapLink } from '@modelEntities/maplinks/MapLink.model';
import { EditorOverlay } from '@components/editor';
import { RMXPMap } from '@modelEntities/maplinks/RMXPMap';
import { cleanNaNValue } from '@utils/cleanNaNValue';

const createMapData = (rmxpMaps: RMXPMap[]): Map<number, string> => {
  const mapData = new Map();
  rmxpMaps.forEach((rmxpMap) => {
    mapData.set(rmxpMap.id, rmxpMap.name);
  });
  return mapData;
};

const MapLinkPage = () => {
  const {
    projectDataValues: mapLinks,
    selectedDataIdentifier: mapId,
    setSelectedDataIdentifier,
    setProjectDataValues: setDataMapLink,
    bindProjectDataValue: bindMapLink,
    removeProjectDataValue: removeMapLink,
    state,
  } = useProjectMapLinks();
  const [mapLink, setMapLink] = useState<MapLinkModel>(
    () => Object.values(mapLinks).find((mapL) => mapL.mapId === Number(mapId)) || bindMapLink(MapLinkModel.createMapLink(mapLinks, Number(mapId)))
  );
  const [cardinalSelected, setCardinalSelected] = useState<Cardinal>('north');
  const [indexSelected, setIndexSelected] = useState<number>(0);
  const [currentEditor, setCurrentEditor] = useState<string | undefined>(undefined);
  const mapData = useMemo(() => createMapData(state.rmxpMaps), [state.rmxpMaps]);
  const currentEditedMaplink = useMemo(() => mapLink.clone(), [mapLink]);

  const onChange = (selected: SelectOption) => {
    const id = Number(selected.value);
    setSelectedDataIdentifier({ mapLink: selected.value });
    setMapLink(Object.values(mapLinks).find((mapL) => mapL.mapId === Number(id)) || bindMapLink(MapLinkModel.createMapLink(mapLinks, Number(id))));
  };

  const onClickCreateNewLink = useCallback((cardinal: Cardinal) => {
    setCardinalSelected(cardinal);
    setCurrentEditor('newLink');
  }, []);

  const onDeleteLink = (index: number, cardinal: Cardinal) => {
    getLinksFromMapLink(currentEditedMaplink, cardinal).splice(index, 1);
    if (
      getLinksFromMapLink(currentEditedMaplink, 'north').length === 0 &&
      getLinksFromMapLink(currentEditedMaplink, 'east').length === 0 &&
      getLinksFromMapLink(currentEditedMaplink, 'south').length === 0 &&
      getLinksFromMapLink(currentEditedMaplink, 'west').length === 0
    ) {
      removeMapLink(mapLink.dbSymbol, { mapLink: mapLink.mapId.toString() });
      setMapLink(bindMapLink(MapLinkModel.createMapLink(mapLinks, Number(mapLink.mapId))));
    } else {
      setDataMapLink({ [mapLink.dbSymbol]: currentEditedMaplink });
      setMapLink(currentEditedMaplink);
    }
  };

  const onAddLink = (cardinal: Cardinal, selectedMap: string, offset: number) => {
    const links = getLinksFromMapLink(currentEditedMaplink, cardinal).concat({ mapId: Number(selectedMap), offset: offset });
    links.sort((a, b) => a.offset - b.offset);
    setLinksFromMapLink(currentEditedMaplink, links, cardinal);
    setDataMapLink({ [mapLink.dbSymbol]: currentEditedMaplink });
    setMapLink(currentEditedMaplink);
    setCurrentEditor(undefined);
  };

  const onEditOffset = (index: number, cardinal: Cardinal, offset: number) => {
    const links = getLinksFromMapLink(currentEditedMaplink, cardinal);
    if (offset === links[index].offset) return;

    links[index].offset = offset;
    links.sort((a, b) => a.offset - b.offset);
    setDataMapLink({ [mapLink.dbSymbol]: currentEditedMaplink });
    setMapLink(currentEditedMaplink);
  };

  const onEditLink = (index: number, cardinal: Cardinal) => {
    setIndexSelected(index);
    setCardinalSelected(cardinal);
    setCurrentEditor('editLink');
  };

  const onCloseEditor = () => {
    if (currentEditor === 'newLink') return setCurrentEditor(undefined);

    const link = getLinksFromMapLink(mapLink, cardinalSelected)[indexSelected];
    const linksEdited = getLinksFromMapLink(currentEditedMaplink, cardinalSelected);
    const linkEdited = linksEdited[indexSelected];
    if (link.mapId === linkEdited.mapId && link.offset === linkEdited.offset) return setCurrentEditor(undefined);

    linkEdited.offset = cleanNaNValue(linkEdited.offset);
    linksEdited.sort((a, b) => a.offset - b.offset);
    setDataMapLink({ [mapLink.dbSymbol]: currentEditedMaplink });
    setMapLink(currentEditedMaplink);
    setCurrentEditor(undefined);
  };

  const editors = {
    newLink: <NewLinkEditor mapLink={mapLink} cardinal={cardinalSelected} onClose={() => setCurrentEditor(undefined)} onAddLink={onAddLink} />,
    editLink: <LinkEditor mapLink={currentEditedMaplink} cardinal={cardinalSelected} index={indexSelected} />,
  };

  return (
    <DatabasePageStyle>
      <MapLinkControlBar onChange={onChange} mapId={mapLink.mapId.toString()} />
      <ReactFlowProvider>
        <ReactFlowMapLink
          mapLink={mapLink}
          mapData={mapData}
          onClickCreateNewLink={onClickCreateNewLink}
          onDeleteLink={onDeleteLink}
          onEditLink={onEditLink}
          onEditOffset={onEditOffset}
        />
      </ReactFlowProvider>
      <EditorOverlay currentEditor={currentEditor} editors={editors} onClose={onCloseEditor} />
    </DatabasePageStyle>
  );
};

export default MapLinkPage;
