import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { PageContainerStyle, PageDataConstrainerStyle } from '@pages/database/PageContainerStyle';
import { DataBlockWithAction, DataBlockWrapper } from '@components/database/dataBlocks';

import { useDialogsRef } from '@utils/useDialogsRef';
import { useMapPage } from '@utils/usePage';
import { MapEditorOverlay } from '@components/world/map/editors';
import { MapEditorAndDeletionKeys } from '@components/world/map/editors/MapEditorOverlay';
import { MapBreadcrumb, MapEmptyState, MapFrame, MapMusics, MapRMXP2StudioUpdate, MapUpdate } from '@components/world/map';
import { DeleteButtonWithIcon, SecondaryButton } from '@components/buttons';
import { BaseIcon } from '@components/icons/BaseIcon';
import theme from '@src/AppTheme';
import { useOpenTiled } from '@utils/useOpenTiled';
import { MapImportEditorTitle, MapImportOverlay } from '@components/world/map/editors/MapImport/MapImportOverlay';
import { DatabaseTabsBar } from '@components/database/DatabaseTabsBar';

export const MapPageStyle = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;

  ${PageContainerStyle} {
    padding-top: 16px;
  }
`;

export const MapPage = () => {
  const dialogsRef = useDialogsRef<MapEditorAndDeletionKeys>();
  const dialogsMapImportRef = useDialogsRef<MapImportEditorTitle>();
  const { map, hasMap, hasMapModified, isRMXPMode, disabledOpenTiled } = useMapPage();
  const openTiled = useOpenTiled();
  const { t } = useTranslation('database_maps');
  const { t: tSub } = useTranslation('submenu_database');

  return (
    <MapPageStyle>
      {hasMap ? (
        <PageContainerStyle>
          <PageDataConstrainerStyle>
            <DataBlockWrapper>
              <MapBreadcrumb />
              <DatabaseTabsBar
                currentTabIndex={0}
                tabs={[
                  { label: t('data'), path: '/world/map' },
                  { label: t('map'), path: '/world/overview', disabled: disabledOpenTiled },
                ]}
              />
              {hasMapModified && <MapUpdate />}
              {isRMXPMode && <MapRMXP2StudioUpdate />}
            </DataBlockWrapper>
            <DataBlockWrapper>
              <MapFrame map={map} dialogsRef={dialogsRef} disabled={isRMXPMode} />
              <MapMusics map={map} dialogsRef={dialogsRef} disabled={isRMXPMode} />
            </DataBlockWrapper>
            <DataBlockWrapper>
              <DataBlockWithAction size="full" title={tSub('edition')} disabled={disabledOpenTiled}>
                <SecondaryButton onClick={() => openTiled(map.tiledFilename, dialogsRef)} disabled={disabledOpenTiled}>
                  <BaseIcon icon="mapPadded" size="s" color={disabledOpenTiled ? theme.colors.text700 : theme.colors.primaryBase} />
                  <span>{t('open_with_tiled')}</span>
                </SecondaryButton>
              </DataBlockWithAction>
            </DataBlockWrapper>
            <DataBlockWrapper>
              <DataBlockWithAction size="full" title={t('deleting')} disabled={isRMXPMode}>
                <DeleteButtonWithIcon onClick={() => dialogsRef.current?.openDialog('deletion', true)} disabled={isRMXPMode}>
                  {t('delete')}
                </DeleteButtonWithIcon>
              </DataBlockWithAction>
            </DataBlockWrapper>
          </PageDataConstrainerStyle>
        </PageContainerStyle>
      ) : (
        !isRMXPMode && <MapEmptyState dialogsRef={dialogsRef} dialogsMapImportRef={dialogsMapImportRef} />
      )}
      <MapEditorOverlay ref={dialogsRef} />
      <MapImportOverlay ref={dialogsMapImportRef} closeParentDialog={() => {}} />
    </MapPageStyle>
  );
};
