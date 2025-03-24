import React, { forwardRef, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Editor } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { Input, InputContainer, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';

import { useZonePage } from '@src/hooks/usePage';
import { useDialogsRef } from '@src/hooks/useDialogsRef';

import { ZONE_DESCRIPTION_TEXT_ID, ZONE_NAME_TEXT_ID } from '@modelEntities/zone';

import { useGetProjectText, useSetProjectText } from '@utils/ReadingProjectText';

import { ZoneTranslationEditorTitle, ZoneTranslationOverlay } from './ZoneTranslationOverlay';

export const ZoneFrameEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const dialogsRef = useDialogsRef<ZoneTranslationEditorTitle>();
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const { t } = useTranslation('database_zones');
  const setText = useSetProjectText();
  const getText = useGetProjectText();
  const { zone } = useZonePage();

  const saveTexts = () => {
    if (!nameRef.current || !descriptionRef.current) return;

    setText(ZONE_NAME_TEXT_ID, zone.id, nameRef.current.value);
    setText(ZONE_DESCRIPTION_TEXT_ID, zone.id, descriptionRef.current.value);
  };

  const canClose = () => {
    const result = !!nameRef.current?.value;
    return result && !dialogsRef.current?.currentDialog;
  };

  const onClose = () => {
    if (!canClose()) return;

    saveTexts();
  };

  useEditorHandlingClose(ref, onClose, canClose);

  const handleTranslateClick = (editorTitle: ZoneTranslationEditorTitle) => () => {
    saveTexts();
    setTimeout(() => dialogsRef.current?.openDialog(editorTitle), 0);
  };

  const onTranslationOverlayClose = () => {
    if (!nameRef.current || !descriptionRef.current) return;

    nameRef.current.value = nameRef.current.defaultValue;
    descriptionRef.current.value = descriptionRef.current.defaultValue;
  };

  return (
    <Editor type="edit" title={t('informations')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="name" required>
            {t('name')}
          </Label>
          <TranslateInputContainer onTranslateClick={handleTranslateClick('translation_name')}>
            <Input type="text" name="zone-name" defaultValue={getText(ZONE_NAME_TEXT_ID, zone.id)} ref={nameRef} placeholder={t('example_name')} />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="descr">{t('description')}</Label>
          <TranslateInputContainer onTranslateClick={handleTranslateClick('translation_description')}>
            <MultiLineInput
              id="descr"
              defaultValue={getText(ZONE_DESCRIPTION_TEXT_ID, zone.id)}
              ref={descriptionRef}
              placeholder={t('example_descr')}
            />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
        <ZoneTranslationOverlay zone={zone} onClose={onTranslationOverlayClose} ref={dialogsRef} />
      </InputContainer>
    </Editor>
  );
});
ZoneFrameEditor.displayName = 'ZoneFrameEditor';
