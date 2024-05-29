import React, { useMemo } from 'react';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { State, useGlobalState } from '@src/GlobalStateProvider';
import { useTranslation } from 'react-i18next';
import { SelectDataProps } from './SelectDataProps';
import { getText } from '@utils/ReadingProjectText';
import { SelectCustom } from '@components/SelectCustom';

const statsByNature: Record<string, string> = {
  adamant: '+Atk/-SpAtk',
  bashful: '',
  bold: '+Def/-Atk',
  brave: '+Atk/-Vit',
  calm: '+SpDef/-Def',
  careful: '+SpDef/-SpAtk',
  docile: '',
  gentle: '+SpDef/-Def',
  hardy: '',
  hasty: '+Vit/-Def',
  impish: '+Def/-SpAtk',
  jolly: '+Vit/-SpAtk',
  lax: '+Def/-SpDef',
  lonely: '+Atk/-Def',
  mild: '+SpAtk/-Def',
  modest: '+SpAtk/-Atk',
  naughty: '+Atk/-SpDef',
  naive: '+Vit/-SpDef',
  quiet: '+SpAtk/-Vit',
  quirky: '',
  rash: '+SpAtk/-SpDef',
  relaxed: '+Def/-Vit',
  sassy: '+SpDef/-Vit',
  serious: '',
  timid: '+Vit/-Atk',
};

const getNatureOptions = (state: State): SelectOption[] =>
  Object.entries(state.projectConfig.natures.db_symbol_to_id).map(([value, natureId]) => {
    const statByNature = statsByNature[value];
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

export const SelectNature = ({ dbSymbol, onChange, noneValue, overwriteNoneValue }: SelectDataProps) => {
  const { t } = useTranslation(['database_abilities', 'pokemon_battler_list']);
  const [state] = useGlobalState();
  const options = useMemo(() => {
    const natureOptions = getNatureOptions(state).sort((a, b) => a.label.localeCompare(b.label));
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
