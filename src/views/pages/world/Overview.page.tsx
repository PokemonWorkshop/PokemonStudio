import { useOverviewPage } from '@utils/usePage';
import { ReactFlowProvider } from 'react-flow-renderer';
import { DataBlockWrapper } from '@components/database/dataBlocks';
import { DatabaseTabsBar } from '@components/database/DatabaseTabsBar';
import { useTranslation } from 'react-i18next';
import { MapBreadcrumb } from '@components/world/map';
import { ReactFlowOverview } from '@components/world/overview';
import { SecondaryButton } from '@components/buttons';
import { TooltipWrapper } from '@ds/Tooltip';
import React, { useEffect } from 'react';
import styled from 'styled-components';

const OverviewPageStyle = styled.div`
  display: grid;
  grid-template-rows: 86px auto;
  grid-gap: 16px;
  width: 100%;
  padding: 16px;

  ${DataBlockWrapper} {
    margin-right: 0px;
  }

  .overview-unavailable {
    display: flex;
    flex-direction: column;
    gap: 16px;
    user-select: none;
    justify-content: center;
    align-items: center;

    ${({ theme }) => theme.fonts.normalRegular}
    color: ${({ theme }) => theme.colors.text400};
  }
`;

export const OverviewPage = () => {
  const { map, disabledOverview, disabledGenerating, state, checkMapOverview, onClickGenerating } = useOverviewPage();
  const { t } = useTranslation('database_maps');

  useEffect(() => {
    checkMapOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  return (
    <OverviewPageStyle>
      <DataBlockWrapper>
        <MapBreadcrumb />
        <DatabaseTabsBar
          currentTabIndex={1}
          tabs={[
            { label: t('data'), path: '/world/map' },
            { label: t('map'), path: '/world/overview', disabled: disabledOverview },
          ]}
        />
      </DataBlockWrapper>
      {state === 'available' && (
        <ReactFlowProvider>
          <ReactFlowOverview map={map} />
        </ReactFlowProvider>
      )}
      {state === 'unavailable' && (
        <div className="overview-unavailable">
          <span>{t('map_overview_not_found')}</span>
          <TooltipWrapper data-tooltip={disabledGenerating ? t('map_process_disabled') : undefined}>
            <SecondaryButton onClick={onClickGenerating} disabled={disabledGenerating}>
              {t('map_overview_generate')}
            </SecondaryButton>
          </TooltipWrapper>
        </div>
      )}
    </OverviewPageStyle>
  );
};
