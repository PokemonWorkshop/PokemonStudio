import React, { useCallback, useMemo, useState } from 'react';
import { ReactFlowProvider } from 'react-flow-renderer';

import { useProjectMapLinks } from '@utils/useProjectData';
import { SelectChangeEvent } from '@components/SelectCustom/SelectCustomPropsInterface';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { MapLinkControlBar, MapLinkNoMap, ReactFlowMapLink } from '@components/mapLink';
import { LinkEditor, NewLinkEditor } from '@components/mapLink/editors';

import { EditorOverlay } from '@components/editor';
import { cleanNaNValue } from '@utils/cleanNaNValue';
import { State } from '@src/GlobalStateProvider';
import { useTranslation } from 'react-i18next';
import { assertUnreachable } from '@utils/assertUnreachable';
import {
  getLinksFromMapLink,
  setLinksFromMapLink,
  StudioMapLink,
  StudioMapLinkCardinal,
  StudioMapLinkLink,
  StudioRMXPMap,
} from '@modelEntities/mapLink';
import { findFirstAvailableId } from '@utils/ModelUtils';
import { createMapLink } from '@utils/entityCreation';
import { cloneEntity } from '@utils/cloneEntity';

const createMapData = (rmxpMaps: StudioRMXPMap[]): Map<number, string> => {
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

const getCardinalOpposed = (cardinal: StudioMapLinkCardinal): StudioMapLinkCardinal => {
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

const isEmptyLinksFromMapLink = (mapLink: StudioMapLink): boolean => {
  return (
    getLinksFromMapLink(mapLink, 'north').length === 0 &&
    getLinksFromMapLink(mapLink, 'east').length === 0 &&
    getLinksFromMapLink(mapLink, 'south').length === 0 &&
    getLinksFromMapLink(mapLink, 'west').length === 0
  );
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
  const lastId = useMemo(() => findFirstAvailableId(mapLinks, 0), [mapLinks]);
  const [mapLink, setMapLink] = useState<StudioMapLink>(
    () => Object.values(mapLinks).find((mapL) => mapL.mapId === Number(mapId)) || createMapLink(lastId, Number(mapId))
  );
  const [cardinalSelected, setCardinalSelected] = useState<StudioMapLinkCardinal>('north');
  const [indexSelected, setIndexSelected] = useState<number>(0);
  const [currentEditor, setCurrentEditor] = useState<string | undefined>(undefined);
  const mapData = useMemo(() => createMapData(state.rmxpMaps), [state.rmxpMaps]);
  const currentEditedMaplink = useMemo(() => cloneEntity(mapLink), [mapLink]);
  const isValidMaplink = useMemo(() => checkValidMaplink(mapId, state), [mapId, state]);
  const { t } = useTranslation('database_maplinks');

  const addReverseMapLink = (selectedMap: number, cardinal: StudioMapLinkCardinal, offset: number) => {
    const mapLinkSelectedMap = cloneEntity(Object.values(mapLinks).find((mapL) => mapL.mapId === selectedMap) || createMapLink(lastId, selectedMap));
    const cardinalOpposed = getCardinalOpposed(cardinal);
    const reverseLinks = getLinksFromMapLink(mapLinkSelectedMap, cardinalOpposed);
    const reverseLink = reverseLinks.find((link) => link.mapId === Number(currentEditedMaplink.mapId));
    // if the link already exists, we update only the offset to force the synchronisation
    if (reverseLink) {
      reverseLink.offset = -offset;
    } else {
      reverseLinks.push({
        mapId: Number(currentEditedMaplink.mapId),
        offset: -offset,
      });
    }
    reverseLinks.sort((a, b) => a.offset - b.offset);
    setLinksFromMapLink(mapLinkSelectedMap, reverseLinks, cardinalOpposed);
    setDataMapLink({ [mapLinkSelectedMap.dbSymbol]: mapLinkSelectedMap });
  };

  const deleteReverseMapLink = (cardinal: StudioMapLinkCardinal, linkDeleted: StudioMapLinkLink) => {
    const cardinalOpposed = getCardinalOpposed(cardinal);
    const mapLinkReverse = cloneEntity(Object.values(mapLinks).find((mapL) => mapL.mapId === linkDeleted.mapId));
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

  const updateOffsetReverseMapLink = (cardinal: StudioMapLinkCardinal, offset: number, editedLink: StudioMapLinkLink) => {
    const cardinalOpposed = getCardinalOpposed(cardinal);
    const mapLinkReverse = cloneEntity(Object.values(mapLinks).find((mapL) => mapL.mapId === editedLink.mapId));
    if (!mapLinkReverse) return;

    const linksReverse = getLinksFromMapLink(mapLinkReverse, cardinalOpposed);
    const index = linksReverse.findIndex((link) => link.mapId === currentEditedMaplink.mapId);
    if (index === -1) return;

    linksReverse[index].offset = -offset;
    linksReverse.sort((a, b) => a.offset - b.offset);
    setDataMapLink({ [mapLinkReverse.dbSymbol]: mapLinkReverse });
  };

  const onChange: SelectChangeEvent = (selected) => {
    const id = Number(selected.value);
    setSelectedDataIdentifier({ mapLink: selected.value });
    setMapLink(Object.values(mapLinks).find((mapL) => mapL.mapId === Number(id)) || createMapLink(lastId, Number(id)));
  };

  const onClickCreateNewLink = useCallback((cardinal: StudioMapLinkCardinal) => {
    setCardinalSelected(cardinal);
    setCurrentEditor('newLink');
  }, []);

  const onDeleteLink = (index: number, cardinal: StudioMapLinkCardinal) => {
    const deletedLink = getLinksFromMapLink(currentEditedMaplink, cardinal).splice(index, 1)[0];
    deleteReverseMapLink(cardinal, deletedLink);
    if (isEmptyLinksFromMapLink(currentEditedMaplink)) {
      removeMapLink(mapLink.dbSymbol, { mapLink: mapLink.mapId.toString() });
      setMapLink(bindMapLink(createMapLink(lastId, Number(mapLink.mapId))));
    } else {
      setDataMapLink({ [mapLink.dbSymbol]: currentEditedMaplink });
      setMapLink(currentEditedMaplink);
    }
  };

  const onAddLink = (cardinal: StudioMapLinkCardinal, selectedMap: string, offset: number) => {
    const links = getLinksFromMapLink(currentEditedMaplink, cardinal).concat({ mapId: Number(selectedMap), offset: offset });
    links.sort((a, b) => a.offset - b.offset);
    setLinksFromMapLink(currentEditedMaplink, links, cardinal);
    setDataMapLink({ [mapLink.dbSymbol]: currentEditedMaplink });
    setMapLink(currentEditedMaplink);
    addReverseMapLink(Number(selectedMap), cardinal, offset);
    setCurrentEditor(undefined);
  };

  const onEditOffset = (index: number, cardinal: StudioMapLinkCardinal, offset: number) => {
    const links = getLinksFromMapLink(currentEditedMaplink, cardinal);
    if (offset === links[index].offset) return;

    links[index].offset = offset;
    links.sort((a, b) => a.offset - b.offset);
    updateOffsetReverseMapLink(cardinal, offset, links[index]);
    setDataMapLink({ [mapLink.dbSymbol]: currentEditedMaplink });
    setMapLink(currentEditedMaplink);
  };

  const onEditLink = (index: number, cardinal: StudioMapLinkCardinal) => {
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
            mapLinks={mapLinks}
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
