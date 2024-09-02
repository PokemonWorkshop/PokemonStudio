import React, { useMemo } from 'react';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { State, useGlobalState } from '@src/GlobalStateProvider';
import { TFunction, useTranslation } from 'react-i18next';
import { SelectDataProps } from './SelectDataProps';
import { getEntityNameText } from '@utils/ReadingProjectText';
import { SelectCustom } from '@components/SelectCustom';
import type { StudioNature, StudioNatureStats, StudioNatureStatsList } from '@modelEntities/natures';

const findUpStats = (stats: StudioNatureStats): StudioNatureStatsList[] => {
  const upStats: StudioNatureStatsList[] = [];
  if (stats.atk > 100) upStats.push('atk');
  if (stats.ats > 100) upStats.push('ats');
  if (stats.dfe > 100) upStats.push('dfe');
  if (stats.dfs > 100) upStats.push('dfs');
  if (stats.spd > 100) upStats.push('spd');

  return upStats;
};

const findDownStats = (stats: StudioNatureStats): StudioNatureStatsList[] => {
  const downStats: StudioNatureStatsList[] = [];
  if (stats.atk < 100) downStats.push('atk');
  if (stats.ats < 100) downStats.push('ats');
  if (stats.dfe < 100) downStats.push('dfe');
  if (stats.dfs < 100) downStats.push('dfs');
  if (stats.spd < 100) downStats.push('spd');

  return downStats;
};

const buildStatTexts = (upStats: StudioNatureStatsList[], downStats: StudioNatureStatsList[], t: TFunction<['database_natures']>) => {
  const upStatTexts = upStats.reduce<string[]>((prev, stat) => [...prev, `+${t(`database_natures:${stat}`)}`], []);
  const statTexts = downStats.reduce<string[]>((prev, stat) => [...prev, `-${t(`database_natures:${stat}`)}`], upStatTexts);
  return statTexts.join(' / ');
};

/**
 * Get the nature extra stats compared to depending stats
 * @param natures Studio natures
 * @param t useTranslation
 * @returns Record<string, string>
 */
const getNatureExtraStatsComparedToDependingStats = (natures: StudioNature[], t: TFunction<['database_natures']>): Record<string, string> => {
  const natureExtraStatsComparedToDependingStats: Record<string, string> = {};
  natures.forEach((nature) => {
    const upStats = findUpStats(nature.stats);
    const downStats = findDownStats(nature.stats);
    natureExtraStatsComparedToDependingStats[nature.dbSymbol] = buildStatTexts(upStats, downStats, t);
  });
  return natureExtraStatsComparedToDependingStats;
};

/**
 * Get the nature options
 * @param state
 * @param t useTranslation
 * @returns SelectOption[]
 */
const getNatureOptions = (state: State, t: TFunction<['database_natures']>): SelectOption[] => {
  const natures = Object.values(state.projectData.natures);
  const natureExtraStats = getNatureExtraStatsComparedToDependingStats(natures, t);
  return natures.map((nature) => {
    const statByNature = natureExtraStats[nature.dbSymbol];

    let label = getEntityNameText(nature, state);
    if (statByNature && statByNature !== '') {
      label += ` (${statByNature})`;
    }
    return {
      value: nature.dbSymbol,
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
