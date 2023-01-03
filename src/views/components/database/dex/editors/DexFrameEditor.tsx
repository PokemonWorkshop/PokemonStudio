import React, { forwardRef, useRef } from 'react';
import { Editor } from '@components/editor';

import { useTranslation } from 'react-i18next';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { OpenTranslationEditorFunction } from '@utils/useTranslationEditor';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';
import { useGetEntityNameUsingCSV, useSetProjectText } from '@utils/ReadingProjectText';
import { StudioDex } from '@modelEntities/dex';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';

type DexFrameEditorProps = {
  dex: StudioDex;
  openTranslationEditor: OpenTranslationEditorFunction;
};

export const DexFrameEditor = forwardRef<EditorHandlingClose, DexFrameEditorProps>(({ dex, openTranslationEditor }, ref) => {
  const { t } = useTranslation('database_dex');
  const getDexName = useGetEntityNameUsingCSV();
  const setText = useSetProjectText();
  const setDexText = (text: string) => setText(dex.csv.csvFileId, dex.csv.csvTextIndex, text);
  const nameRef = useRef<HTMLInputElement>(null);
  const startIdRef = useRef<HTMLInputElement>(null);

  const canClose = () => !!nameRef.current?.value;
  const onClose = () => {
    if (!nameRef.current || !startIdRef.current || !canClose()) return;

    setDexText(nameRef.current.value);
    const startId = startIdRef.current.valueAsNumber;
    if (startId >= 0 && startId <= 999) dex.startId = startId;
  };
  useEditorHandlingClose(ref, onClose, canClose);

  const handleTranslateClick = (editorTitle: Parameters<typeof openTranslationEditor>[0]) => () => {
    if (!nameRef.current) return;
    onClose(); // Effectively set the translation values
    openTranslationEditor(editorTitle, {
      currentEntityName: nameRef.current.value,
      onEditorClose: () => {
        if (nameRef.current) nameRef.current.value = getDexName(dex);
      },
    });
  };

  return (
    <Editor type="edit" title={t('informations')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="name" required>
            {t('dex_name')}
          </Label>
          <TranslateInputContainer onTranslateClick={handleTranslateClick('translation_name')}>
            <Input type="text" name="name" defaultValue={getDexName(dex)} ref={nameRef} placeholder={t('example_name')} />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="first-number">{t('first_number')}</Label>
          <Input type="number" name="first-number" min="0" max="999" defaultValue={isNaN(dex.startId) ? '' : dex.startId} ref={startIdRef} />
        </InputWithLeftLabelContainer>
      </InputContainer>
    </Editor>
  );
});
DexFrameEditor.displayName = 'DexFrameEditor';
