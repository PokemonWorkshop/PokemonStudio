import { DataBlockContainer } from '@components/database/dataBlocks';
import { useDashboardChart, TypeStat } from '@src/hooks/useDashboardChart';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

ChartJS.register(ArcElement, Tooltip, Legend);

const ChartBlockContainer = styled(DataBlockContainer)`
  gap: 20px;
`;

const ChartBlockTitle = styled.h2`
  margin: 0;
  user-select: none;
`;

const ChartLayout = styled.div`
  display: flex;
  align-items: center;
  gap: 32px;

  @media screen and (max-width: 720px) {
    flex-direction: column;
  }
`;

const ChartWrapper = styled.div`
  flex-shrink: 0;
  width: 200px;
  height: 200px;
`;

const LegendGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px 24px;
  flex: 1;
  min-width: 0;

  @media screen and (max-width: 720px) {
    width: 100%;
  }
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

const LegendColorDot = styled.span<{ color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  background-color: ${({ color }) => color};
`;

const LegendLabel = styled.span`
  ${({ theme }) => theme.fonts.normalRegular}
  color: ${({ theme }) => theme.colors.text100};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LegendCount = styled.span`
  ${({ theme }) => theme.fonts.normalSmall}
  color: ${({ theme }) => theme.colors.text400};
  margin-left: auto;
  flex-shrink: 0;
`;

const TypeLegendEntry = ({ stat }: { stat: TypeStat }) => (
  <LegendItem>
    <LegendColorDot color={stat.color} />
    <LegendLabel>{stat.name}</LegendLabel>
    <LegendCount>{stat.count}</LegendCount>
  </LegendItem>
);

export const DashboardPokedexChart = () => {
  const { t } = useTranslation();
  const { typeStats, chartData, chartOptions } = useDashboardChart();

  return (
    <ChartBlockContainer size="full" data-noactive>
      <ChartBlockTitle>{t('pokedex_types_chart')}</ChartBlockTitle>
      <ChartLayout>
        <ChartWrapper>
          <Doughnut data={chartData} options={chartOptions} />
        </ChartWrapper>
        <LegendGrid>
          {typeStats.map((stat) => (
            <TypeLegendEntry key={stat.dbSymbol} stat={stat} />
          ))}
        </LegendGrid>
      </ChartLayout>
    </ChartBlockContainer>
  );
};
