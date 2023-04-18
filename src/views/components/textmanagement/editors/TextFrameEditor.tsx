import React, { forwardRef, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Editor } from '@components/editor';
import { Input, InputContainer, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useTextPage } from '@utils/usePage';

/**
 * Text Frame Editor.
 * Component that is mainly responsive of editing the name and description of the texts file when we click over the top frame in the texts page.
 */
export const TextFrameEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { texts } = useTextPage();
  const { t } = useTranslation('text_management');
  const nameRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const canClose = () => {
    return !!nameRef.current?.value || !descriptionRef.current;
  };

  const onClose = () => {
    if (!nameRef.current || !descriptionRef.current || !canClose) return;

    // TODO: save the modification
    console.log(nameRef.current.value);
    console.log(descriptionRef.current.value);
  };

  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <Editor type="edit" title={t('texts_file')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="name" required>
            {t('name')}
          </Label>
          <Input type="text" name="name" defaultValue={texts.name} ref={nameRef} placeholder={t('example_name')} />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="descr">{t('description')}</Label>
          <MultiLineInput id="descr" defaultValue={texts.description} ref={descriptionRef} placeholder={t('example_description')} />
        </InputWithTopLabelContainer>
      </InputContainer>
    </Editor>
  );
});
TextFrameEditor.displayName = 'TextFrameEditor';
