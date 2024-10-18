import React, { useMemo } from 'react';
import { SelectOption } from '@ds/Select/types';
import { State, useGlobalState } from '@src/GlobalStateProvider';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { SelectDataProps } from './SelectDataProps';
import { getEntityNameText } from '@utils/ReadingProjectText';
import { Select } from '@ds/Select';
import { SelectCustom } from '@components/SelectCustom';
import { STUDIO_NATURE_STATS_LIST, StudioNature, StudioNatureStats, StudioNatureStatsListType } from '@modelEntities/nature';
import { DbSymbol } from '@modelEntities/dbSymbol';

const findUpStats = (stats: StudioNatureStats): StudioNatureStatsListType[] => {
  return STUDIO_NATURE_STATS_LIST.reduce<StudioNatureStatsListType[]>((prev, stat) => {
    if (stats[stat] > 100) return [...prev, stat];

    return prev;
  }, []);
};

const findDownStats = (stats: StudioNatureStats): StudioNatureStatsListType[] => {
  return STUDIO_NATURE_STATS_LIST.reduce<StudioNatureStatsListType[]>((prev, stat) => {
    if (stats[stat] < 100) return [...prev, stat];

    return prev;
  }, []);
};

const buildStatTexts = (upStats: StudioNatureStatsListType[], downStats: StudioNatureStatsListType[], t: TFunction<['database_natures']>) => {
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
const getNatureOptions = (state: State, t: TFunction<['database_natures']>, hideStats: boolean): SelectOption<DbSymbol>[] => {
  const natures = Object.values(state.projectData.natures);
  const natureExtraStats = getNatureExtraStatsComparedToDependingStats(natures, t);
  return natures
    .map((nature) => {
      const statByNature = natureExtraStats[nature.dbSymbol];
      let label = getEntityNameText(nature, state);
      if (!hideStats && statByNature && statByNature !== '') {
        label += ` (${statByNature})`;
      }
      return {
        value: nature.dbSymbol,
        label,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
};

type SelectNatureProps = {
  hideStats?: boolean;
} & SelectDataProps;

export const SelectNature = ({ dbSymbol, onChange, noneValue, overwriteNoneValue, hideStats }: SelectNatureProps) => {
  const { t } = useTranslation(['database_abilities', 'pokemon_battler_list', 'database_natures']);
  const [state] = useGlobalState();
  const options = useMemo(() => {
    const natureOptions = getNatureOptions(state, t, hideStats || false);
    return noneValue ? [{ value: '__undef__', label: overwriteNoneValue || t('database_abilities:no_option') }, ...natureOptions] : natureOptions;
  }, [state, noneValue, overwriteNoneValue, hideStats, t]);

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

type SelectNature2Props = {
  name: string;
  defaultValue?: DbSymbol;
  hideStats?: boolean;
  onChange?: (v: DbSymbol) => void;
};

export const SelectNature2 = ({ hideStats, ...props }: SelectNature2Props) => {
  const { t } = useTranslation(['database_natures']);
  const [state] = useGlobalState();
  const options = useMemo(() => getNatureOptions(state, t, hideStats || false), [state, t, hideStats]);

  return <Select options={options} notFoundLabel={t('database_natures:nature_deleted')} chooseValue="__undef__" spellCheck={false} {...props} />;
};
