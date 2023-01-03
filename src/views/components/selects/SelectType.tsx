import React, { useMemo } from 'react';
import { useGlobalState } from '@src/GlobalStateProvider';
import { useTranslation } from 'react-i18next';
import { getSelectDataOptionsOrderedByLabel, SelectDataGeneric } from './SelectDataGeneric';
import { SelectDataProps } from './SelectDataProps';
import { useGetEntityNameTextUsingTextId } from '@utils/ReadingProjectText';

/**
 * Component to show a select type.
 * @param dbSymbol The dbSymbol of the type
 * @param onChange Set this function to get the value selected in the select
 * @param noLabel If true, the label is not shown
 * @param rejected List of dbSymbol who no must be show in the select
 * @param breakpoint Set the breakpoint for hide the label if necessary
 * @param noneValue Add on the top of the select 'None' value
 * @param noneValueIsError The noneValue is considered as error
 * @param overwriteNoneValue Overwrite the label of the 'None'
 */
export const SelectType = ({
  dbSymbol,
  onChange,
  noLabel,
  rejected,
  breakpoint,
  noneValue,
  noneValueIsError,
  overwriteNoneValue,
}: SelectDataProps) => {
  const { t } = useTranslation('database_types');
  const [state] = useGlobalState();
  const getTypeName = useGetEntityNameTextUsingTextId();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const options = useMemo(() => getSelectDataOptionsOrderedByLabel(state.projectData, 'types', getTypeName), [state.projectData]);

  const getData = () => {
    const currentType = state.projectData.types[dbSymbol];
    return { value: dbSymbol, label: currentType ? getTypeName(currentType) : t('type_deleted') };
  };

  return (
    <SelectDataGeneric
      data={getData()}
      options={options}
      label={noLabel ? undefined : t('title')}
      noOptionsText={t('no_option')}
      error={!state.projectData.types[dbSymbol] && (noneValueIsError ? true : dbSymbol !== '__undef__')}
      onChange={onChange}
      rejected={rejected}
      breakpoint={breakpoint}
      noneValue={noneValue}
      overwriteNoneValue={overwriteNoneValue}
    />
  );
};
