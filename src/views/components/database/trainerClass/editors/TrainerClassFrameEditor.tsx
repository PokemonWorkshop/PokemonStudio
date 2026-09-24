import React, { forwardRef, useRef } from 'react';

import { Editor } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { InputContainer } from '@components/inputs/InputContainer';
import { useDialogsRef } from '@hooks/useDialogsRef';
import { useTrainerClassPage } from '@hooks/usePage';
import { useTranslation } from 'react-i18next';
import { TrainerClassTranslationOverlay, TranslationEditorTitle } from './TrainerClassTranslationOverlay';
import { TranslatableTextFields, TranslatableTextFieldsRef } from './TranslatableTextFields';

export const TrainerClassFrameEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation();
  const { trainerClass, trainerClassName } = useTrainerClassPage();
  const dialogsRef = useDialogsRef<TranslationEditorTitle>();
  const tTFR = useRef<TranslatableTextFieldsRef>(null);

  const onClose = () => {
    tTFR.current?.saveTexts();
  };
  useEditorHandlingClose(ref, onClose);

  const handleTranslateClick = (editorTitle: TranslationEditorTitle) => () => {
    tTFR.current?.saveTexts();
    setTimeout(() => dialogsRef.current?.openDialog(editorTitle), 0);
  };
  const onTranslationOverlayClose = () => tTFR.current?.onTranslationOverlayClose();

  return (
    <Editor type="edit" title={t('information')}>
      <InputContainer>
        <TranslatableTextFields
          ref={tTFR}
          handleTranslateClick={handleTranslateClick}
          trainerClass={trainerClass}
          trainerClassName={trainerClassName}
        />
      </InputContainer>
      <TrainerClassTranslationOverlay trainerClass={trainerClass} onClose={onTranslationOverlayClose} ref={dialogsRef} />
    </Editor>
  );
});
TrainerClassFrameEditor.displayName = 'TrainerClassFrameEditor';
