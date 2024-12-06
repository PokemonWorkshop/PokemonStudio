import React, { forwardRef, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Editor, EditorWithPagination } from '@components/editor';
import { EditorChildWithSubEditorContainer, SubEditorContainer, SubEditorSeparator } from '@components/editor/EditorContainer';
import { DeleteButton, SecondaryButtonWithPlusIcon } from '@components/buttons';
import { InputWithTopLabelContainer, Label, MultiLineInput, PaddedInputContainer } from '@components/inputs';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';
import { useGetProjectText, useSetProjectText } from '@utils/ReadingProjectText';
import {
  StudioTrainerAdditionalDialogs,
  TRAINER_ADDITIONAL_DIALOGS_TEXT_ID,
  TRAINER_DEFEAT_SENTENCE_TEXT_ID,
  TRAINER_VICTORY_SENTENCE_TEXT_ID,
} from '@modelEntities/trainer';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useTrainerPage } from '@hooks/usePage';
import { useDialogsRef } from '@hooks/useDialogsRef';
import { TrainerTranslationEditorTitle, TrainerTranslationOverlay } from './TrainerTranslationOverlay';
import { TooltipWrapper } from '@ds/Tooltip';
import { PaginationWithTitleProps } from '@components/PaginationWithTitle';
import { useTrainerDialog } from './useTrainerDialog';
import { Select } from '@ds/Select';
import { useUpdateTrainer } from './useUpdateTrainer';
import styled from 'styled-components';

const InputWithDeleteButton = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding-bottom: 24px;
`;

export const TrainerDialogEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation('database_trainers');
  const { trainer } = useTrainerPage();
  const updateTrainer = useUpdateTrainer(trainer);
  const { dialogs, currentDialog, dialogIndex, canAddDialog, conditionOptions, updateDialogIndex, addDialog, deleteDialog, changeCondition } =
    useTrainerDialog();
  const dialogsRef = useDialogsRef<TrainerTranslationEditorTitle>();
  const getText = useGetProjectText();
  const setText = useSetProjectText();
  const victoryRef = useRef<HTMLTextAreaElement>(null);
  const defeatRef = useRef<HTMLTextAreaElement>(null);
  const sentenceRef = useRef<HTMLTextAreaElement>(null);
  const dialogCount = dialogs.length;

  const saveTexts = () => {
    if (victoryRef.current && defeatRef.current) {
      setText(TRAINER_VICTORY_SENTENCE_TEXT_ID, trainer.id, victoryRef.current.value);
      setText(TRAINER_DEFEAT_SENTENCE_TEXT_ID, trainer.id, defeatRef.current.value);
    }
    if (sentenceRef.current) setText(TRAINER_ADDITIONAL_DIALOGS_TEXT_ID, currentDialog.textId, sentenceRef.current.value);
  };

  const onChangeIndex = (arrow: 'left' | 'right') => {
    if (arrow === 'left') {
      if (dialogIndex > 0) updateDialogIndex(dialogIndex - 1);
    } else {
      if (dialogIndex < dialogCount - 1) updateDialogIndex(dialogIndex + 1);
    }
    saveTexts();
  };

  const newDialog = () => {
    saveTexts();
    setTimeout(addDialog);
  };

  const onClose = () => {
    saveTexts();
    updateTrainer({
      additionalDialogs: dialogs.filter(({ condition }) => condition !== 'default') as StudioTrainerAdditionalDialogs[],
    });
  };
  useEditorHandlingClose(ref, onClose);

  const handleTranslateClick = (editorTitle: TrainerTranslationEditorTitle) => () => {
    saveTexts();
    setTimeout(() => dialogsRef.current?.openDialog(editorTitle));
  };

  const onTranslationOverlayClose = () => {
    if (victoryRef.current && defeatRef.current) {
      victoryRef.current.value = victoryRef.current.defaultValue;
      defeatRef.current.value = defeatRef.current.defaultValue;
    }
    if (sentenceRef.current) sentenceRef.current.value = sentenceRef.current.defaultValue;
  };

  const paginationProps: PaginationWithTitleProps = {
    title: `${currentDialog.condition === 'default' ? t('default_dialogs') : t(`additional_dialog_${currentDialog.condition}`)}`,
    onChangeIndex,
  };

  return (
    <EditorWithPagination type="edit" title={t('dialogs')} paginationProps={dialogCount === 1 ? undefined : paginationProps}>
      <EditorChildWithSubEditorContainer>
        {currentDialog.condition === 'default' ? (
          <PaddedInputContainer>
            <InputWithTopLabelContainer>
              <Label htmlFor="victory">{t('trainer_victory')}</Label>
              <TranslateInputContainer onTranslateClick={handleTranslateClick('translation_victory')}>
                <MultiLineInput
                  id="victory"
                  defaultValue={getText(TRAINER_VICTORY_SENTENCE_TEXT_ID, trainer.id)}
                  ref={victoryRef}
                  placeholder={t('example_victory_sentence')}
                />
              </TranslateInputContainer>
            </InputWithTopLabelContainer>
            <InputWithTopLabelContainer>
              <Label htmlFor="defeat">{t('trainer_defeat')}</Label>
              <TranslateInputContainer onTranslateClick={handleTranslateClick('translation_defeat')}>
                <MultiLineInput
                  id="defeat"
                  defaultValue={getText(TRAINER_DEFEAT_SENTENCE_TEXT_ID, trainer.id)}
                  ref={defeatRef}
                  placeholder={t('example_defeat_sentence')}
                />
              </TranslateInputContainer>
            </InputWithTopLabelContainer>
          </PaddedInputContainer>
        ) : (
          <InputWithDeleteButton>
            <PaddedInputContainer>
              <InputWithTopLabelContainer>
                <Label htmlFor="condition">{t('condition_appearance')}</Label>
                <Select options={conditionOptions} value={currentDialog.condition} onChange={changeCondition} key={`condition-${dialogIndex}`} />
              </InputWithTopLabelContainer>
              <InputWithTopLabelContainer>
                <Label htmlFor="sentence">{t('sentence_spoken')}</Label>
                <TranslateInputContainer onTranslateClick={handleTranslateClick('translation_additional_dialog')}>
                  <MultiLineInput
                    id="sentence"
                    defaultValue={getText(TRAINER_ADDITIONAL_DIALOGS_TEXT_ID, currentDialog.textId)}
                    ref={sentenceRef}
                    key={`sentence-${dialogIndex}`}
                  />
                </TranslateInputContainer>
              </InputWithTopLabelContainer>
            </PaddedInputContainer>
            <DeleteButton onClick={deleteDialog}>{t('delete_dialog')}</DeleteButton>
          </InputWithDeleteButton>
        )}
        <SubEditorContainer>
          <SubEditorSeparator parentEditorHasScrollBar />
          <Editor type="creation" title={t('scripted_dialog')}>
            <TooltipWrapper data-tooltip={!canAddDialog ? t('max_dialog') : undefined}>
              <SecondaryButtonWithPlusIcon disabled={!canAddDialog} onClick={newDialog}>
                {t('new_dialog')}
              </SecondaryButtonWithPlusIcon>
            </TooltipWrapper>
          </Editor>
        </SubEditorContainer>
      </EditorChildWithSubEditorContainer>
      <TrainerTranslationOverlay trainer={trainer} additionalDialog={currentDialog} onClose={onTranslationOverlayClose} ref={dialogsRef} />
    </EditorWithPagination>
  );
});
TrainerDialogEditor.displayName = 'TrainerDialogEditor';
