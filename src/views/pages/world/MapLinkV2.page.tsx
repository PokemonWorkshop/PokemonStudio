import { checkValidMaplink } from '@utils/MapLinkUtils';
import { DeleteButtonWithIcon } from '@components/buttons';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { MapLinkControlBarV2, MapLinkNoMap } from '@components/mapLink';
import { MapLinkEditorAndDeletionKeys, MapLinkEditorOverlay } from '@components/mapLink/editors/MapLinkEditorOverlay';
import { ReactFlowMapLinkV2 } from '@components/mapLink/ReactFlowMapLinkV2';
import { ReactFlowProvider } from '@xyflow/react';
import { useDialogsRef } from '@src/hooks/useDialogsRef';
import { useMapLinkPage } from '@src/hooks/usePage';
import { useTranslation } from 'react-i18next';
import React, { useMemo } from 'react';

const MapLinkV2Page = () => {
  const dialogsRef = useDialogsRef<MapLinkEditorAndDeletionKeys>();
  const { mapLink, maps, state } = useMapLinkPage();
  const isValidMaplink = useMemo(() => checkValidMaplink(mapLink.mapId, state), [mapLink, state]);
  const { t } = useTranslation();

  return (
    <DatabasePageStyle>
      <MapLinkControlBarV2 dialogsRef={dialogsRef} />
      {isValidMaplink ? (
        <ReactFlowProvider>
          <ReactFlowMapLinkV2 mapLink={mapLink} maps={maps} />
        </ReactFlowProvider>
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
