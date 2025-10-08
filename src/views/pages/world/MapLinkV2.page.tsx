import { DeleteButtonWithIcon } from '@components/buttons';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { MapLinkControlBarV2, MapLinkNoMap } from '@components/mapLink';
import { MapLinkEditorAndDeletionKeys, MapLinkEditorOverlay } from '@components/mapLink/editors/MapLinkEditorOverlay';
import { ReactFlowMapLinkV2 } from '@components/mapLink/ReactFlowMapLinkV2';
import { ReactFlowProvider } from '@xyflow/react';
import { useDialogsRef } from '@src/hooks/useDialogsRef';
import { useMapLinkPage } from '@src/hooks/usePage';
import { useTranslation } from 'react-i18next';
import { StudioMapLinkCardinal } from '@src/models/entities/mapLink';
import React, { useState } from 'react';

const MapLinkV2Page = () => {
  const dialogsRef = useDialogsRef<MapLinkEditorAndDeletionKeys>();
  const { mapLink, maps, isValidMaplink, hasNoMapLinkAvailable } = useMapLinkPage();
  const { t } = useTranslation();
  const [cardinal, setCardinal] = useState<StudioMapLinkCardinal>('east');

  return (
    <DatabasePageStyle>
      {hasNoMapLinkAvailable ? (
        <>
          <div />
          <MapLinkNoMap>
            <span>{t('no_map')}</span>
          </MapLinkNoMap>
        </>
      ) : (
        <>
          <MapLinkControlBarV2 dialogsRef={dialogsRef} />
          {isValidMaplink ? (
            <ReactFlowProvider>
              <ReactFlowMapLinkV2 mapLink={mapLink} maps={maps} dialogsRef={dialogsRef} setCardinal={setCardinal} />
            </ReactFlowProvider>
          ) : (
            <MapLinkNoMap>
              {mapLink && (
                <DeleteButtonWithIcon onClick={() => dialogsRef.current?.openDialog('deletion', true)}>
                  {t('delete_this_maplink')}
                </DeleteButtonWithIcon>
              )}
            </MapLinkNoMap>
          )}
        </>
      )}
      <MapLinkEditorOverlay ref={dialogsRef} cardinal={cardinal} />
    </DatabasePageStyle>
  );
};

export default MapLinkV2Page;
