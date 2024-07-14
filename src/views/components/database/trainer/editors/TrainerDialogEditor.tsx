import React, { forwardRef, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Editor, EditorWithPagination } from '@components/editor';
import { EditorChildWithSubEditorContainer, SubEditorContainer, SubEditorSeparator } from '@components/editor/EditorContainer';
import { SecondaryButtonWithPlusIcon } from '@components/buttons';
import { InputWithTopLabelContainer, Label, MultiLineInput, PaddedInputContainer } from '@components/inputs';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';
import { useGetProjectText, useSetProjectText } from '@utils/ReadingProjectText';
import { TRAINER_DEFEAT_SENTENCE_TEXT_ID, TRAINER_VICTORY_SENTENCE_TEXT_ID } from '@modelEntities/trainer';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useTrainerPage } from '@hooks/usePage';
import { useDialogsRef } from '@hooks/useDialogsRef';
import { TrainerTranslationEditorTitle, TrainerTranslationOverlay } from './TrainerTranslationOverlay';
import { TooltipWrapper } from '@ds/Tooltip';

export const TrainerDialogEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation('database_trainers');
  const { trainer } = useTrainerPage();
  const dialogsRef = useDialogsRef<TrainerTranslationEditorTitle>();
  const getText = useGetProjectText();
  const setText = useSetProjectText();
  const victoryRef = useRef<HTMLTextAreaElement>(null);
  const defeatRef = useRef<HTMLTextAreaElement>(null);

  const saveTexts = () => {
    if (!victoryRef.current || !defeatRef.current) return;

    setText(TRAINER_VICTORY_SENTENCE_TEXT_ID, trainer.id, victoryRef.current.value);
    setText(TRAINER_DEFEAT_SENTENCE_TEXT_ID, trainer.id, defeatRef.current.value);
  };

  const onClose = () => {
    if (!victoryRef.current || !defeatRef.current) return;

    saveTexts();
  };
  useEditorHandlingClose(ref, onClose);

  const handleTranslateClick = (editorTitle: TrainerTranslationEditorTitle) => () => {
    saveTexts();
    setTimeout(() => dialogsRef.current?.openDialog(editorTitle));
  };

  const onTranslationOverlayClose = () => {
    if (!victoryRef.current || !defeatRef.current) return;

    victoryRef.current.value = victoryRef.current.defaultValue;
    defeatRef.current.value = defeatRef.current.defaultValue;
  };

  return (
    <EditorWithPagination type="edit" title={t('dialogs')} paginationProps={undefined}>
      <EditorChildWithSubEditorContainer>
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
        <SubEditorContainer>
          <SubEditorSeparator parentEditorHasScrollBar />
          <Editor type="creation" title={t('scripted_dialog')}>
            <TooltipWrapper data-tooltip={t('available_future_release')}>
              <SecondaryButtonWithPlusIcon disabled onClick={() => {}}>
                {t('new_dialog')}
              </SecondaryButtonWithPlusIcon>
            </TooltipWrapper>
          </Editor>
        </SubEditorContainer>
      </EditorChildWithSubEditorContainer>
      <TrainerTranslationOverlay trainer={trainer} onClose={onTranslationOverlayClose} ref={dialogsRef} />
    </EditorWithPagination>
  );
});
TrainerDialogEditor.displayName = 'TrainerDialogEditor';
