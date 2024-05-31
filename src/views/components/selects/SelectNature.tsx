import React, { useMemo } from 'react';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { State, useGlobalState } from '@src/GlobalStateProvider';
import { TFunction, useTranslation } from 'react-i18next';
import { SelectDataProps } from './SelectDataProps';
import { getText } from '@utils/ReadingProjectText';
import { SelectCustom } from '@components/SelectCustom';

/**
 * Get the traduction by index
 * @param index
 * @param t
 * @returns string
 */
const getTraductionByIndex = (index: number, t: TFunction<['database_natures']>) => {
  switch (index) {
    case 1:
      return t('database_natures:attack');
    case 2:
      return t('database_natures:defense');
    case 3:
      return t('database_natures:speed');
    case 4:
      return t('database_natures:special_attack');
    case 5:
      return t('database_natures:special_defense');
    default:
      return '';
  }
};

/**
 * Get the nature extra stats compared to depending stats
 * @param state
 * @param t useTranslation
 * @returns Record<string, string>
 */
const getNatureExtraStatsComparedToDependingStats = (state: State, t: TFunction<['database_natures']>): Record<string, string> => {
  const natures = state.projectConfig.natures.db_symbol_to_id;
  const stats = state.projectConfig.natures.data;

  const natureExtraStatsComparedToDependingStats: Record<string, string> = {};

  for (const [natureSymbol, natureId] of Object.entries(natures)) {
    const natureStats = stats[natureId];
    if (natureStats) {
      // Get the index of the stats
      const upStatIndex = natureStats.findIndex((ns, index) => index > 0 && ns > 100);
      const downStatIndex = natureStats.findIndex((ns, index) => index > 0 && ns < 100);
      // Get the traduction of the stats
      const upStatTraduction = getTraductionByIndex(upStatIndex, t);
      const downStatTraduction = getTraductionByIndex(downStatIndex, t);

      // Constrution of the string
      if (upStatTraduction) {
        natureExtraStatsComparedToDependingStats[natureSymbol] = `+${upStatTraduction || ''}`;
      }

      if (downStatTraduction) {
        natureExtraStatsComparedToDependingStats[natureSymbol] = `${upStatTraduction ? '+' + upStatTraduction : ''}
        ${upStatTraduction ? ' / ' : ''}
        ${downStatTraduction ? '-' + downStatTraduction : ''}`;
      }
    }
  }
  return natureExtraStatsComparedToDependingStats;
};

/**
 * Get the nature options
 * @param state
 * @param t useTranslation
 * @returns SelectOption[]
 */
const getNatureOptions = (state: State, t: TFunction<['database_natures']>): SelectOption[] => {
  const test = getNatureExtraStatsComparedToDependingStats(state, t);
  return Object.entries(state.projectConfig.natures.db_symbol_to_id).map(([value, natureId]) => {
    const statByNature = test[value];

    let label = getText(
      {
        texts: state.projectText,
        languages: state.projectStudio.languagesTranslation,
        defaultLanguage: state.projectConfig.language_config.defaultLanguage,
      },
      100008,
      (state.projectConfig.natures.data[natureId] || [0])[0]
    );
    if (statByNature && statByNature !== '') {
      label += ` (${statByNature})`;
    }
    return {
      value,
      label,
    };
  });
};

export const SelectNature = ({ dbSymbol, onChange, noneValue, overwriteNoneValue }: SelectDataProps) => {
  const { t } = useTranslation(['database_abilities', 'pokemon_battler_list', 'database_natures']);
  const [state] = useGlobalState();
  const options = useMemo(() => {
    const natureOptions = getNatureOptions(state, t).sort((a, b) => a.label.localeCompare(b.label));
    return noneValue ? [{ value: '__undef__', label: overwriteNoneValue || t('database_abilities:no_option') }, ...natureOptions] : natureOptions;
  }, [state, noneValue, overwriteNoneValue, t]);

  return (
    <SelectCustom
      options={options}
      onChange={onChange}
      value={
        options.find(({ value }) => value === dbSymbol) || { value: '__undef__', label: overwriteNoneValue || t('database_abilities:no_option') }
      }
    />
  );
};
