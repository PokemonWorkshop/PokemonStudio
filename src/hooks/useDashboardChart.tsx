import { t } from 'i18next';
import { useDexPage } from './usePage';
import { useProjectTypes } from './useProjectData';

export const useDashboardChart = () => {
  const { dex, allPokemon } = useDexPage();
  const { projectDataValues: types } = useProjectTypes();

  const getPokemonTypeData = () => {
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

    return dataGraph;
  };

  const getPokemonTypeChartSettings = () => {
    const dataGraph = getPokemonTypeData();
    const dataGraphLabels = Object.keys(dataGraph);
    const dataGraphValues = Object.values(dataGraph);

    const chartData = {
      labels: dataGraphLabels,
      datasets: [
        {
          data: dataGraphValues,
          backgroundColor: ['rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)', 'rgba(255, 206, 86, 0.7)', 'rgba(75, 192, 192, 0.7)'],
          borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)'],
          borderWidth: 1,
        },
      ],
    };

    const chartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom' as const,
        },
        title: {
          display: true,
          text: t('project_statistics'),
        },
      },
    };

    return { chartData, chartOptions };
  };

  return {
    getPokemonTypeChartSettings,
  };
};
