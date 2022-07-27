import React from 'react';
import TrainerModel from '@modelEntities/trainer/Trainer.model';
import { useTranslation } from 'react-i18next';
import { Editor, EditorWithPagination, useRefreshUI } from '@components/editor';
import { EditorChildWithSubEditorContainer, SubEditorContainer, SubEditorSeparator } from '@components/editor/EditorContainer';
import { SecondaryButtonWithPlusIcon } from '@components/buttons';
import { InputWithTopLabelContainer, Label, MultiLineInput, PaddedInputContainer } from '@components/inputs';
import { ToolTip, ToolTipContainer } from '@components/Tooltip';
import type { OpenTranslationEditorFunction } from '@utils/useTranslationEditor';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';

type TrainerDialogEditorProps = {
  trainer: TrainerModel;
  openTranslationEditor: OpenTranslationEditorFunction;
};

export const TrainerDialogEditor = ({ trainer, openTranslationEditor }: TrainerDialogEditorProps) => {
  const { t } = useTranslation('database_trainers');
  const refreshUI = useRefreshUI();

  return (
    <EditorWithPagination type="edit" title={t('dialogs')} paginationProps={undefined}>
      <EditorChildWithSubEditorContainer>
        <PaddedInputContainer>
          <InputWithTopLabelContainer>
            <Label htmlFor="victory">{t('trainer_victory')}</Label>
            <TranslateInputContainer onTranslateClick={() => openTranslationEditor('translation_victory')}>
              <MultiLineInput
                name="victory"
                value={trainer.victorySentence()}
                onChange={(event) => refreshUI(trainer.setVictorySentence(event.target.value))}
                placeholder={t('example_victory_sentence')}
              />
            </TranslateInputContainer>
          </InputWithTopLabelContainer>
          <InputWithTopLabelContainer>
            <Label htmlFor="defeat">{t('trainer_defeat')}</Label>
            <TranslateInputContainer onTranslateClick={() => openTranslationEditor('translation_defeat')}>
              <MultiLineInput
                name="defeat"
                value={trainer.defeatSentence()}
                onChange={(event) => refreshUI(trainer.setDefeatSentence(event.target.value))}
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
