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

    const dataGraphColors = Object.values(types).map((type) => type.color);

    const chartData = {
      labels: dataGraphLabels,
      datasets: [
        {
          data: dataGraphValues,
          backgroundColor: dataGraphColors,
          borderColor: dataGraphColors,
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
