import React, { useMemo } from 'react';
import { useGlobalState } from '@src/GlobalStateProvider';
import { useTranslation } from 'react-i18next';
import { getSelectDataOptionsOrderedById, SelectDataGeneric } from './SelectDataGeneric';
import { SelectDataProps } from './SelectDataProps';
import { useGetEntityNameText } from '@utils/ReadingProjectText';

/**
 * Component to show a select zone.
 * @param dbSymbol The dbSymbol of the zone
 * @param onChange Set this function to get the value selected in the select
 * @param noLabel If true, the label is not shown
 * @param rejected List of dbSymbol who no must be show in the select
 * @param breakpoint Set the breakpoint for hide the label if necessary
 * @param noneValue Add on the top of the select 'None' value
 * @param noneValueIsError The noneValue is considered as error
 * @param overwriteNoneValue Overwrite the label of the 'None'
 */
export const SelectZone = ({
  dbSymbol,
  onChange,
  noLabel,
  rejected,
  breakpoint,
  noneValue,
  noneValueIsError,
  overwriteNoneValue,
}: SelectDataProps) => {
  const { t } = useTranslation('database_zones');
  const [state] = useGlobalState();
  const getZoneName = useGetEntityNameText();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const options = useMemo(() => getSelectDataOptionsOrderedById(state.projectData, 'zones', getZoneName), [state.projectData]);

  const getData = () => {
    const currentZone = state.projectData.zones[dbSymbol];
    return { value: dbSymbol, label: currentZone ? getZoneName(currentZone) : t('zone_deleted') };
  };

  return (
    <SelectDataGeneric
      data={getData()}
      options={options}
      label={noLabel ? undefined : t('zone')}
      noOptionsText={t('no_option')}
      error={!state.projectData.zones[dbSymbol] && (noneValueIsError ? true : dbSymbol !== '__undef__')}
      onChange={onChange}
      rejected={rejected}
      breakpoint={breakpoint}
      noneValue={noneValue}
      overwriteNoneValue={overwriteNoneValue}
    />
  );
};
