import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { Editor } from '@components/editor';
import { TFunction, useTranslation } from 'react-i18next';
import { Input, InputContainer, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import { SelectType } from '@components/selects';
import { SelectCustomSimple } from '@components/SelectCustom';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';
import { useGetEntityDescriptionText, useGetEntityNameText, useSetProjectText } from '@utils/ReadingProjectText';
import { MOVE_CATEGORIES, MOVE_DESCRIPTION_TEXT_ID, MOVE_NAME_TEXT_ID, StudioMoveCategory } from '@modelEntities/move';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { useMovePage } from '@utils/usePage';
import { useDialogsRef } from '@utils/useDialogsRef';
import { MoveTranslationOverlay, TranslationEditorTitle } from './MoveTranslationOverlay';
import { useUpdateMove } from './useUpdateMove';

const moveCategoryEntries = (t: TFunction<('database_moves' | 'database_types')[]>) =>
  MOVE_CATEGORIES.map((category) => ({ value: category, label: t(`database_types:${category}`) })).sort((a, b) => a.label.localeCompare(b.label));

export const MoveFrameEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation(['database_moves', 'database_types']);
  const { move } = useMovePage();
  const updateMove = useUpdateMove(move);
  const dialogsRef = useDialogsRef<TranslationEditorTitle>();
  const categoryOptions = useMemo(() => moveCategoryEntries(t), [t]);
  const getMoveName = useGetEntityNameText();
  const getMoveDescription = useGetEntityDescriptionText();
  const setText = useSetProjectText();
  const nameRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const [type, setType] = useState(move.type);
  const [category, setCategory] = useState(move.category);

  const saveTexts = () => {
    if (!nameRef.current || !descriptionRef.current) return;

    setText(MOVE_NAME_TEXT_ID, move.id, nameRef.current.value);
    setText(MOVE_DESCRIPTION_TEXT_ID, move.id, descriptionRef.current.value);
  };

  const canClose = () => !!nameRef.current?.value && !dialogsRef.current?.currentDialog;
  const onClose = () => {
    if (!nameRef.current || !descriptionRef.current || !canClose()) return;
    setText(MOVE_NAME_TEXT_ID, move.id, nameRef.current.value);
    setText(MOVE_DESCRIPTION_TEXT_ID, move.id, descriptionRef.current.value);
    updateMove({ type, category });
    saveTexts();
  };
  useEditorHandlingClose(ref, onClose, canClose);

  const handleTranslateClick = (editorTitle: TranslationEditorTitle) => () => {
    saveTexts();
    setTimeout(() => dialogsRef.current?.openDialog(editorTitle), 0);
  };

  const onTranslationOverlayClose = () => {
    if (!nameRef.current || !descriptionRef.current) return;

    nameRef.current.value = nameRef.current.defaultValue;
    descriptionRef.current.value = descriptionRef.current.defaultValue;
  };

  return (
    <Editor type="edit" title={t('database_moves:information')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="name" required>
            {t('database_moves:name')}
          </Label>
          <TranslateInputContainer onTranslateClick={handleTranslateClick('translation_name')}>
            <Input type="text" name="name" defaultValue={getMoveName(move)} ref={nameRef} placeholder={t('database_moves:example_name')} />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="descr">{t('database_moves:description')}</Label>
          <TranslateInputContainer onTranslateClick={handleTranslateClick('translation_description')}>
            <MultiLineInput
              id="descr"
              defaultValue={getMoveDescription(move)}
              ref={descriptionRef}
              placeholder={t('database_moves:example_description')}
            />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="type">{t('database_moves:type')}</Label>
          <SelectType dbSymbol={type} onChange={(value) => setType(value as DbSymbol)} noLabel />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="type">{t('database_moves:category')}</Label>
          <SelectCustomSimple
            id="select-type"
            options={categoryOptions}
            onChange={(value) => setCategory(value as StudioMoveCategory)}
            value={category}
            noTooltip
          />
        </InputWithTopLabelContainer>
      </InputContainer>
      <MoveTranslationOverlay move={move} onClose={onTranslationOverlayClose} ref={dialogsRef} />
    </Editor>
  );
});
MoveFrameEditor.displayName = 'MoveFrameEditor';
