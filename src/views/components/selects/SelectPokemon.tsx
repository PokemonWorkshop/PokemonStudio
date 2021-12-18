import React from 'react';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { useGlobalState } from '@src/GlobalStateProvider';
import { useTranslation } from 'react-i18next';
import { getDataOptions, SelectDataGeneric } from './SelectDataGeneric';
import { SelectDataProps } from './SelectDataProps';

/**
 * Component to show a select Pokémon.
 * @param dbSymbol The dbSymbol of the Pokémon
 * @param onChange Set this function to get the value selected in the select
 * @param noLabel If true, the label is not shown
 * @param rejected List of dbSymbol who no must be show in the select
 * @param breakpoint Set the breakpoint for hide the label if necessary
 * @param noneValue Add on the top of the select 'None' value
 * @param noneValueIsError The noneValue is considered as error
 * @param overwriteNoneValue Overwrite the label of the 'None'
 */
export const SelectPokemon = ({
  dbSymbol,
  onChange,
  noLabel,
  rejected,
  breakpoint,
  noneValue,
  noneValueIsError,
  overwriteNoneValue,
}: SelectDataProps) => {
  const { t } = useTranslation('database_pokemon');
  const [state] = useGlobalState();
  const options = getDataOptions(state.projectData, 'pokemon');

  const getData = () => {
    const currentPokemon = state.projectData.pokemon[dbSymbol];
    return currentPokemon ? currentPokemon : ({ value: dbSymbol, label: t('pokemon_deleted') } as SelectOption);
  };

  return (
    <SelectDataGeneric
      data={getData()}
      options={options}
      label={noLabel ? undefined : t('pokemon')}
      noOptionsText={t('no_option')}
      error={!state.projectData.pokemon[dbSymbol] && (noneValueIsError ? true : dbSymbol !== '__undef__')}
      onChange={onChange}
      rejected={rejected}
      breakpoint={breakpoint}
      noneValue={noneValue}
      overwriteNoneValue={overwriteNoneValue}
    />
  );
};
