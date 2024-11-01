import React, { forwardRef, useRef } from 'react';
import { Editor } from '@components/editor';
import { useTranslation } from 'react-i18next';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useNaturePage } from '@hooks/usePage';
import { useDialogsRef } from '@hooks/useDialogsRef';
import { NatureTranslationOverlay, TranslationEditorTitle } from './NatureTranslationOverlay';
import { TranslatableTextFields, TranslatableTextFieldsRef } from './NatureFrameEditor/TranslatableTextFields';
import { useZodForm } from '@hooks/useZodForm';
import { InputFormContainer } from '@components/inputs/InputContainer';
import { z } from 'zod';

const FRAME_EDITOR_SCHEMA = z.object({});

export const NatureFrameEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation('database_natures');
  const { nature, natureName } = useNaturePage();
  const dialogsRef = useDialogsRef<TranslationEditorTitle>();
  const tTFR = useRef<TranslatableTextFieldsRef>(null);
  const { canClose, formRef } = useZodForm(FRAME_EDITOR_SCHEMA, nature);

  const canCloseEditor = () => {
    if (dialogsRef.current?.currentDialog) return false;
    return canClose();
  };
  const onClose = () => {
    if (!canClose()) return;

    tTFR.current?.saveTexts();
  };
  useEditorHandlingClose(ref, onClose, canCloseEditor);

  const handleTranslateClick = (editorTitle: TranslationEditorTitle) => () => {
    tTFR.current?.saveTexts();
    setTimeout(() => dialogsRef.current?.openDialog(editorTitle), 0);
  };
  const onTranslationOverlayClose = () => tTFR.current?.onTranslationOverlayClose();

  return (
    <Editor type="edit" title={t('information')}>
      <InputFormContainer ref={formRef}>
        <TranslatableTextFields ref={tTFR} handleTranslateClick={handleTranslateClick} nature={nature} natureName={natureName} />
      </InputFormContainer>
      <NatureTranslationOverlay nature={nature} onClose={onTranslationOverlayClose} ref={dialogsRef} />
    </Editor>
  );
});
NatureFrameEditor.displayName = 'NatureFrameEditor';
