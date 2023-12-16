import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { PageContainerStyle, PageDataConstrainerStyle } from '@pages/database/PageContainerStyle';
import { DataBlockWithAction, DataBlockWrapper } from '@components/database/dataBlocks';
import { DatabaseTabsBar } from '@components/database/DatabaseTabsBar';

import { useDialogsRef } from '@utils/useDialogsRef';
import { useMapPage } from '@utils/usePage';
import { MapEditorOverlay } from '@components/world/map/editors';
import { MapEditorAndDeletionKeys } from '@components/world/map/editors/MapEditorOverlay';
import { MapBreadcrumb, MapFrame, MapMusics, MapRMXP2StudioUpdate, MapUpdate } from '@components/world/map';
import { DeleteButtonWithIcon } from '@components/buttons';

const MapPageStyle = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;

  ${PageContainerStyle} {
    padding-top: 16px;
  }
`;

export const MapPage = () => {
  const dialogsRef = useDialogsRef<MapEditorAndDeletionKeys>();
  const { map, hasMap, hasMapModified, isRMXPMode } = useMapPage();
  const { t } = useTranslation('database_maps');

  return hasMap ? (
    <MapPageStyle>
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <MapBreadcrumb />
            <DatabaseTabsBar
              currentTabIndex={0}
              tabs={[
                { label: t('data'), path: '/world/map' },
                { label: t('map'), path: '/world/map/view', disabled: true },
              ]}
            />
            {hasMapModified && <MapUpdate />}
            {isRMXPMode && <MapRMXP2StudioUpdate />}
          </DataBlockWrapper>
          <DataBlockWrapper>
            <MapFrame map={map} dialogsRef={dialogsRef} />
            <MapMusics map={map} dialogsRef={dialogsRef} />
          </DataBlockWrapper>
          <DataBlockWrapper>
            <DataBlockWithAction size="full" title={t('deleting')}>
              <DeleteButtonWithIcon onClick={() => dialogsRef.current?.openDialog('deletion', true)}>{t('delete')}</DeleteButtonWithIcon>
            </DataBlockWithAction>
          </DataBlockWrapper>
          <MapEditorOverlay ref={dialogsRef} />
        </PageDataConstrainerStyle>
      </PageContainerStyle>
    </MapPageStyle>
  ) : (
    <></>
  );
};
