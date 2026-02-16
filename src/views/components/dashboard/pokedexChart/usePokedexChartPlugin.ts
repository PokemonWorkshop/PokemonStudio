import { TypeStat } from '@src/hooks/useDashboardChart';
import { Chart, Plugin } from 'chart.js';
import { useEffect, useMemo, useRef } from 'react';
import { chartIconImages } from './typeIconMap';

const ICON_MIN_PERCENTAGE = 5;
const CHART_ICON_SIZE = 16;

export const usePokedexChartPlugin = (typeStats: TypeStat[]) => {
  const chartRef = useRef<Chart<'doughnut'>>(null);

  useEffect(() => {
    const images = Object.values(chartIconImages);
    let loaded = 0;
    const onLoad = () => {
      loaded++;
      if (loaded === images.length) chartRef.current?.draw();
    };
    images.forEach((img) => {
      if (img.complete) {
        loaded++;
      } else {
        img.addEventListener('load', onLoad, { once: true });
      }
    });
    if (loaded === images.length) return;
    return () => images.forEach((img) => img.removeEventListener('load', onLoad));
  }, []);

  const typeIconPlugin = useMemo<Plugin<'doughnut'>>(
    () => ({
      id: 'typeIcons',
      afterDatasetDraw(chart) {
        const { ctx } = chart;
        const meta = chart.getDatasetMeta(0);
        const total = typeStats.reduce((sum, s) => sum + s.count, 0);
        if (total === 0) return;

        meta.data.forEach((element, i) => {
          const stat = typeStats[i];
          if (!stat || stat.percentage < ICON_MIN_PERCENTAGE) return;

          const img = chartIconImages[stat.dbSymbol];
          if (!img || !img.complete) return;

          const arc = element as unknown as {
            x: number;
            y: number;
            startAngle: number;
            endAngle: number;
            innerRadius: number;
            outerRadius: number;
          };
          const midAngle = (arc.startAngle + arc.endAngle) / 2;
          const midRadius = (arc.innerRadius + arc.outerRadius) / 2;
          const x = arc.x + Math.cos(midAngle) * midRadius;
          const y = arc.y + Math.sin(midAngle) * midRadius;

          ctx.save();
          ctx.drawImage(img, x - CHART_ICON_SIZE / 2, y - CHART_ICON_SIZE / 2, CHART_ICON_SIZE, CHART_ICON_SIZE);
          ctx.restore();
        });
      },
    }),
    [typeStats],
  );

  return { chartRef, typeIconPlugin };
};
