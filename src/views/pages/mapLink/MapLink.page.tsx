import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, { addEdge, useNodesState, useEdgesState, Controls } from 'react-flow-renderer';

import { useProjectMapLinks } from '@utils/useProjectData';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { MapLinkControlBar, NewLinkNode, PointNode } from '@components/mapLink';
import { CurrentMapLinkCardNode, MapLinkCardNode } from '@components/mapLink/mapLinkCard';
import { LinkEditor, NewLinkEditor } from '@components/mapLink/editors';

import theme from '../../../AppTheme';
import MapLinkModel, { Cardinal, CardinalCategory, getLinksFromMapLink, setLinksFromMapLink } from '@modelEntities/maplinks/MapLink.model';
import { assertUnreachable } from '@utils/assertUnreachable';
import { EditorOverlay } from '@components/editor';
import { RMXPMap } from '@modelEntities/maplinks/RMXPMap';
import { cleanNaNValue } from '@utils/cleanNaNValue';

const createInitialNodes = (currentMapLink: MapLinkModel, mapData: Map<number, string>, onClickCreateNewLink: (cardinal: Cardinal) => void) => [
  {
    id: 'main-maplink-card',
    position: { x: 0, y: 0 },
    type: 'currentMapLinkCard',
    data: { mapLink: currentMapLink, mapData },
  },
  {
    id: 'create-link-north',
    position: { x: 108, y: -64 - (getLinksFromMapLink(currentMapLink, 'north').length <= 1 ? 0 : 8) },
    type: 'newLink',
    data: { onClick: () => onClickCreateNewLink('north') },
    hidden: getLinksFromMapLink(currentMapLink, 'north').length === 3,
  },
  {
    id: 'create-link-east',
    position: { x: 280 + (getLinksFromMapLink(currentMapLink, 'east').length <= 1 ? 0 : 8), y: 60 },
    type: 'newLink',
    data: { onClick: () => onClickCreateNewLink('east') },
    hidden: getLinksFromMapLink(currentMapLink, 'east').length === 3,
  },
  {
    id: 'create-link-south',
    position: { x: 108, y: 184 + (getLinksFromMapLink(currentMapLink, 'south').length <= 1 ? 0 : 8) },
    type: 'newLink',
    data: { onClick: () => onClickCreateNewLink('south') },
    hidden: getLinksFromMapLink(currentMapLink, 'south').length === 3,
  },
  {
    id: 'create-link-west',
    position: { x: -64 - (getLinksFromMapLink(currentMapLink, 'west').length <= 1 ? 0 : 8), y: 60 },
    type: 'newLink',
    data: { onClick: () => onClickCreateNewLink('west') },
    hidden: getLinksFromMapLink(currentMapLink, 'west').length === 3,
  },
];

const createInitialsEdges = (currentMapLink: MapLinkModel) => [
  {
    id: 'edges-north',
    source: 'main-maplink-card',
    target: 'create-link-north',
    targetHandle: 'Tbottom',
    type: 'smoothstep',
    animated: true,
    style: { stroke: theme.colors.primaryBase },
    hidden: getLinksFromMapLink(currentMapLink, 'north').length === 3,
  },
  {
    id: 'edges-east',
    source: 'main-maplink-card',
    target: 'create-link-east',
    targetHandle: 'Tleft',
    type: 'smoothstep',
    animated: true,
    style: { stroke: theme.colors.primaryBase },
    hidden: getLinksFromMapLink(currentMapLink, 'east').length === 3,
  },
  {
    id: 'edges-south',
    source: 'main-maplink-card',
    target: 'create-link-south',
    targetHandle: 'Ttop',
    type: 'smoothstep',
    animated: true,
    style: { stroke: theme.colors.primaryBase },
    hidden: getLinksFromMapLink(currentMapLink, 'south').length === 3,
  },
  {
    id: 'edges-west',
    source: 'main-maplink-card',
    target: 'create-link-west',
    targetHandle: 'Tright',
    type: 'smoothstep',
    animated: true,
    style: { stroke: theme.colors.primaryBase },
    hidden: getLinksFromMapLink(currentMapLink, 'west').length === 3,
  },
];

const northPositions = [
  [{ x: 0, y: -248 }],
  [
    { x: -136, y: -308 },
    { x: 136, y: -308 },
  ],
  [
    { x: -272, y: -372 },
    { x: 0, y: -372 },
    { x: 272, y: -372 },
  ],
];

const eastPositions = [
  [{ x: 344, y: 0 }],
  [
    { x: 404, y: -88 },
    { x: 404, y: 88 },
  ],
  [
    { x: 468, y: -176 },
    { x: 468, y: 0 },
    { x: 468, y: 176 },
  ],
];

const pointPositions = {
  north: [
    { x: 108, y: -104 },
    { x: 108, y: -136 },
  ],
  east: [
    { x: 360, y: 60 },
    { x: 392, y: 60 },
  ],
  south: [
    { x: 108, y: 264 },
    { x: 108, y: 296 },
  ],
  west: [
    { x: -104, y: 60 },
    { x: -136, y: 60 },
  ],
};

const getPosition = (index: number, cardinal: Cardinal, max: number) => {
  switch (cardinal) {
    case 'north':
      return northPositions[max - 1][index];
    case 'east':
      return eastPositions[max - 1][index];
    case 'south':
      return { ...northPositions[max - 1][index], y: -northPositions[max - 1][index].y };
    case 'west':
      return { ...eastPositions[max - 1][index], x: -eastPositions[max - 1][index].x };
    default:
      assertUnreachable(cardinal);
      return { x: 0, y: 0 };
  }
};

