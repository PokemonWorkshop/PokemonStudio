import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { PageContainerStyle, PageDataConstrainerStyle } from '@pages/database/PageContainerStyle';
import { DataBlockWithAction, DataBlockWrapper } from '@components/database/dataBlocks';

import { useDialogsRef } from '@hooks/useDialogsRef';
import { useMapPage } from '@hooks/usePage';
import { MapEditorOverlay } from '@components/world/map/editors';
import { MapEditorAndDeletionKeys } from '@components/world/map/editors/MapEditorOverlay';
import { MapBreadcrumb, MapEmptyState, MapFrame, MapMusics } from '@components/world/map';
import { DeleteButtonWithIcon, SecondaryButton } from '@components/buttons';
import { BaseIcon } from '@components/icons/BaseIcon';
import theme from '@src/AppTheme';
import { useOpenTiled } from '@hooks/useOpenTiled';
import { MapImportEditorTitle, MapImportOverlay } from '@components/world/map/editors/MapImport/MapImportOverlay';
import { DatabaseTabsBar } from '@components/database/DatabaseTabsBar';
import { useNavigateMapLink } from '@hooks/useNavigateMapLink';

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
  const { map, hasMap, disabledOpenTiled } = useMapPage();
  const openTiled = useOpenTiled();
  const navigateMapLink = useNavigateMapLink();
  const { t } = useTranslation();

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
            </DataBlockWrapper>
            <DataBlockWrapper>
              <MapFrame map={map} dialogsRef={dialogsRef} disabled={false} />
              <MapMusics map={map} dialogsRef={dialogsRef} disabled={false} />
            </DataBlockWrapper>
            <DataBlockWrapper>
              <DataBlockWithAction size="full" title={t('edition')} disabled={disabledOpenTiled}>
                <SecondaryButton onClick={() => openTiled(map.tiledFilename, dialogsRef)} disabled={disabledOpenTiled}>
                  <BaseIcon icon="mapPadded" size="s" color={disabledOpenTiled ? theme.colors.text700 : theme.colors.primaryBase} />
                  <span>{t('open_with_tiled')}</span>
                </SecondaryButton>
              </DataBlockWithAction>
              <DataBlockWithAction size="full" title={t('map_links_to_map')}>
                <SecondaryButton onClick={() => navigateMapLink(map)}>
                  <BaseIcon icon="mapLink" size="s" color={theme.colors.primaryBase} />
                  <span>{t('edit_map_links')}</span>
                </SecondaryButton>
              </DataBlockWithAction>
            </DataBlockWrapper>
            <DataBlockWrapper>
              <DataBlockWithAction size="full" title={t('deletion')}>
                <DeleteButtonWithIcon onClick={() => dialogsRef.current?.openDialog('deletion', true)}>{t('delete_this_map')}</DeleteButtonWithIcon>
              </DataBlockWithAction>
            </DataBlockWrapper>
          </PageDataConstrainerStyle>
        </PageContainerStyle>
      ) : (
        <MapEmptyState dialogsRef={dialogsRef} dialogsMapImportRef={dialogsMapImportRef} />
      )}
      <MapEditorOverlay ref={dialogsRef} />
      <MapImportOverlay ref={dialogsMapImportRef} closeParentDialog={() => {}} />
    </MapPageStyle>
  );
};
