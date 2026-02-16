import { useDashboardChart } from '@src/hooks/useDashboardChart';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import { ChartBlockContainer, ChartBlockTitle, ChartLayout, ChartWrapper } from './DashboardPokedexChartStyle';
import { PokedexChartLegend } from './PokedexChartLegend';
import { usePokedexChartPlugin } from './usePokedexChartPlugin';

ChartJS.register(ArcElement, Tooltip, Legend);

export const DashboardPokedexChart = () => {
  const { t } = useTranslation();
  const { typeStats, chartData, chartOptions } = useDashboardChart();
  const { chartRef, typeIconPlugin } = usePokedexChartPlugin(typeStats);

  return (
    <ChartBlockContainer size="full" data-noactive>
      <ChartBlockTitle>{t('pokedex_types_chart')}</ChartBlockTitle>
      <ChartLayout>
        <ChartWrapper>
          <Doughnut ref={chartRef} data={chartData} options={chartOptions} plugins={[typeIconPlugin]} />
        </ChartWrapper>
        <PokedexChartLegend typeStats={typeStats} />
      </ChartLayout>
    </ChartBlockContainer>
  );
};
