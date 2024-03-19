import { Editor } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { Input, InputContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { EmbeddedUnitInput } from '@components/inputs/EmbeddedUnitInput';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';
import { CREATURE_SPECIE_TEXT_ID } from '@modelEntities/creature';
import { useGetProjectText, useSetProjectText } from '@utils/ReadingProjectText';
import { useDialogsRef } from '@utils/useDialogsRef';
import { useCreaturePage } from '@utils/usePage';
import React, { forwardRef, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { CreatureTranslationOverlay, TranslationEditorTitle } from './CreatureTranslationOverlay';
import { useUpdateForm } from './useUpdateForm';

export const PokedexEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation('database_pokemon');
  const dialogsRef = useDialogsRef<TranslationEditorTitle>();
  const { creature, form } = useCreaturePage();
  const updateForm = useUpdateForm(creature, form);
  const setText = useSetProjectText();
  const getText = useGetProjectText();
  const specieRef = useRef<HTMLInputElement>(null);
  const weightRef = useRef<HTMLInputElement>(null);
  const heightRef = useRef<HTMLInputElement>(null);
  const saveTexts = () => {
    if (!specieRef.current) return;

    setText(CREATURE_SPECIE_TEXT_ID, creature.id, specieRef.current.value);
  };

  const canClose = () => {
    if (!dialogsRef.current?.currentDialog) return false;
    if (!weightRef.current || !weightRef.current.validity.valid) return false;
    if (!heightRef.current || !heightRef.current.validity.valid) return false;

    return true;
  };

  const onClose = () => {
    if (!specieRef.current || !weightRef.current || !heightRef.current || !canClose()) return;
    if (dialogsRef.current?.currentDialog) dialogsRef.current.closeDialog();

    const weight = isNaN(weightRef.current.valueAsNumber) ? form.weight : weightRef.current.valueAsNumber;
    const height = isNaN(heightRef.current.valueAsNumber) ? form.height : heightRef.current.valueAsNumber;

    saveTexts();
    updateForm({ weight, height });
  };
  useEditorHandlingClose(ref, onClose, canClose);

  const handleTranslateClick = (editorTitle: TranslationEditorTitle) => () => {
    saveTexts();
    setTimeout(() => dialogsRef.current?.openDialog(editorTitle), 0);
  };
  const onTranslationOverlayClose = () => {
    if (!specieRef.current) return;
    // Since translation Editor sets the texts we can rely on default value that is recomputed on state changes
    specieRef.current.value = specieRef.current.defaultValue;
  };

  return (
    <Editor type="edit" title={t('pokedex')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="height">{t('height')}</Label>
          <EmbeddedUnitInput
            step="0.01"
            lang="en"
            unit="m"
            name="height"
            type="number"
            defaultValue={form.height ?? 0.0}
            min={0.01}
            max={100}
            ref={heightRef}
          />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="weight">{t('weight')}</Label>
          <EmbeddedUnitInput
            unit="kg"
            step="0.01"
            lang="en"
            name="weight"
            type="number"
            defaultValue={form.weight ?? 0.0}
            min={0.01}
            max={1000}
            ref={weightRef}
          />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="species">{t('species')}</Label>
          <TranslateInputContainer onTranslateClick={handleTranslateClick('translation_species')}>
            <Input name="species" type="text" defaultValue={getText(CREATURE_SPECIE_TEXT_ID, creature.id)} ref={specieRef} />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
      </InputContainer>
      <CreatureTranslationOverlay creature={creature} onClose={onTranslationOverlayClose} ref={dialogsRef} />
    </Editor>
  );
});
PokedexEditor.displayName = 'PokedexEditor';
