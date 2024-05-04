// I'm pretty sure this component can be generalized

import { Input, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';
import { CREATURE_DESCRIPTION_TEXT_ID, CREATURE_NAME_TEXT_ID, StudioCreature } from '@modelEntities/creature';
import { useGetEntityDescriptionText, useSetProjectText } from '@utils/ReadingProjectText';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { TranslationEditorTitle } from '../CreatureTranslationOverlay';
import { useTranslation } from 'react-i18next';

export type TranslatableTextFieldsRef = {
  saveTexts: () => void;
  onTranslationOverlayClose: () => void;
};
type TranslatableTextFieldsProps = {
  creatureName: string;
  creature: StudioCreature;
  handleTranslateClick: (editorTitle: TranslationEditorTitle) => () => void;
};

export const TranslatableTextFields = forwardRef<TranslatableTextFieldsRef, TranslatableTextFieldsProps>(
  ({ creatureName, creature, handleTranslateClick }, ref) => {
    const { t } = useTranslation('database_pokemon');
    const nameRef = useRef<HTMLInputElement>(null);
    const descriptionRef = useRef<HTMLTextAreaElement>(null);
    const getCreatureDescription = useGetEntityDescriptionText();
    const setText = useSetProjectText();

    const saveTexts = () => {
      if (!nameRef.current || !descriptionRef.current) return;

      setText(CREATURE_NAME_TEXT_ID, creature.id, nameRef.current.value);
      setText(CREATURE_DESCRIPTION_TEXT_ID, creature.id, descriptionRef.current.value);
    };
    const onTranslationOverlayClose = () => {
      if (!nameRef.current || !descriptionRef.current) return;
      // Since translation Editor sets the texts we can rely on default value that is recomputed on state changes
      nameRef.current.value = nameRef.current.defaultValue;
      descriptionRef.current.value = descriptionRef.current.defaultValue;
    };
    useImperativeHandle(ref, () => ({ saveTexts, onTranslationOverlayClose }), [creatureName, creature]);

    return (
      <>
        <InputWithTopLabelContainer>
          <Label required>{t('name')}</Label>
          <TranslateInputContainer onTranslateClick={handleTranslateClick('translation_name')}>
            <Input type="text" defaultValue={creatureName} ref={nameRef} placeholder={t('example_name')} />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label>{t('description')}</Label>
          <TranslateInputContainer onTranslateClick={handleTranslateClick('translation_description')}>
            <MultiLineInput defaultValue={getCreatureDescription(creature)} ref={descriptionRef} />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
      </>
    );
  }
);
TranslatableTextFields.displayName = 'TranslatableTextFields';
