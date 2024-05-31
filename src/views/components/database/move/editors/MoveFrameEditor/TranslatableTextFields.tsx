// I'm pretty sure this component can be generalized

import { Input, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';
import { MOVE_DESCRIPTION_TEXT_ID, MOVE_NAME_TEXT_ID, StudioMove } from '@modelEntities/move';
import { useGetEntityDescriptionText, useSetProjectText } from '@utils/ReadingProjectText';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { TranslationEditorTitle } from '../MoveTranslationOverlay';
import { useTranslation } from 'react-i18next';

export type TranslatableTextFieldsRef = {
  saveTexts: () => void;
  onTranslationOverlayClose: () => void;
};
type TranslatableTextFieldsProps = {
  moveName: string;
  move: StudioMove;
  handleTranslateClick: (editorTitle: TranslationEditorTitle) => () => void;
};

export const TranslatableTextFields = forwardRef<TranslatableTextFieldsRef, TranslatableTextFieldsProps>(
  ({ moveName, move, handleTranslateClick }, ref) => {
    const { t } = useTranslation('database_moves');
    const nameRef = useRef<HTMLInputElement>(null);
    const descriptionRef = useRef<HTMLTextAreaElement>(null);
    const getCreatureDescription = useGetEntityDescriptionText();
    const setText = useSetProjectText();

    const saveTexts = () => {
      if (!nameRef.current || !descriptionRef.current) return;

      setText(MOVE_NAME_TEXT_ID, move.id, nameRef.current.value);
      setText(MOVE_DESCRIPTION_TEXT_ID, move.id, descriptionRef.current.value);
    };
    const onTranslationOverlayClose = () => {
      if (!nameRef.current || !descriptionRef.current) return;
      // Since translation Editor sets the texts we can rely on default value that is recomputed on state changes
      nameRef.current.value = nameRef.current.defaultValue;
      descriptionRef.current.value = descriptionRef.current.defaultValue;
    };
    useImperativeHandle(ref, () => ({ saveTexts, onTranslationOverlayClose }), [moveName, move]);

    return (
      <>
        <InputWithTopLabelContainer>
          <Label required>{t('name')}</Label>
          <TranslateInputContainer onTranslateClick={handleTranslateClick('translation_name')}>
            <Input type="text" name="name" defaultValue={moveName} ref={nameRef} placeholder={t('example_name')} required />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label>{t('description')}</Label>
          <TranslateInputContainer onTranslateClick={handleTranslateClick('translation_description')}>
            <MultiLineInput defaultValue={getCreatureDescription(move)} ref={descriptionRef} />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
      </>
    );
  }
);
TranslatableTextFields.displayName = 'TranslatableTextFields';
