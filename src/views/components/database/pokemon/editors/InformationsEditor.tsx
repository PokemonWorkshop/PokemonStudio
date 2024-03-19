import { Editor } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';
import { SelectType } from '@components/selects';
import { CREATURE_DESCRIPTION_TEXT_ID, CREATURE_NAME_TEXT_ID } from '@modelEntities/creature';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { useGetEntityDescriptionText, useSetProjectText } from '@utils/ReadingProjectText';
import { useDialogsRef } from '@utils/useDialogsRef';
import { useCreaturePage } from '@utils/usePage';
import React, { forwardRef, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { CreatureTranslationOverlay, TranslationEditorTitle } from './CreatureTranslationOverlay';
import { useUpdateForm } from './useUpdateForm';

const OffsetInfo = styled.div`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
  user-select: none;
`;

export const InformationsEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation('database_pokemon');
  const dialogsRef = useDialogsRef<TranslationEditorTitle>();
  const { creature, form, creatureName } = useCreaturePage();
  const updateForm = useUpdateForm(creature, form);
  const getCreatureDescription = useGetEntityDescriptionText();
  const setText = useSetProjectText();
  const nameRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const offsetRef = useRef<HTMLInputElement>(null);
  const [type1, setType1] = useState(form.type1);
  const [type2, setType2] = useState(form.type2);

  const saveTexts = () => {
    if (!nameRef.current || !descriptionRef.current) return;

    setText(CREATURE_NAME_TEXT_ID, creature.id, nameRef.current.value);
    setText(CREATURE_DESCRIPTION_TEXT_ID, creature.id, descriptionRef.current.value);
  };

  const canClose = () => {
    if (dialogsRef.current?.currentDialog) return false;
    if (!nameRef.current) return false;
    if (!offsetRef.current || !offsetRef.current.validity.valid) return false;

    return true;
  };

  const onClose = () => {
    if (!nameRef.current || !offsetRef.current || !canClose()) return;
    if (dialogsRef.current?.currentDialog) dialogsRef.current.closeDialog();

    const frontOffsetY = isNaN(offsetRef.current.valueAsNumber) ? form.frontOffsetY : offsetRef.current.valueAsNumber;

    saveTexts();
    updateForm({ type1, type2, frontOffsetY });
  };
  useEditorHandlingClose(ref, onClose, canClose);

  const handleTranslateClick = (editorTitle: TranslationEditorTitle) => () => {
    saveTexts();
    setTimeout(() => dialogsRef.current?.openDialog(editorTitle), 0);
  };
  const onTranslationOverlayClose = () => {
    if (!nameRef.current || !descriptionRef.current) return;
    // Since translation Editor sets the texts we can rely on default value that is recomputed on state changes
    nameRef.current.value = nameRef.current.defaultValue;
    descriptionRef.current.value = descriptionRef.current.defaultValue;
  };

  return (
    <Editor type="edit" title={t('information')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="name" required>
            {t('name')}
          </Label>
          <TranslateInputContainer onTranslateClick={handleTranslateClick('translation_name')}>
            <Input type="text" name="name" defaultValue={creatureName} ref={nameRef} placeholder={t('example_name')} />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="description">{t('description')}</Label>
          <TranslateInputContainer onTranslateClick={handleTranslateClick('translation_description')}>
            <MultiLineInput name="description" defaultValue={getCreatureDescription(creature)} ref={descriptionRef} />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="type1">{t('type1')}</Label>
          <SelectType dbSymbol={type1} onChange={(value) => setType1(value as DbSymbol)} noLabel filter={(value) => value !== type2} />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="type2">{t('type2')}</Label>
          <SelectType dbSymbol={type2} onChange={(value) => setType2(value as DbSymbol)} noLabel filter={(value) => value !== type1} noneValue />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="offset">{t('offset')}</Label>
            <Input type="number" name="offset" min="-999" max="999" defaultValue={form.frontOffsetY} ref={offsetRef} />
          </InputWithLeftLabelContainer>
          <OffsetInfo>{t('offset_info')}</OffsetInfo>
        </InputWithTopLabelContainer>
      </InputContainer>
      <CreatureTranslationOverlay creature={creature} onClose={onTranslationOverlayClose} ref={dialogsRef} />
    </Editor>
  );
});
InformationsEditor.displayName = 'InformationsEditor';
