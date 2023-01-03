import React from 'react';
import { useTranslation } from 'react-i18next';
import { Editor, EditorWithPagination, useRefreshUI } from '@components/editor';
import { EditorChildWithSubEditorContainer, SubEditorContainer, SubEditorSeparator } from '@components/editor/EditorContainer';
import { SecondaryButtonWithPlusIcon } from '@components/buttons';
import { InputWithTopLabelContainer, Label, MultiLineInput, PaddedInputContainer } from '@components/inputs';
import { ToolTip, ToolTipContainer } from '@components/Tooltip';
import type { OpenTranslationEditorFunction } from '@utils/useTranslationEditor';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';
import { useGetProjectText, useSetProjectText } from '@utils/ReadingProjectText';
import { StudioTrainer, TRAINER_DEFEAT_SENTENCE_TEXT_ID, TRAINER_VICTORY_SENTENCE_TEXT_ID } from '@modelEntities/trainer';

type TrainerDialogEditorProps = {
  trainer: StudioTrainer;
  openTranslationEditor: OpenTranslationEditorFunction;
};

export const TrainerDialogEditor = ({ trainer, openTranslationEditor }: TrainerDialogEditorProps) => {
  const { t } = useTranslation('database_trainers');
  const refreshUI = useRefreshUI();
  const getText = useGetProjectText();
  const setText = useSetProjectText();

  return (
    <EditorWithPagination type="edit" title={t('dialogs')} paginationProps={undefined}>
      <EditorChildWithSubEditorContainer>
        <PaddedInputContainer>
          <InputWithTopLabelContainer>
            <Label htmlFor="victory">{t('trainer_victory')}</Label>
            <TranslateInputContainer onTranslateClick={() => openTranslationEditor('translation_victory')}>
              <MultiLineInput
                name="victory"
                value={getText(TRAINER_VICTORY_SENTENCE_TEXT_ID, trainer.id)}
                onChange={(event) => refreshUI(setText(TRAINER_VICTORY_SENTENCE_TEXT_ID, trainer.id, event.target.value))}
                placeholder={t('example_victory_sentence')}
              />
            </TranslateInputContainer>
          </InputWithTopLabelContainer>
          <InputWithTopLabelContainer>
            <Label htmlFor="defeat">{t('trainer_defeat')}</Label>
            <TranslateInputContainer onTranslateClick={() => openTranslationEditor('translation_defeat')}>
              <MultiLineInput
                name="defeat"
                value={getText(TRAINER_DEFEAT_SENTENCE_TEXT_ID, trainer.id)}
                onChange={(event) => refreshUI(setText(TRAINER_DEFEAT_SENTENCE_TEXT_ID, trainer.id, event.target.value))}
                placeholder={t('example_defeat_sentence')}
              />
            </TranslateInputContainer>
          </InputWithTopLabelContainer>
        </PaddedInputContainer>
        <SubEditorContainer>
          <SubEditorSeparator parentEditorHasScrollBar />
          <Editor type="creation" title={t('scripted_dialog')}>
            <ToolTipContainer>
              <ToolTip bottom="100%">{t('available_future_release')}</ToolTip>
              <SecondaryButtonWithPlusIcon disabled onClick={() => {}}>
                {t('new_dialog')}
              </SecondaryButtonWithPlusIcon>
            </ToolTipContainer>
          </Editor>
        </SubEditorContainer>
      </EditorChildWithSubEditorContainer>
    </EditorWithPagination>
  );
};
