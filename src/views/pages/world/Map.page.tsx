import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { PageContainerStyle, PageDataConstrainerStyle } from '@pages/database/PageContainerStyle';
import { DataBlockWithAction, DataBlockWrapper } from '@components/database/dataBlocks';

import { useDialogsRef } from '@utils/useDialogsRef';
import { useMapPage } from '@utils/usePage';
import { MapEditorOverlay } from '@components/world/map/editors';
import { MapEditorAndDeletionKeys } from '@components/world/map/editors/MapEditorOverlay';
import { MapBreadcrumb, MapFrame, MapMusics, MapRMXP2StudioUpdate, MapUpdate } from '@components/world/map';
import { DeleteButtonWithIcon, SecondaryButton } from '@components/buttons';
import { BaseIcon } from '@components/icons/BaseIcon';
import theme from '@src/AppTheme';
import { useOpenTiled } from '@utils/useOpenTiled';

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
  const openTiled = useOpenTiled();
  const { t } = useTranslation('database_maps');
  const { t: tSub } = useTranslation('submenu_database');

  return hasMap ? (
    <MapPageStyle>
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <MapBreadcrumb />
            {/** The component is commented on because it's currently useless */}
            {/*<DatabaseTabsBar
              currentTabIndex={0}
              tabs={[
                { label: t('data'), path: '/world/map' },
                { label: t('map'), path: '/world/map/view', disabled: true },
              ]}
            />*/}
            {hasMapModified && <MapUpdate />}
            {isRMXPMode && <MapRMXP2StudioUpdate />}
          </DataBlockWrapper>
          <DataBlockWrapper>
            <MapFrame map={map} dialogsRef={dialogsRef} disabled={isRMXPMode} />
            <MapMusics map={map} dialogsRef={dialogsRef} disabled={isRMXPMode} />
          </DataBlockWrapper>
          <DataBlockWrapper>
            <DataBlockWithAction size="full" title={tSub('edition')} disabled={isRMXPMode}>
              <SecondaryButton onClick={() => openTiled(map.tiledFilename, dialogsRef)} disabled={isRMXPMode}>
                <BaseIcon icon="mapPadded" size="s" color={isRMXPMode ? theme.colors.text700 : theme.colors.primaryBase} />
                <span>{t('open_with_tiled')}</span>
              </SecondaryButton>
            </DataBlockWithAction>
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
