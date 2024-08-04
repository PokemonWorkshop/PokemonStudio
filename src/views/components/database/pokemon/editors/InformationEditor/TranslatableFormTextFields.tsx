import { Input, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';
import {
  CREATURE_DESCRIPTION_TEXT_ID,
  CREATURE_FORM_DESCRIPTION_TEXT_ID,
  CREATURE_FORM_NAME_TEXT_ID,
  StudioCreature,
  StudioCreatureForm,
} from '@modelEntities/creature';
import {
  useCopyProjectText,
  useGetCreatureFormDescriptionText,
  useGetCreatureFormNameText,
  useGetEntityDescriptionText,
  useSetProjectText,
} from '@utils/ReadingProjectText';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { TranslationEditorTitle } from '../CreatureTranslationOverlay';
import { useTranslation } from 'react-i18next';
import { TranslatableTextFieldsRef } from './TranslatableTextFields';
import { SecondaryNoBackground } from '@components/buttons';

type TranslatableFormTextFieldsProps = {
  creature: StudioCreature;
  form: StudioCreatureForm;
  handleTranslateClick: (editorTitle: TranslationEditorTitle) => () => void;
};

export const TranslatableFormTextFields = forwardRef<TranslatableTextFieldsRef, TranslatableFormTextFieldsProps>(
  ({ creature, form, handleTranslateClick }, ref) => {
    const { t } = useTranslation('database_pokemon');
    const nameRef = useRef<HTMLInputElement>(null);
    const descriptionRef = useRef<HTMLTextAreaElement>(null);
    const getCreatureDescription = useGetEntityDescriptionText();
    const getCreatureFormName = useGetCreatureFormNameText();
    const getCreatureFormDescription = useGetCreatureFormDescriptionText();
    const setText = useSetProjectText();
    const copyProjectText = useCopyProjectText();

    const saveTexts = () => {
      if (!nameRef.current || !descriptionRef.current) return;

      setText(CREATURE_FORM_NAME_TEXT_ID, form.formTextId.name, nameRef.current.value);
      setText(CREATURE_FORM_DESCRIPTION_TEXT_ID, form.formTextId.description, descriptionRef.current.value);
    };
    const onTranslationOverlayClose = () => {
      if (!nameRef.current || !descriptionRef.current) return;
      // Since translation Editor sets the texts we can rely on default value that is recomputed on state changes
      nameRef.current.value = nameRef.current.defaultValue;
      descriptionRef.current.value = descriptionRef.current.defaultValue;
    };
    useImperativeHandle(ref, () => ({ saveTexts, onTranslationOverlayClose }), [form]);

    const onClickUseBaseDescription = () => {
      const defaultForm = creature.forms.find((form) => form.form === 0);
      if (!defaultForm || !descriptionRef.current) return;

      const srcDescriptionTextId = creature.id + 1;
      const destDescriptionTextId = form.formTextId.description + 1;
      copyProjectText(
        { fileId: CREATURE_DESCRIPTION_TEXT_ID, textId: srcDescriptionTextId },
        { fileId: CREATURE_FORM_DESCRIPTION_TEXT_ID, textId: destDescriptionTextId }
      );
      descriptionRef.current.value = getCreatureDescription(creature);
    };

    return (
      <>
        <InputWithTopLabelContainer>
          <Label required>{t('form_name')}</Label>
          <TranslateInputContainer onTranslateClick={handleTranslateClick('translation_form_name')}>
            <Input
              type="text"
              name="form_name"
              defaultValue={getCreatureFormName(form)}
              ref={nameRef}
              placeholder={t('example_form_name')}
              required
            />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer style={{ display: form.form !== 0 ? 'flex' : 'none' }}>
          <Label>{t('form_description')}</Label>
          <TranslateInputContainer onTranslateClick={handleTranslateClick('translation_form_description')}>
            <MultiLineInput defaultValue={getCreatureFormDescription(form)} ref={descriptionRef} />
          </TranslateInputContainer>
          <SecondaryNoBackground style={{ justifyContent: 'left' }} onClick={onClickUseBaseDescription}>
            {t('use_default_description')}
          </SecondaryNoBackground>
        </InputWithTopLabelContainer>
      </>
    );
  }
);
TranslatableFormTextFields.displayName = 'TranslatableFormTextFields';