const getEdgeHandle = (cardinal: Cardinal) => {
  switch (cardinal) {
    case 'north':
      return { source: 'Stop', target: 'Tbottom' };
    case 'east':
      return { source: 'Sright', target: 'Tleft' };
    case 'south':
      return { source: 'Sbottom', target: 'Ttop' };
    case 'west':
      return { source: 'Sleft', target: 'Tright' };
    default:
      assertUnreachable(cardinal);
      return { source: 'Stop', target: 'Tbottom' };
  }
};

const pointTarget: Record<Cardinal, string> = {
  north: 'Tbottom',
  east: 'Tleft',
  south: 'Ttop',
  west: 'Tright',
};

const getPointHandle = (cardinal: Cardinal, length: number) => {
  switch (cardinal) {
    case 'north':
    case 'south':
      if (length === 2)
        return [
          { source: 'Sleft', target: pointTarget[cardinal] },
          { source: 'Sright', target: pointTarget[cardinal] },
        ];
      return [
        { source: 'Sleft', target: pointTarget[cardinal] },
        { source: cardinal === 'north' ? 'Stop' : 'Sbottom', target: pointTarget[cardinal] },
        { source: 'Sright', target: pointTarget[cardinal] },
      ];
    case 'east':
    case 'west':
      if (length === 2)
        return [
          { source: 'Stop', target: pointTarget[cardinal] },
          { source: 'Sbottom', target: pointTarget[cardinal] },
        ];
      return [
        { source: 'Stop', target: pointTarget[cardinal] },
        { source: cardinal === 'east' ? 'Sright' : 'Sleft', target: pointTarget[cardinal] },
        { source: 'Sbottom', target: pointTarget[cardinal] },
      ];
    default:
      assertUnreachable(cardinal);
      return [];
  }
};

const createEdge = (id: string, source: string, sourceHandle: string, target: string, targetHandle: string) => ({
  id,
  source,
  sourceHandle,
  target,
  targetHandle,
  type: 'smoothstep',
  animated: true,
  style: { stroke: theme.colors.primaryBase },
});

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

  const initialNodes = useMemo(() => createInitialNodes(mapLink, mapData, onClickCreateNewLink), [mapLink, mapData, onClickCreateNewLink]);
  const nodeTypes = useMemo(
    () => ({ newLink: NewLinkNode, currentMapLinkCard: CurrentMapLinkCardNode, mapLinkCard: MapLinkCardNode, point: PointNode }),
    []
  );
  const initialEdges = useMemo(() => createInitialsEdges(mapLink), [mapLink]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  useEffect(() => {
    // reset nodes and edges with initial data
    setNodes(initialNodes);
    setEdges(initialEdges);
    CardinalCategory.forEach((cardinal) => {
      const mapLinkLinks = getLinksFromMapLink(mapLink, cardinal);
      const edgeHandle = getEdgeHandle(cardinal);
      // create point nodes and the edges associated
      if (mapLinkLinks.length >= 2) {
        const newPointNode = {
          id: `point-${cardinal}`,
          position: pointPositions[cardinal][mapLinkLinks.length - 2],
          type: 'point',
          data: {
            cardinal,
          },
        };
        setNodes((nds) => nds.concat(newPointNode));
        if (mapLinkLinks.length === 2) {
          const newEdgeButtonToPoint = createEdge(
            `edges-link-point-${cardinal}`,
            `create-link-${cardinal}`,
            edgeHandle.source,
            `point-${cardinal}`,
            edgeHandle.target
          );
          setEdges((eds) => eds.concat(newEdgeButtonToPoint));
        } else if (mapLinkLinks.length === 3) {
          const newEdge = createEdge(`edges-main-point-${cardinal}`, `main-maplink-card`, edgeHandle.source, `point-${cardinal}`, edgeHandle.target);
          setEdges((eds) => eds.concat(newEdge));
        }
      }
      // create mapLinkLink nodes and the edges associated
      mapLinkLinks.forEach((mapLinkLink, index) => {
        const newLinkNode = {
          id: `${cardinal}-${index}`,
          position: getPosition(index, cardinal, mapLinkLinks.length),
          type: 'mapLinkCard',
          data: { mapLinkLink, index, cardinal, mapData, onDeleteLink, onEditOffset, onEditLink },
        };
        setNodes((nds) => nds.concat(newLinkNode));
        if (mapLinkLinks.length === 1) {
          const newEdge = createEdge(
            `edges-link-${cardinal}-${cardinal}-${index}`,
            `create-link-${cardinal}`,
            edgeHandle.source,
            `${cardinal}-${index}`,
            edgeHandle.target
          );
          setEdges((eds) => eds.concat(newEdge));
        } else if (mapLinkLinks.length >= 2) {
          const pointHandle = getPointHandle(cardinal, mapLinkLinks.length);
          const newEdge = createEdge(
            `edges-point-${cardinal}-${cardinal}-${index}`,
            `point-${cardinal}`,
            pointHandle[index].source,
            `${cardinal}-${index}`,
            pointHandle[index].target
          );
          setEdges((eds) => eds.concat(newEdge));
        }
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLink, setNodes, setEdges]);

  return (
    <DatabasePageStyle>
      <MapLinkControlBar onChange={onChange} mapId={mapLink.mapId.toString()} />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        attributionPosition="top-right"
        nodesDraggable={false}
        nodesConnectable={false}
        fitView
        style={{
          zIndex: 1,
        }}
        minZoom={0.7}
        maxZoom={1}
      >
        <Controls showInteractive={false} />
      </ReactFlow>
      <EditorOverlay currentEditor={currentEditor} editors={editors} onClose={onCloseEditor} />
    </DatabasePageStyle>
  );
};

export default MapLinkPage;
