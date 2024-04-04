import { useMapPage } from '@utils/usePage';
import React from 'react';
import { ReactFlowProvider } from 'react-flow-renderer';
import styled from 'styled-components';
import { DataBlockWrapper } from '@components/database/dataBlocks';
import { DatabaseTabsBar } from '@components/database/DatabaseTabsBar';
import { useTranslation } from 'react-i18next';
import { MapBreadcrumb } from '@components/world/map';
import { ReactFlowOverview } from '@components/world/overview';

const OverviewPageStyle = styled.div`
  display: grid;
  grid-template-rows: 86px auto;
  grid-gap: 16px;
  width: 100%;
  padding: 16px;

  ${DataBlockWrapper} {
    margin-right: 0px;
  }
`;

export const OverviewPage = () => {
  const { map, disabledOpenTiled } = useMapPage();
  const { t } = useTranslation('database_maps');

  return (
    <OverviewPageStyle>
      <DataBlockWrapper>
        <MapBreadcrumb />
        <DatabaseTabsBar
          currentTabIndex={1}
          tabs={[
            { label: t('data'), path: '/world/map' },
            { label: t('map'), path: '/world/overview', disabled: disabledOpenTiled },
          ]}
        />
      </DataBlockWrapper>
      {!disabledOpenTiled && (
        <ReactFlowProvider>
          <ReactFlowOverview map={map} />
        </ReactFlowProvider>
      )}
    </OverviewPageStyle>
  );
};
