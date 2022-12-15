import React, { useCallback, useMemo, useState } from 'react';
import { ReactFlowProvider } from 'react-flow-renderer';

import { useProjectMapLinks } from '@utils/useProjectData';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { MapLinkControlBar, MapLinkNoMap, ReactFlowMapLink } from '@components/mapLink';
import { LinkEditor, NewLinkEditor } from '@components/mapLink/editors';

import MapLinkModel, {
  Cardinal,
  getLinksFromMapLink,
  isEmptyLinksFromMapLink,
  MapLinkLink,
  setLinksFromMapLink,
} from '@modelEntities/maplinks/MapLink.model';
import { EditorOverlay } from '@components/editor';
import { RMXPMap } from '@modelEntities/maplinks/RMXPMap';
import { cleanNaNValue } from '@utils/cleanNaNValue';
import { State } from '@src/GlobalStateProvider';
import { useTranslation } from 'react-i18next';
import { assertUnreachable } from '@utils/assertUnreachable';

const createMapData = (rmxpMaps: RMXPMap[]): Map<number, string> => {
  const mapData = new Map();
  rmxpMaps.forEach((rmxpMap) => {
    mapData.set(rmxpMap.id, rmxpMap.name);
  });
  return mapData;
};

const checkValidMaplink = (mapId: string, state: State) => {
  const validMaps = Object.values(state.projectData.zones)
    .filter((zone) => zone.isFlyAllowed && !zone.isWarpDisallowed)
    .flatMap((zone) => zone.maps);
  const rmxpMapsFiltered = Object.values(state.rmxpMaps).filter(({ id }) => validMaps.includes(id));
  return rmxpMapsFiltered.find((rmxpMap) => rmxpMap.id.toString() === mapId) ? true : false;
};

const getCardinalOpposed = (cardinal: Cardinal): Cardinal => {
  switch (cardinal) {
    case 'north':
      return 'south';
    case 'east':
      return 'west';
    case 'south':
      return 'north';
    case 'west':
      return 'east';
    default:
      assertUnreachable(cardinal);
  }
  return 'north';
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
  const isValidMaplink = useMemo(() => checkValidMaplink(mapId, state), [mapId, state]);
  const { t } = useTranslation('database_maplinks');

  const addReverseMapLink = (selectedMap: number, cardinal: Cardinal, offset: number) => {
    const mapLinkSelectedMap = (
      Object.values(mapLinks).find((mapL) => mapL.mapId === selectedMap) || bindMapLink(MapLinkModel.createMapLink(mapLinks, selectedMap))
    ).clone();
    const cardinalOpposed = getCardinalOpposed(cardinal);
    const reverseLinks = getLinksFromMapLink(mapLinkSelectedMap, cardinalOpposed).concat({
      mapId: Number(currentEditedMaplink.mapId),
      offset: -offset,
    });
    reverseLinks.sort((a, b) => a.offset - b.offset);
    setLinksFromMapLink(mapLinkSelectedMap, reverseLinks, cardinalOpposed);
    setDataMapLink({ [mapLinkSelectedMap.dbSymbol]: mapLinkSelectedMap });
  };

  const deleteReverseMapLink = (cardinal: Cardinal, linkDeleted: MapLinkLink) => {
    const cardinalOpposed = getCardinalOpposed(cardinal);
    const mapLinkReverse = Object.values(mapLinks)
      .find((mapL) => mapL.mapId === linkDeleted.mapId)
      ?.clone();
    if (!mapLinkReverse) return;

    const reverseLinks = getLinksFromMapLink(mapLinkReverse, cardinalOpposed);
    const index = reverseLinks.findIndex((link) => link.mapId === currentEditedMaplink.mapId);
    if (index === -1) return;

    reverseLinks.splice(index, 1);
    if (isEmptyLinksFromMapLink(mapLinkReverse)) {
      removeMapLink(mapLinkReverse.dbSymbol, { mapLink: mapLinkReverse.mapId.toString() });
    } else {
      setDataMapLink({ [mapLinkReverse.dbSymbol]: mapLinkReverse });
    }
  };

  const updateOffsetReverseMapLink = (cardinal: Cardinal, offset: number, editedLink: MapLinkLink) => {
    const cardinalOpposed = getCardinalOpposed(cardinal);
    const mapLinkReverse = Object.values(mapLinks)
      .find((mapL) => mapL.mapId === editedLink.mapId)
      ?.clone();
    if (!mapLinkReverse) return;

    const linksReverse = getLinksFromMapLink(mapLinkReverse, cardinalOpposed);
    const index = linksReverse.findIndex((link) => link.mapId === currentEditedMaplink.mapId);
    if (index === -1) return;

    linksReverse[index].offset = -offset;
    linksReverse.sort((a, b) => a.offset - b.offset);
    setDataMapLink({ [mapLinkReverse.dbSymbol]: mapLinkReverse });
  };

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
    const deletedLink = getLinksFromMapLink(currentEditedMaplink, cardinal).splice(index, 1)[0];
    deleteReverseMapLink(cardinal, deletedLink);
    if (isEmptyLinksFromMapLink(currentEditedMaplink)) {
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
    addReverseMapLink(Number(selectedMap), cardinal, offset);
    setCurrentEditor(undefined);
  };

  const onEditOffset = (index: number, cardinal: Cardinal, offset: number) => {
    const links = getLinksFromMapLink(currentEditedMaplink, cardinal);
    if (offset === links[index].offset) return;

    links[index].offset = offset;
    links.sort((a, b) => a.offset - b.offset);
    updateOffsetReverseMapLink(cardinal, offset, links[index]);
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
    updateOffsetReverseMapLink(cardinalSelected, linkEdited.offset, linkEdited);
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
      {isValidMaplink ? (
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
      ) : (
        <MapLinkNoMap>{t('no_map')}</MapLinkNoMap>
      )}
      <EditorOverlay currentEditor={currentEditor} editors={editors} onClose={onCloseEditor} />
    </DatabasePageStyle>
  );
};

export default MapLinkPage;
