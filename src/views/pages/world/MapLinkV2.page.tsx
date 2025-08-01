import { DeleteButtonWithIcon } from '@components/buttons';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { MapLinkControlBarV2, MapLinkNoMap } from '@components/mapLink';
import { MapLinkEditorAndDeletionKeys, MapLinkEditorOverlay } from '@components/mapLink/editors/MapLinkEditorOverlay';
import { ReactFlowMapLinkV2 } from '@components/mapLink/ReactFlowMapLinkV2';
import { ReactFlowProvider } from '@xyflow/react';
import { useDialogsRef } from '@src/hooks/useDialogsRef';
import { useMapLinkPage } from '@src/hooks/usePage';
import { useTranslation } from 'react-i18next';
import React from 'react';

const MapLinkV2Page = () => {
  const dialogsRef = useDialogsRef<MapLinkEditorAndDeletionKeys>();
  const { mapLink, maps, isValidMaplink } = useMapLinkPage();
  const { t } = useTranslation();

  return (
    <DatabasePageStyle>
      <MapLinkControlBarV2 dialogsRef={dialogsRef} isValidMaplink={isValidMaplink} />
      {isValidMaplink ? (
        <ReactFlowProvider>
          <ReactFlowMapLinkV2 mapLink={mapLink} maps={maps} dialogsRef={dialogsRef} />
        </ReactFlowProvider>
      ) : (
        <MapLinkNoMap>
          <span>{t('no_map')}</span>
          <DeleteButtonWithIcon onClick={() => dialogsRef.current?.openDialog('deletion', true)}>{t('delete_this_maplink')}</DeleteButtonWithIcon>
        </MapLinkNoMap>
      )}
      <MapLinkEditorOverlay ref={dialogsRef} />
    </DatabasePageStyle>
  );
};

export default MapLinkV2Page;
