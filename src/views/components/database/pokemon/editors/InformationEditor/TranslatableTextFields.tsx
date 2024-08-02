// I'm pretty sure this component can be generalized

import { Input, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';
import {
  CREATURE_DESCRIPTION_TEXT_ID,
  CREATURE_FORM_DESCRIPTION_TEXT_ID,
  CREATURE_FORM_NAME_TEXT_ID,
  CREATURE_NAME_TEXT_ID,
  StudioCreature,
  StudioCreatureForm,
} from '@modelEntities/creature';
import {
  useGetCreatureFormDescriptionText,
  useGetCreatureFormNameText,
  useGetEntityDescriptionText,
  useSetProjectText,
} from '@utils/ReadingProjectText';
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
  form: StudioCreatureForm;
  type: 'base' | 'form';
  handleTranslateClick: (editorTitle: TranslationEditorTitle) => () => void;
};

export const TranslatableTextFields = forwardRef<TranslatableTextFieldsRef, TranslatableTextFieldsProps>(
  ({ creatureName, creature, form, type, handleTranslateClick }, ref) => {
    const { t } = useTranslation('database_pokemon');
    const nameRef = useRef<HTMLInputElement>(null);
    const descriptionRef = useRef<HTMLTextAreaElement>(null);
    const getCreatureDescription = useGetEntityDescriptionText();
    const getCreatureFormName = useGetCreatureFormNameText();
    const getCreatureFormDescription = useGetCreatureFormDescriptionText();
    const setText = useSetProjectText();

    const saveTexts = () => {
      if (!nameRef.current || !descriptionRef.current) return;

      if (type === 'base') {
        setText(CREATURE_NAME_TEXT_ID, creature.id, nameRef.current.value);
        setText(CREATURE_DESCRIPTION_TEXT_ID, creature.id, descriptionRef.current.value);
      } else {
        setText(CREATURE_FORM_NAME_TEXT_ID, form.formTextId.name, nameRef.current.value);
        setText(CREATURE_FORM_DESCRIPTION_TEXT_ID, form.formTextId.description, descriptionRef.current.value);
      }
    };
    const onTranslationOverlayClose = () => {
      if (!nameRef.current || !descriptionRef.current) return;
      // Since translation Editor sets the texts we can rely on default value that is recomputed on state changes
      nameRef.current.value = nameRef.current.defaultValue;
      descriptionRef.current.value = descriptionRef.current.defaultValue;
    };
    useImperativeHandle(ref, () => ({ saveTexts, onTranslationOverlayClose }), [creatureName, creature, form]);

    return (
      <>
        <InputWithTopLabelContainer>
          <Label required={type === 'base'}>{t('name')}</Label>
          <TranslateInputContainer onTranslateClick={handleTranslateClick(type === 'base' ? 'translation_name' : 'translation_form_name')}>
            <Input
              type="text"
              name="name"
              defaultValue={type === 'base' ? creatureName : getCreatureFormName(form)}
              ref={nameRef}
              placeholder={t('example_name')}
              required
            />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer style={{ display: type === 'base' || (type === 'form' && form.form !== 0) ? 'flex' : 'none' }}>
          <Label>{t('description')}</Label>
          <TranslateInputContainer
            onTranslateClick={handleTranslateClick(type === 'base' ? 'translation_description' : 'translation_form_description')}
          >
            <MultiLineInput
              defaultValue={type === 'base' ? getCreatureDescription(creature) : getCreatureFormDescription(form)}
              ref={descriptionRef}
            />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
      </>
    );
  }
);
TranslatableTextFields.displayName = 'TranslatableTextFields';
