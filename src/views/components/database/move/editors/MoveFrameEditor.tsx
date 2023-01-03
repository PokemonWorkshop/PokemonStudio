import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { Editor } from '@components/editor';
import { TFunction, useTranslation } from 'react-i18next';
import { Input, InputContainer, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import { SelectType } from '@components/selects';
import { SelectCustomSimple } from '@components/SelectCustom';
import type { OpenTranslationEditorFunction } from '@utils/useTranslationEditor';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';
import { useGetEntityDescriptionText, useGetEntityNameText, useSetProjectText } from '@utils/ReadingProjectText';
import { MOVE_CATEGORIES, MOVE_DESCRIPTION_TEXT_ID, MOVE_NAME_TEXT_ID, StudioMove, StudioMoveCategory } from '@modelEntities/move';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { DbSymbol } from '@modelEntities/dbSymbol';

const moveCategoryEntries = (t: TFunction<('database_moves' | 'database_types')[]>) =>
  MOVE_CATEGORIES.map((category) => ({ value: category, label: t(`database_types:${category}`) })).sort((a, b) => a.label.localeCompare(b.label));

type MoveFrameEditorProps = {
  move: StudioMove;
  openTranslationEditor: OpenTranslationEditorFunction;
};

export const MoveFrameEditor = forwardRef<EditorHandlingClose, MoveFrameEditorProps>(({ move, openTranslationEditor }, ref) => {
  const { t } = useTranslation(['database_moves', 'database_types']);
  const categoryOptions = useMemo(() => moveCategoryEntries(t), [t]);
  const getMoveName = useGetEntityNameText();
  const getMoveDescription = useGetEntityDescriptionText();
  const setText = useSetProjectText();
  const nameRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const [type, setType] = useState(move.type);
  const [category, setCategory] = useState(move.category);

  const canClose = () => !!nameRef.current?.value;
  const onClose = () => {
    if (!nameRef.current || !descriptionRef.current || !canClose()) return;
    setText(MOVE_NAME_TEXT_ID, move.id, nameRef.current.value);
    setText(MOVE_DESCRIPTION_TEXT_ID, move.id, descriptionRef.current.value);
    move.type = type;
    move.category = category;
  };
  useEditorHandlingClose(ref, onClose, canClose);

  const handleTranslateClick = (editorTitle: Parameters<typeof openTranslationEditor>[0]) => () => {
    if (!nameRef.current || !descriptionRef.current) return;
    onClose(); // Effectively set the translation values
    openTranslationEditor(editorTitle, {
      currentEntityName: nameRef.current.value,
      onEditorClose: () => {
        if (!nameRef.current || !descriptionRef.current) return;
        nameRef.current.value = getMoveName(move);
        descriptionRef.current.value = getMoveDescription(move);
      },
    });
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
          <SelectType dbSymbol={type} onChange={(event) => setType(event.value as DbSymbol)} noLabel />
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
    </Editor>
  );
});
MoveFrameEditor.displayName = 'MoveFrameEditor';
