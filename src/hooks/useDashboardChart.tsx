import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useGlobalState } from '@src/GlobalStateProvider';
import { getText } from '@utils/ReadingProjectText';
import { TYPE_NAME_TEXT_ID } from '@modelEntities/type';
import { useDexPage } from './usePage';
import { useProjectTypes } from './useProjectData';

export type TypeStat = {
  dbSymbol: string;
  name: string;
  color: string;
  count: number;
  percentage: number;
};

export const useDashboardChart = () => {
  const { dex, allPokemon } = useDexPage();
  const { projectDataValues: types } = useProjectTypes();
  const { i18n } = useTranslation();
  const [{ projectText, projectConfig, projectStudio }] = useGlobalState();

  const getTypeName = useCallback(
    (type: { textId: number }) => {
      return getText(
        { texts: projectText, languages: projectStudio.languagesTranslation, defaultLanguage: projectConfig.language_config.defaultLanguage },
        TYPE_NAME_TEXT_ID,
        type.textId,
        i18n.language
      );
    },
    [projectText, projectStudio.languagesTranslation, projectConfig.language_config.defaultLanguage, i18n.language]
  );

  const typeStats = useMemo(() => {
    const dataGraph: Record<string, number> = {};

    Object.keys(types).forEach((type) => {
      dataGraph[type] = 0;
    });

    dex.creatures.forEach((creature) => {
      const pokemon = allPokemon[creature.dbSymbol];
      if (pokemon) {
        const type1P = pokemon.forms[0].type1;
        const type2P = pokemon.forms[0].type2;

        dataGraph[type1P] += 1;

        if (type2P !== '__undef__') {
          dataGraph[type2P] += 1;
        }
      }
    });

    const total = Object.values(dataGraph).reduce((sum, count) => sum + count, 0);

    return Object.entries(dataGraph)
      .filter(([dbSymbol]) => dbSymbol !== '__undef__')
      .map(([dbSymbol, count]) => ({
        dbSymbol,
        name: types[dbSymbol] ? getTypeName(types[dbSymbol]) : dbSymbol,
        color: types[dbSymbol]?.color || '#888888',
        count,
        percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [dex, allPokemon, types, getTypeName]);

  const chartData = useMemo(
    () => ({
      labels: typeStats.map((s) => s.name),
      datasets: [
        {
          data: typeStats.map((s) => s.count),
          backgroundColor: typeStats.map((s) => s.color),
          borderColor: 'rgba(19, 18, 22, 1)',
          borderWidth: 2,
          hoverBorderColor: 'rgba(101, 98, 248, 1)',
          hoverBorderWidth: 2,
        },
      ],
    }),
    [typeStats]
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: true,
      cutout: '62%',
      plugins: {
        legend: { display: false },
        title: { display: false },
        tooltip: {
          backgroundColor: 'rgba(29, 28, 34, 0.95)',
          titleColor: 'rgba(244, 244, 245, 1)',
          bodyColor: 'rgba(145, 145, 161, 1)',
          borderColor: 'rgba(53, 51, 61, 1)',
          borderWidth: 1,
          cornerRadius: 6,
          padding: 10,
          bodyFont: { family: 'Avenir Next', size: 13 },
          titleFont: { family: 'Avenir Next', size: 13, weight: 'bold' as const },
          callbacks: {
            label: (context: { parsed: number; label: string }) => {
              const total = typeStats.reduce((sum, s) => sum + s.count, 0);
              const pct = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : '0';
              return ` ${context.parsed} (${pct}%)`;
            },
          },
        },
      },
    }),
    [typeStats]
  );

  return { typeStats, chartData, chartOptions };
};
