import React from 'react';
import { DataBlockWithTitle, DataFieldsetField } from '../dataBlocks';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useGetProjectText } from '@utils/ReadingProjectText';
import {
  StudioTrainer,
  TRAINER_ADDITIONAL_DIALOGS_TEXT_ID,
  TRAINER_DEFEAT_SENTENCE_TEXT_ID,
  TRAINER_VICTORY_SENTENCE_TEXT_ID,
} from '@modelEntities/trainer';
import { TrainerDialogsRef } from './editors/TrainerEditorOverlay';

const TrainerDialogContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  & .separator {
    height: 1px;
    background-color: ${({ theme }) => theme.colors.dark18};
  }
`;

type TrainerDialogProps = {
  trainer: StudioTrainer;
  dialogsRef: TrainerDialogsRef;
};

export const TrainerDialog = ({ trainer, dialogsRef }: TrainerDialogProps) => {
  const { t } = useTranslation();
  const getText = useGetProjectText();
  const victorySentence = getText(TRAINER_VICTORY_SENTENCE_TEXT_ID, trainer.id);
  const defeatSentence = getText(TRAINER_DEFEAT_SENTENCE_TEXT_ID, trainer.id);

  return (
    <DataBlockWithTitle size="full" title={t('dialogs')} onClick={() => dialogsRef?.current?.openDialog('dialog')}>
      <TrainerDialogContainer>
        <DataFieldsetField
          label={t('trainer_victory')}
          data={victorySentence !== '' ? `“${victorySentence}”` : t('no_sentence')}
          disabled={victorySentence === ''}
        />
        <DataFieldsetField
          label={t('trainer_defeat')}
          data={defeatSentence !== '' ? `“${defeatSentence}”` : t('no_sentence')}
          disabled={defeatSentence === ''}
        />
        {trainer.additionalDialogs.length > 0 && <div className="separator" />}
        {trainer.additionalDialogs.map((additionalDialog, index) => {
          const additionalDialogText = getText(TRAINER_ADDITIONAL_DIALOGS_TEXT_ID, additionalDialog.textId);
          return (
            <DataFieldsetField
              label={t(`additional_dialog_${additionalDialog.condition}`)}
              data={additionalDialogText !== '' ? `“${additionalDialogText}”` : t('no_sentence')}
              disabled={additionalDialogText === ''}
              key={`additional-dialog-${index}`}
            />
          );
        })}
      </TrainerDialogContainer>
    </DataBlockWithTitle>
  );
};
