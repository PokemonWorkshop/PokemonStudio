import { Editor } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { InputWithTopLabelContainer } from '@components/inputs';
import { useDialogsRef } from '@hooks/useDialogsRef';
import { useCreaturePage } from '@hooks/usePage';
import React, { forwardRef, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { CreatureTranslationOverlay, TranslationEditorTitle } from './CreatureTranslationOverlay';
import { useUpdateForm } from './useUpdateForm';
import { useInputAttrsWithLabel } from '@hooks/useInputAttrs';
import { useZodForm } from '@hooks/useZodForm';
import { InputFormContainer } from '@components/inputs/InputContainer';
import { TranslatableTextFields, TranslatableTextFieldsRef } from './InformationEditor/TranslatableTextFields';
import { INFORMATION_EDITOR_SCHEMA } from './InformationEditor/InformationEditorSchema';
import { TypeFields } from './InformationEditor/TypeFields';

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
  const tTFR = useRef<TranslatableTextFieldsRef>(null);
  const formTTFR = useRef<TranslatableTextFieldsRef>(null);
  const { canClose, getFormData, onInputTouched, defaults, formRef } = useZodForm(INFORMATION_EDITOR_SCHEMA, form);
  const { Input } = useInputAttrsWithLabel(INFORMATION_EDITOR_SCHEMA, defaults);

  const canCloseEditor = () => {
    if (dialogsRef.current?.currentDialog) return false;
    return canClose();
  };
  const onClose = () => {
    const result = canClose() && getFormData();
    if (!result || !result.success) return;

    tTFR.current?.saveTexts();
    formTTFR.current?.saveTexts();
    updateForm(result.data);
  };
  useEditorHandlingClose(ref, onClose, canCloseEditor);

  const handleTranslateClick = (editorTitle: TranslationEditorTitle) => () => {
    tTFR.current?.saveTexts();
    formTTFR.current?.saveTexts();
    setTimeout(() => dialogsRef.current?.openDialog(editorTitle), 0);
  };
  const onTranslationOverlayClose = () => {
    tTFR.current?.onTranslationOverlayClose();
    formTTFR.current?.onTranslationOverlayClose();
  };

  return (
    <Editor type="edit" title={t('information')}>
      <InputFormContainer ref={formRef}>
        <TranslatableTextFields
          ref={tTFR}
          handleTranslateClick={handleTranslateClick}
          creature={creature}
          form={form}
          creatureName={creatureName}
          type="base"
        />
        <TypeFields form={form} defaults={defaults} />
        <InputWithTopLabelContainer>
          <Input name="frontOffsetY" label={t('offset')} labelLeft onInput={onInputTouched} />
          <OffsetInfo>{t('offset_info')}</OffsetInfo>
        </InputWithTopLabelContainer>
        <TranslatableTextFields
          ref={formTTFR}
          handleTranslateClick={handleTranslateClick}
          creature={creature}
          form={form}
          creatureName={creatureName}
          type="form"
        />
      </InputFormContainer>
      <CreatureTranslationOverlay creature={creature} form={form} onClose={onTranslationOverlayClose} ref={dialogsRef} />
    </Editor>
  );
});
InformationsEditor.displayName = 'InformationsEditor';
