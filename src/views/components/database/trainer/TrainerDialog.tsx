import React from 'react';
import { DataBlockWithTitle, DataFieldsetField } from '../dataBlocks';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useGetProjectText } from '@utils/ReadingProjectText';
import { StudioTrainer, TRAINER_DEFEAT_SENTENCE_TEXT_ID, TRAINER_VICTORY_SENTENCE_TEXT_ID } from '@modelEntities/trainer';

const TrainerDialogContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

type TrainerDialogProps = {
  trainer: StudioTrainer;
  onClick: () => void;
};

export const TrainerDialog = ({ trainer, onClick }: TrainerDialogProps) => {
  const { t } = useTranslation('database_trainers');
  const getText = useGetProjectText();
  const victorySentence = getText(TRAINER_VICTORY_SENTENCE_TEXT_ID, trainer.id);
  const defeatSentence = getText(TRAINER_DEFEAT_SENTENCE_TEXT_ID, trainer.id);

  return (
    <DataBlockWithTitle size="full" title={t('dialogs')} onClick={onClick}>
      <TrainerDialogContainer>
        <DataFieldsetField
          label={t('trainer_victory')}
          data={victorySentence !== '' ? `“${victorySentence}”` : '---'}
          disabled={victorySentence === ''}
        />
        <DataFieldsetField
          label={t('trainer_defeat')}
          data={defeatSentence !== '' ? `“${defeatSentence}”` : '---'}
          disabled={defeatSentence === ''}
        />
      </TrainerDialogContainer>
    </DataBlockWithTitle>
  );
};
