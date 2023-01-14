import { SecondaryButtonWithPlusIcon } from '@components/buttons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SelectChangeEvent } from '@components/SelectCustom/SelectCustomPropsInterface';
import { ControlBar } from '@components/ControlBar';
import { SelectTrainer } from '@components/selects';
import { StudioTrainer } from '@modelEntities/trainer';
import { useSetCurrentDatabasePath } from '@utils/useSetCurrentDatabasePage';

type TrainerControlBarProps = {
  onChange: SelectChangeEvent;
  trainer: StudioTrainer;
  onClickNewTrainer: () => void;
};

export const TrainerControlBar = ({ onChange, trainer, onClickNewTrainer }: TrainerControlBarProps) => {
  const { t } = useTranslation('database_trainers');
  useSetCurrentDatabasePath();

  return (
    <ControlBar>
      <SecondaryButtonWithPlusIcon onClick={onClickNewTrainer}>{t('new')}</SecondaryButtonWithPlusIcon>
      <SelectTrainer dbSymbol={trainer.dbSymbol} onChange={onChange} />
    </ControlBar>
  );
};
