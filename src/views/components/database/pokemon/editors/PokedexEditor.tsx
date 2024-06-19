import { Editor } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { Input, InputWithTopLabelContainer, Label } from '@components/inputs';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';
import { CREATURE_FORM_VALIDATOR, CREATURE_SPECIE_TEXT_ID } from '@modelEntities/creature';
import { useGetProjectText, useSetProjectText } from '@utils/ReadingProjectText';
import { useDialogsRef } from '@hooks/useDialogsRef';
import { useCreaturePage } from '@hooks/usePage';
import React, { forwardRef, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { CreatureTranslationOverlay, TranslationEditorTitle } from './CreatureTranslationOverlay';
import { useUpdateForm } from './useUpdateForm';
import { useZodForm } from '@hooks/useZodForm';
import { useInputAttrsWithLabel } from '@hooks/useInputAttrs';
import { InputFormContainer } from '@components/inputs/InputContainer';

const POKEDEX_EDITOR_SCHEMA = CREATURE_FORM_VALIDATOR.pick({ weight: true, height: true });

export const PokedexEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation('database_pokemon');
  const dialogsRef = useDialogsRef<TranslationEditorTitle>();
  const { creature, form } = useCreaturePage();
  const updateForm = useUpdateForm(creature, form);
  const setText = useSetProjectText();
  const getText = useGetProjectText();
  const specieRef = useRef<HTMLInputElement>(null);
  const { canClose, getFormData, onInputTouched, defaults, formRef } = useZodForm(POKEDEX_EDITOR_SCHEMA, form);
  const { EmbeddedUnitInput } = useInputAttrsWithLabel(POKEDEX_EDITOR_SCHEMA, defaults);

  const saveTexts = () => {
    if (specieRef.current) setText(CREATURE_SPECIE_TEXT_ID, creature.id, specieRef.current.value);
  };

  const canCloseEditor = () => {
    if (dialogsRef.current?.currentDialog) return false;
    return canClose();
  };
  const onClose = () => {
    const result = canClose() && getFormData();
    if (!result || !result.success) return;

    saveTexts();
    updateForm(result.data);
  };
  useEditorHandlingClose(ref, onClose, canCloseEditor);

  const handleTranslateClick = (editorTitle: TranslationEditorTitle) => () => {
    saveTexts();
    setTimeout(() => dialogsRef.current?.openDialog(editorTitle), 0);
  };
  const onTranslationOverlayClose = () => {
    if (specieRef.current) specieRef.current.value = specieRef.current.defaultValue;
  };

  return (
    <Editor type="edit" title={t('pokedex')}>
      <InputFormContainer ref={formRef}>
        <EmbeddedUnitInput name="height" unit="m" label={t('height')} labelLeft onInput={onInputTouched} />
        <EmbeddedUnitInput name="weight" unit="kg" label={t('weight')} labelLeft onInput={onInputTouched} />
        <InputWithTopLabelContainer>
          <Label htmlFor="species">{t('species')}</Label>
          <TranslateInputContainer onTranslateClick={handleTranslateClick('translation_species')}>
            <Input name="species" type="text" defaultValue={getText(CREATURE_SPECIE_TEXT_ID, creature.id)} ref={specieRef} />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
      </InputFormContainer>
      <CreatureTranslationOverlay creature={creature} onClose={onTranslationOverlayClose} ref={dialogsRef} />
    </Editor>
  );
});
PokedexEditor.displayName = 'PokedexEditor';
