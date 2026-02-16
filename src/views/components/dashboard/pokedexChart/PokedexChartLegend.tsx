import { TypeStat } from '@src/hooks/useDashboardChart';
import React from 'react';
import { LegendCount, LegendGrid, LegendIconBadge, LegendItem, LegendLabel } from './DashboardPokedexChartStyle';
import { TYPE_ICON_COMPONENTS } from './typeIconMap';

type TypeLegendEntryProps = {
  stat: TypeStat;
};

const TypeLegendEntry = ({ stat }: TypeLegendEntryProps) => {
  const Icon = TYPE_ICON_COMPONENTS[stat.dbSymbol];

  return (
    <LegendItem>
      <LegendIconBadge typeColor={stat.color}>{Icon ? <Icon /> : null}</LegendIconBadge>
      <LegendLabel>{stat.name}</LegendLabel>
      <LegendCount>{stat.count}</LegendCount>
    </LegendItem>
  );
};

type PokedexChartLegendProps = {
  typeStats: TypeStat[];
};

export const PokedexChartLegend = ({ typeStats }: PokedexChartLegendProps) => (
  <LegendGrid>
    {typeStats.map((stat) => (
      <TypeLegendEntry key={stat.dbSymbol} stat={stat} />
    ))}
  </LegendGrid>
);
