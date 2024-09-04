// I'm pretty sure this component can be generalized

import { Input, InputWithTopLabelContainer, Label } from '@components/inputs';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';
import { NATURE_NAME_TEXT_ID, StudioNature } from '@modelEntities/nature';
import { useSetProjectText } from '@utils/ReadingProjectText';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { TranslationEditorTitle } from '../NatureTranslationOverlay';
import { useTranslation } from 'react-i18next';

export type TranslatableTextFieldsRef = {
  saveTexts: () => void;
  onTranslationOverlayClose: () => void;
};
type TranslatableTextFieldsProps = {
  natureName: string;
  nature: StudioNature;
  handleTranslateClick: (editorTitle: TranslationEditorTitle) => () => void;
};

export const TranslatableTextFields = forwardRef<TranslatableTextFieldsRef, TranslatableTextFieldsProps>(
  ({ natureName, nature, handleTranslateClick }, ref) => {
    const { t } = useTranslation('database_natures');
    const nameRef = useRef<HTMLInputElement>(null);
    const setText = useSetProjectText();

    const saveTexts = () => {
      if (!nameRef.current) return;

      setText(NATURE_NAME_TEXT_ID, nature.id, nameRef.current.value);
    };
    const onTranslationOverlayClose = () => {
      if (!nameRef.current) return;
      // Since translation Editor sets the texts we can rely on default value that is recomputed on state changes
      nameRef.current.value = nameRef.current.defaultValue;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useImperativeHandle(ref, () => ({ saveTexts, onTranslationOverlayClose }), [natureName, nature]);

    return (
      <>
        <InputWithTopLabelContainer>
          <Label required>{t('name')}</Label>
          <TranslateInputContainer onTranslateClick={handleTranslateClick('translation_name')}>
            <Input type="text" name="name" defaultValue={natureName} ref={nameRef} placeholder={t('example_name')} required />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
      </>
    );
  }
);
TranslatableTextFields.displayName = 'TranslatableTextFields';
