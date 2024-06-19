import React, { forwardRef, useRef, useState } from 'react';
import { Editor } from '@components/editor';
import { useTranslation } from 'react-i18next';
import {
  Input,
  InputContainer,
  InputWithColorLabelContainer,
  InputWithLeftLabelContainer,
  InputWithTopLabelContainer,
  Label,
} from '@components/inputs';
import { TypeCategoryPreview } from '@components/categories';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';
import { useSetProjectText } from '@utils/ReadingProjectText';
import { TYPE_NAME_TEXT_ID } from '@modelEntities/type';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useTypePage } from '@hooks/usePage';
import { useUpdateType } from './useUpdateType';
import { useDialogsRef } from '@hooks/useDialogsRef';
import { TranslationEditorTitle, TypeTranslationOverlay } from './TypeTranslationOverlay';

export const TypeFrameEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const dialogsRef = useDialogsRef<TranslationEditorTitle>();
  const { currentTypeName, currentType } = useTypePage();
  const updateType = useUpdateType(currentType);
  const { t } = useTranslation(['database_types', 'database_moves']);
  const setText = useSetProjectText();
  const nameRef = useRef<HTMLInputElement>(null);
  const [color, setColor] = useState(currentType.color || '#C3B5B2');

  const canClose = () => !!nameRef.current?.value;

  const onClose = () => {
    if (!nameRef.current || !canClose()) return;

    setText(TYPE_NAME_TEXT_ID, currentType.textId, nameRef.current.value);
    const updatedType = { ...currentType, color: color };
    updateType(updatedType);
  };

  useEditorHandlingClose(ref, onClose, canClose);

  const handleTranslateClick = () => {
    if (nameRef.current) {
      setText(TYPE_NAME_TEXT_ID, currentType.textId, nameRef.current.value);
    }

    setTimeout(() => dialogsRef.current?.openDialog('translation_name'), 0);
  };

  const onTranslationOverlayClose = () => {
    if (!nameRef.current) return;
    currentType.color = color;
    nameRef.current.value = nameRef.current.defaultValue;
  };

  return (
    <Editor type="edit" title={t('database_types:informations')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="name" required>
            {t('database_moves:name')}
          </Label>
          <TranslateInputContainer onTranslateClick={handleTranslateClick}>
            <Input type="text" name="name" ref={nameRef} defaultValue={currentTypeName} placeholder={t('database_types:example_name')} />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
        <InputWithColorLabelContainer>
          <Label htmlFor="color">{t('database_types:color')}</Label>
          <Input type="color" name="color" defaultValue={color} onBlur={(event) => setColor(event.target.value)} />
        </InputWithColorLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="preview">{t('database_types:preview')}</Label>
          <TypeCategoryPreview type={color}>{currentTypeName || '???'}</TypeCategoryPreview>
        </InputWithLeftLabelContainer>
      </InputContainer>
      <TypeTranslationOverlay type={currentType} onClose={onTranslationOverlayClose} ref={dialogsRef} />
    </Editor>
  );
});
TypeFrameEditor.displayName = 'TypeFrameEditor';
