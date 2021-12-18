import { SecondaryButtonWithPlusIcon } from '@components/buttons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { ControlBar } from '@components/ControlBar';
import TrainerModel from '@modelEntities/trainer/Trainer.model';
import { SelectTrainer } from '@components/selects';

type TrainerControlBarProps = {
  onChange: (selected: SelectOption) => void;
  trainer: TrainerModel;
  onClickNewTrainer: () => void;
};

export const TrainerControlBar = ({ onChange, trainer, onClickNewTrainer }: TrainerControlBarProps) => {
  const { t } = useTranslation('database_trainers');

  return (
    <ControlBar>
      <SecondaryButtonWithPlusIcon onClick={onClickNewTrainer}>{t('new')}</SecondaryButtonWithPlusIcon>
      <SelectTrainer dbSymbol={trainer.dbSymbol} onChange={onChange} />
    </ControlBar>
  );
};
