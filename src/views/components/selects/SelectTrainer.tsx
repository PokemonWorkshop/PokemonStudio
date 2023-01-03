import React, { useMemo } from 'react';
import { useGlobalState } from '@src/GlobalStateProvider';
import { useTranslation } from 'react-i18next';
import { getSelectDataOptionsOrderedById, SelectDataGeneric } from './SelectDataGeneric';
import { SelectDataProps } from './SelectDataProps';
import { useGetProjectText } from '@utils/ReadingProjectText';
import { StudioTrainer, TRAINER_CLASS_TEXT_ID, TRAINER_NAME_TEXT_ID } from '@modelEntities/trainer';

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
  const getText = useGetProjectText();
  const getTrainerName = (trainer: StudioTrainer) => `${getText(TRAINER_CLASS_TEXT_ID, trainer.id)} ${getText(TRAINER_NAME_TEXT_ID, trainer.id)}`;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const options = useMemo(() => getSelectDataOptionsOrderedById(state.projectData, 'trainers', getTrainerName), [state.projectData]);

  const getData = () => {
    const currentTrainer = state.projectData.trainers[dbSymbol];
    return { value: dbSymbol, label: currentTrainer ? getTrainerName(currentTrainer) : t('trainer_deleted') };
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
