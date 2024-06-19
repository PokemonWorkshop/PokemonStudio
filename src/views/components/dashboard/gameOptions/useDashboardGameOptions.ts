import { useProjectConfigReadonly } from '@hooks/useProjectConfig';
import { DEFAULT_GAME_OPTIONS, DefaultGameOptions } from '@modelEntities/config';
import { useUpdateGameOptions } from './useUpdateGameOptions';
import { cloneEntity } from '@utils/cloneEntity';
import { useMemo } from 'react';

export const useDashboardGameOptions = () => {
  const { projectConfigValues: gameOptions } = useProjectConfigReadonly('game_options_config');
  const inactiveOptions = useMemo(() => DEFAULT_GAME_OPTIONS.filter((option) => !gameOptions.order.includes(option)), [gameOptions.order]);
  const updateGameOptions = useUpdateGameOptions(gameOptions);

  const disableOption = (option: string) => {
    if (option === 'language') return;

    const options = cloneEntity(gameOptions);
    const index = options.order.indexOf(option);
    if (index === -1) return;

    options.order.splice(index, 1);
    updateGameOptions(options);
  };

  const enableOption = (option: DefaultGameOptions) => {
    if (option === 'language') return;

    const options = cloneEntity(gameOptions);
    options.order.push(option);
    updateGameOptions(options);
  };

  const changeOrder = (srcIndex: number, destIndex: number) => {
    const options = cloneEntity(gameOptions);
    options.order.splice(destIndex, 0, options.order.splice(srcIndex, 1)[0]);
    updateGameOptions(options);
  };

  const disabledDisableOption = () => {
    const options = gameOptions.order.filter((option) => option !== 'language');
    return options.length <= 1;
  };

  return {
    gameOptions: gameOptions.order,
    inactiveOptions,
    disableOption,
    enableOption,
    changeOrder,
    disabledDisableOption,
  };
};
