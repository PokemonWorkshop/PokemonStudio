import React, { useMemo } from 'react';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { State, useGlobalState } from '@src/GlobalStateProvider';
import { useTranslation } from 'react-i18next';
import { SelectDataProps } from './SelectDataProps';
import { getText } from '@utils/ReadingProjectText';
import { SelectCustom } from '@components/SelectCustom';

const getNatureOptions = (state: State): SelectOption[] =>
  Object.entries(state.projectConfig.natures.db_symbol_to_id).map(([value, natureId]) => ({
    value,
    label: getText(
      { texts: state.projectText, config: state.projectConfig.language_config },
      100008,
      (state.projectConfig.natures.data[natureId] || [0])[0]
    ),
  }));

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
