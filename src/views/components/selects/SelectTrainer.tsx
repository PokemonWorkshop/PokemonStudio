import React from 'react';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { useGlobalState } from '@src/GlobalStateProvider';
import { useTranslation } from 'react-i18next';
import { getDataOptions, SelectDataGeneric } from './SelectDataGeneric';
import { SelectDataProps } from './SelectDataProps';

/**
 * Component to show a select trainer.
 * @param dbSymbol The dbSymbol of the trainer
 * @param onChange Set this function to get the value selected in the select
 * @param noLabel If true, the label is not shown
 * @param rejected List of dbSymbol who no must be show in the select
 * @param breakpoint Set the breakpoint for hide the label if necessary
 * @param noneValue Add on the top of the select 'None' value
 * @param noneValueIsError The noneValue is considered as error
 * @param overwriteNoneValue Overwrite the label of the 'None'
 */
export const SelectTrainer = ({
  dbSymbol,
  onChange,
  noLabel,
  rejected,
  breakpoint,
  noneValue,
  noneValueIsError,
  overwriteNoneValue,
}: SelectDataProps) => {
  const { t } = useTranslation('database_trainers');
  const [state] = useGlobalState();
  const options = getDataOptions(state.projectData, 'trainers');

  const getData = () => {
    const currentTrainer = state.projectData.trainers[dbSymbol];
    return currentTrainer ? currentTrainer : ({ value: dbSymbol, label: t('trainer_deleted') } as SelectOption);
  };

  return (
    <SelectDataGeneric
      data={getData()}
      options={options}
      label={noLabel ? undefined : t('trainer')}
      noOptionsText={t('no_option')}
      error={!state.projectData.trainers[dbSymbol] && (noneValueIsError ? true : dbSymbol !== '__undef__')}
      onChange={onChange}
      rejected={rejected}
      breakpoint={breakpoint}
      noneValue={noneValue}
      overwriteNoneValue={overwriteNoneValue}
    />
  );
};
