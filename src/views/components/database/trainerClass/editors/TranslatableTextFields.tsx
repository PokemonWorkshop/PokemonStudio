import { Input, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';
import { StudioTrainerClass, TRAINER_CLASS_DESCRIPTION_TEXT_ID, TRAINER_CLASS_NAME_TEXT_ID } from '@modelEntities/trainerClass';
import { useGetEntityDescriptionText, useSetProjectText } from '@utils/ReadingProjectText';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { TranslationEditorTitle } from './TrainerClassTranslationOverlay';

export type TranslatableTextFieldsRef = {
  saveTexts: () => void;
  onTranslationOverlayClose: () => void;
};
type TranslatableTextFieldsProps = {
  trainerClassName: string;
  trainerClass: StudioTrainerClass;
  handleTranslateClick: (editorTitle: TranslationEditorTitle) => () => void;
};

export const TranslatableTextFields = forwardRef<TranslatableTextFieldsRef, TranslatableTextFieldsProps>(
  ({ trainerClassName, trainerClass, handleTranslateClick }, ref) => {
    const { t } = useTranslation();
    const nameRef = useRef<HTMLInputElement>(null);
    const descriptionRef = useRef<HTMLTextAreaElement>(null);
    const getTrainerClassDescription = useGetEntityDescriptionText();
    const setText = useSetProjectText();

    const saveTexts = () => {
      if (!nameRef.current || !descriptionRef.current) return;

      setText(TRAINER_CLASS_NAME_TEXT_ID, trainerClass.id, nameRef.current.value);
      setText(TRAINER_CLASS_DESCRIPTION_TEXT_ID, trainerClass.id, descriptionRef.current.value);
    };
    const onTranslationOverlayClose = () => {
      if (!nameRef.current || !descriptionRef.current) return;
      // Since translation Editor sets the texts we can rely on default value that is recomputed on state changes
      nameRef.current.value = nameRef.current.defaultValue;
      descriptionRef.current.value = descriptionRef.current.defaultValue;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useImperativeHandle(ref, () => ({ saveTexts, onTranslationOverlayClose }), [trainerClassName, trainerClass]);

    return (
      <>
        <InputWithTopLabelContainer>
          <Label required>{t('name')}</Label>
          <TranslateInputContainer onTranslateClick={handleTranslateClick('translation_name')}>
            <Input type="text" name="name" defaultValue={trainerClassName} ref={nameRef} placeholder={t('example_move')} required />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label>{t('description')}</Label>
          <TranslateInputContainer onTranslateClick={handleTranslateClick('translation_description')}>
            <MultiLineInput defaultValue={getTrainerClassDescription(trainerClass)} ref={descriptionRef} />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
      </>
    );
  },
);
TranslatableTextFields.displayName = 'TranslatableTextFields';
