import { DeleteButtonWithIcon } from '@components/buttons';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { MapLinkControlBarV2, MapLinkNoMap } from '@components/mapLink';
import { MapLinkEditorAndDeletionKeys, MapLinkEditorOverlay } from '@components/mapLink/editors/MapLinkEditorOverlay';
import { ReactFlowMapLinkV2 } from '@components/mapLink/ReactFlowMapLinkV2';
import { State } from '@src/GlobalStateProvider';
import { useDialogsRef } from '@src/hooks/useDialogsRef';
import { useMapLinkPage } from '@src/hooks/usePage';
import { useProjectMapLinks } from '@src/hooks/useProjectData';
import { getValidMaps } from '@utils/MapLinkUtils';
import { ReactFlowProvider } from '@xyflow/react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const checkValidMaplink = (mapId: number, state: State) => {
  const validMaps = getValidMaps(state.projectData.zones);
  const mapsFiltered = Object.values(state.projectData.maps).filter(({ id }) => validMaps.includes(id));
  return mapsFiltered.find((map) => map.id === mapId) ? true : false;
};

const MapLinkV2Page = () => {
  const dialogsRef = useDialogsRef<MapLinkEditorAndDeletionKeys>();
  const { mapLink, maps, state } = useMapLinkPage();
  const isValidMaplink = useMemo(() => checkValidMaplink(mapLink.mapId, state), [mapLink, state]);
  const { t } = useTranslation();

  return (
    <DatabasePageStyle>
      <MapLinkControlBarV2 dialogsRef={dialogsRef} />
      {isValidMaplink ? (
        <ReactFlowMapLinkV2 mapLink={mapLink} maps={maps} />
      ) : (
        <MapLinkNoMap>
          <span>{t('no_map')}</span>
          <DeleteButtonWithIcon>{'delete_this_maplink'}</DeleteButtonWithIcon>
        </MapLinkNoMap>
      )}
      <MapLinkEditorOverlay ref={dialogsRef} />
    </DatabasePageStyle>
  );
};

export default MapLinkV2Page;
