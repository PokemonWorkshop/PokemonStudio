import React, { forwardRef, useRef } from 'react';
import { Editor } from '@components/editor';
import { useTranslation } from 'react-i18next';
import { Input, InputContainer, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import type { OpenTranslationEditorFunction } from '@utils/useTranslationEditor';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useGetEntityDescriptionTextUsingTextId, useGetEntityNameTextUsingTextId, useSetProjectText } from '@utils/ReadingProjectText';
import { ABILITY_DESCRIPTION_TEXT_ID, ABILITY_NAME_TEXT_ID, StudioAbility } from '@modelEntities/ability';

type AbilityFrameEditorProps = {
  ability: StudioAbility;
  openTranslationEditor: OpenTranslationEditorFunction;
};

export const AbilityFrameEditor = forwardRef<EditorHandlingClose, AbilityFrameEditorProps>(({ ability, openTranslationEditor }, ref) => {
  const { t } = useTranslation('database_abilities');
  const getName = useGetEntityNameTextUsingTextId();
  const getDescription = useGetEntityDescriptionTextUsingTextId();
  const setText = useSetProjectText();
  const nameRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const canClose = () => !!nameRef.current?.value;
  const onClose = () => {
    if (!nameRef.current || !descriptionRef.current || !canClose()) return;
    setText(ABILITY_NAME_TEXT_ID, ability.textId, nameRef.current.value);
    setText(ABILITY_DESCRIPTION_TEXT_ID, ability.textId, descriptionRef.current.value);
  };
  useEditorHandlingClose(ref, onClose, canClose);

  const handleTranslateClick = (editorTitle: Parameters<typeof openTranslationEditor>[0]) => () => {
    if (!nameRef.current || !descriptionRef.current) return;
    onClose(); // Effectively set the translation values
    openTranslationEditor(editorTitle, {
      currentEntityName: nameRef.current.value,
      onEditorClose: () => {
        if (!nameRef.current || !descriptionRef.current) return;
        nameRef.current.value = getName(ability);
        descriptionRef.current.value = getDescription(ability);
      },
    });
  };

  return (
    <Editor type="edit" title={t('information')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="name" required>
            {t('name')}
          </Label>
          <TranslateInputContainer onTranslateClick={handleTranslateClick('translation_name')}>
            <Input type="text" name="name" defaultValue={getName(ability)} ref={nameRef} placeholder={t('example_name')} />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="descr">{t('description')}</Label>
          <TranslateInputContainer onTranslateClick={handleTranslateClick('translation_description')}>
            <MultiLineInput id="descr" defaultValue={getDescription(ability)} ref={descriptionRef} />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
      </InputContainer>
    </Editor>
  );
});
AbilityFrameEditor.displayName = 'AbilityFrameEditor';
