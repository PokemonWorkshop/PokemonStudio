import React, { forwardRef, useRef } from 'react';
import { Editor } from '@components/editor';

import { useTranslation } from 'react-i18next';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';
import { useGetEntityNameUsingCSV, useSetProjectText } from '@utils/ReadingProjectText';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useDexPage } from '@utils/usePage';
import { DexTranslationOverlay, TranslationEditorTitle } from './DexTranslationOverlay';
import { useDialogsRef } from '@utils/useDialogsRef';
import { useUpdateDex } from './useUpdateDex';

export const DexFrameEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation('database_dex');
  const { dex } = useDexPage();
  const updateDex = useUpdateDex(dex);
  const getDexName = useGetEntityNameUsingCSV();
  const setText = useSetProjectText();
  const setDexText = (text: string) => setText(dex.csv.csvFileId, dex.csv.csvTextIndex, text);
  const nameRef = useRef<HTMLInputElement>(null);
  const startIdRef = useRef<HTMLInputElement>(null);
  const dialogsRef = useDialogsRef<TranslationEditorTitle>();

  const canClose = () => !!nameRef.current?.value && !!startIdRef.current && startIdRef?.current.validity.valid;
  const onClose = () => {
    if (!nameRef.current || !startIdRef.current || !canClose()) return;

    setDexText(nameRef.current.value);
    const startId = startIdRef.current.valueAsNumber;
    updateDex({ startId: startId });
  };
  useEditorHandlingClose(ref, onClose, canClose);

  const handleTranslateClick = () => {
    if (!nameRef.current) return;
    setDexText(nameRef.current.value);
    setTimeout(() => dialogsRef.current?.openDialog('translation_name'), 0);
  };

  const onTranslationOverlayClose = () => {
    if (!nameRef.current) return;
    nameRef.current.value = nameRef.current.defaultValue;
  };

  return (
    <Editor type="edit" title={t('informations')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="name" required>
            {t('dex_name')}
          </Label>
          <TranslateInputContainer onTranslateClick={handleTranslateClick}>
            <Input type="text" name="name" defaultValue={getDexName(dex)} ref={nameRef} placeholder={t('example_name')} />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="first-number">{t('first_number')}</Label>
          <Input type="number" name="first-number" min="0" max="999" defaultValue={isNaN(dex.startId) ? '' : dex.startId} ref={startIdRef} />
        </InputWithLeftLabelContainer>
      </InputContainer>
      <DexTranslationOverlay dex={dex} onClose={onTranslationOverlayClose} ref={dialogsRef} />
    </Editor>
  );
});
DexFrameEditor.displayName = 'DexFrameEditor';
