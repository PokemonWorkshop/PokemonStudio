import React, { useMemo } from 'react';
import { useGlobalState } from '@src/GlobalStateProvider';
import { useTranslation } from 'react-i18next';
import { getSelectDataOptionsOrderedByLabel, SelectDataGeneric } from './SelectDataGeneric';
import { SelectDataProps } from './SelectDataProps';
import { useGetEntityNameTextUsingTextId } from '@utils/ReadingProjectText';

/**
 * Component to show a select ability.
 * @param dbSymbol The dbSymbol of the ability
 * @param onChange Set this function to get the value selected in the select
 * @param noLabel If true, the label is not shown
 * @param rejected List of dbSymbol who no must be show in the select
 * @param breakpoint Set the breakpoint for hide the label if necessary
 * @param noneValue Add on the top of the select 'None' value
 * @param noneValueIsError The noneValue is considered as error
 * @param overwriteNoneValue Overwrite the label of the 'None'
 */
export const SelectAbility = ({
  dbSymbol,
  onChange,
  noLabel,
  rejected,
  breakpoint,
  noneValue,
  noneValueIsError,
  overwriteNoneValue,
}: SelectDataProps) => {
  const { t } = useTranslation('database_abilities');
  const [state] = useGlobalState();
  const getAbilityName = useGetEntityNameTextUsingTextId();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const options = useMemo(() => getSelectDataOptionsOrderedByLabel(state.projectData, 'abilities', getAbilityName), [state.projectData]);

  const getData = () => {
    const currentAbility = state.projectData.abilities[dbSymbol];
    return { value: dbSymbol, label: currentAbility ? getAbilityName(currentAbility) : t('ability_deleted') };
  };

  return (
    <SelectDataGeneric
      data={getData()}
      options={options}
      label={noLabel ? undefined : t('ability')}
      noOptionsText={t('no_option')}
      error={!state.projectData.abilities[dbSymbol] && (noneValueIsError ? true : dbSymbol !== '__undef__')}
      onChange={onChange}
      rejected={rejected}
      breakpoint={breakpoint}
      noneValue={noneValue}
      overwriteNoneValue={overwriteNoneValue}
    />
  );
};
