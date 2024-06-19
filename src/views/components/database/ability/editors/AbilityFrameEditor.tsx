import React, { forwardRef, useRef } from 'react';
import { Editor } from '@components/editor';
import { useTranslation } from 'react-i18next';
import { Input, InputContainer, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useGetEntityDescriptionTextUsingTextId, useGetEntityNameTextUsingTextId, useSetProjectText } from '@utils/ReadingProjectText';
import { ABILITY_DESCRIPTION_TEXT_ID, ABILITY_NAME_TEXT_ID } from '@modelEntities/ability';
import { useDialogsRef } from '@hooks/useDialogsRef';
import { AbilityTranslationOverlay, TranslationEditorTitle } from './AbilityTranslationOverlay';
import { useAbilityPage } from '@hooks/usePage';

/**
 * Ability Frame Editor.
 * Component that is mainly responsive of editing the name and description of the ability when we click over the top frame in the ability page.
 */
export const AbilityFrameEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation('database_abilities');
  const { ability } = useAbilityPage();
  // dialogsRef used to open the translation editor through AbilityTranslationOverlay
  const dialogsRef = useDialogsRef<TranslationEditorTitle>();
  // Text handling hooks to work with texts
  const getName = useGetEntityNameTextUsingTextId();
  const getDescription = useGetEntityDescriptionTextUsingTextId();
  const setText = useSetProjectText();
  // References used to handle the input fields without having the page to refresh on each key strokes (~blazing fast~)
  const nameRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  /** Save the text in the state so the translation editor or the page do have the last version of the text while rendering */
  const saveTexts = () => {
    if (!nameRef.current || !descriptionRef.current) return;

    setText(ABILITY_NAME_TEXT_ID, ability.textId, nameRef.current.value);
    setText(ABILITY_DESCRIPTION_TEXT_ID, ability.textId, descriptionRef.current.value);
  };

  /**
   * Hook called by EditorOverlay to ensure the page can close, we shouldn't close this editor if the translation dialog is visible
   */
  const canClose = () => !!nameRef.current?.value && !dialogsRef.current?.currentDialog;
  /** Handle the closing of this editor with ESC or clicking on its dialog container */
  const onClose = () => {
    if (!nameRef.current || !descriptionRef.current || !canClose()) return;
    if (dialogsRef.current?.currentDialog) dialogsRef.current.closeDialog();

    saveTexts();
  };
  // Forward two previous function to the ref of that component
  useEditorHandlingClose(ref, onClose, canClose);

  /** Handle the opening of the translation editor, save the text in the input and then open the right dialog */
  const handleTranslateClick = (editorTitle: TranslationEditorTitle) => () => {
    saveTexts();
    setTimeout(() => dialogsRef.current?.openDialog(editorTitle), 0);
  };

  /**
   * Function that handle when the translation dialog closes.
   * It mainly update the input fields based on the changes that may have occurred in the translation dialog.
   */
  const onTranslationOverlayClose = () => {
    if (!nameRef.current || !descriptionRef.current) return;
    // Since translation Editor sets the texts we can rely on default value that is recomputed on state changes
    nameRef.current.value = nameRef.current.defaultValue;
    descriptionRef.current.value = descriptionRef.current.defaultValue;
  };

  return (
    <Editor type="edit" title={t('information')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="name" required>
            {t('name')}
          </Label>
          <TranslateInputContainer onTranslateClick={handleTranslateClick('translation_name')}>
            <Input type="text" name="name" defaultValue={getName(ability)} ref={nameRef} placeholder={t('example_name')} />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="descr">{t('description')}</Label>
          <TranslateInputContainer onTranslateClick={handleTranslateClick('translation_description')}>
            <MultiLineInput id="descr" defaultValue={getDescription(ability)} ref={descriptionRef} />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
      </InputContainer>
      <AbilityTranslationOverlay ability={ability} onClose={onTranslationOverlayClose} ref={dialogsRef} />
    </Editor>
  );
});
AbilityFrameEditor.displayName = 'AbilityFrameEditor';
