import React from 'react';
import TrainerModel from '@modelEntities/trainer/Trainer.model';
import { DataBlockWithTitle, DataFieldsetField } from '../dataBlocks';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const TrainerDialogContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

type TrainerDialogProps = {
  trainer: TrainerModel;
  onClick: () => void;
};

export const TrainerDialog = ({ trainer, onClick }: TrainerDialogProps) => {
  const { t } = useTranslation('database_trainers');

  return (
    <DataBlockWithTitle size="full" title={t('dialogs')} onClick={onClick}>
      <TrainerDialogContainer>
        <DataFieldsetField
          label={t('trainer_victory')}
          data={trainer.victorySentence() !== '' ? `“${trainer.victorySentence()}”` : '---'}
          disabled={trainer.victorySentence() === ''}
        />
        <DataFieldsetField
          label={t('trainer_defeat')}
          data={trainer.defeatSentence() !== '' ? `“${trainer.defeatSentence()}”` : '---'}
          disabled={trainer.defeatSentence() === ''}
        />
      </TrainerDialogContainer>
    </DataBlockWithTitle>
  );
};
