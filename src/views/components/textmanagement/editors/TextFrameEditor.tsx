import React, { forwardRef, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Editor } from '@components/editor';
import { Input, InputContainer, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useTextPage } from '@hooks/usePage';
import { useGetEntityDescriptionTextUsingTextId, useGetEntityNameTextUsingTextId, useSetProjectText } from '@utils/ReadingProjectText';
import { useDialogsRef } from '@hooks/useDialogsRef';
import { TEXT_INFO_DESCRIPTION_TEXT_ID, TEXT_INFO_NAME_TEXT_ID } from '@modelEntities/textInfo';
import { TextTranslationOverlay, TranslationEditorTitle } from './TextTranslationOverlay';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';

/**
 * Text Frame Editor.
 * Component that is mainly responsive of editing the name and description of the texts file when we click over the top frame in the texts page.
 */
export const TextFrameEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation('text_management');
  const { textInfo } = useTextPage();
  const dialogsRef = useDialogsRef<TranslationEditorTitle>();
  const getName = useGetEntityNameTextUsingTextId();
  const getDescription = useGetEntityDescriptionTextUsingTextId();
  const setText = useSetProjectText();
  const nameRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const saveTexts = () => {
    if (!nameRef.current || !descriptionRef.current) return;

    setText(TEXT_INFO_NAME_TEXT_ID, textInfo.textId, nameRef.current.value);
    setText(TEXT_INFO_DESCRIPTION_TEXT_ID, textInfo.textId, descriptionRef.current.value);
  };

  const canClose = () => !!nameRef.current?.value && !dialogsRef.current?.currentDialog;

  const onClose = () => {
    if (!nameRef.current || !descriptionRef.current || !canClose()) return;
    if (dialogsRef.current?.currentDialog) dialogsRef.current.closeDialog();

    saveTexts();
  };

  useEditorHandlingClose(ref, onClose, canClose);

  const handleTranslateClick = (editorTitle: TranslationEditorTitle) => () => {
    saveTexts();
    setTimeout(() => dialogsRef.current?.openDialog(editorTitle), 0);
  };

  const onTranslationOverlayClose = () => {
    if (!nameRef.current || !descriptionRef.current) return;

    nameRef.current.value = nameRef.current.defaultValue;
    descriptionRef.current.value = descriptionRef.current.defaultValue;
  };

  return (
    <Editor type="edit" title={t('texts_file')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="name" required>
            {t('name')}
          </Label>
          <TranslateInputContainer onTranslateClick={handleTranslateClick('translation_name')}>
            <Input type="text" id="name" defaultValue={getName(textInfo)} ref={nameRef} placeholder={t('example_name')} />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="descr">{t('description')}</Label>
          <TranslateInputContainer onTranslateClick={handleTranslateClick('translation_description')}>
            <MultiLineInput id="descr" defaultValue={getDescription(textInfo)} ref={descriptionRef} placeholder={t('example_description')} />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
      </InputContainer>
      <TextTranslationOverlay textInfo={textInfo} onClose={onTranslationOverlayClose} ref={dialogsRef} />
    </Editor>
  );
});
TextFrameEditor.displayName = 'TextFrameEditor';
