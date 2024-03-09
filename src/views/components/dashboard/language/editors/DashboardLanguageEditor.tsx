import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EditorWithPagination } from '@components/editor';
import { EditorChildWithSubEditorContainer } from '@components/editor/EditorContainer';
import { Input, InputWithTopLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import { PaginationWithTitleProps } from '@components/PaginationWithTitle';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { DashboardLanguageType, useDashboardLanguage } from '../useDashboardLanguage';
import { cloneEntity } from '@utils/cloneEntity';
import type { StudioProjectLanguageTranslation } from '@modelEntities/project';

export type EditLanguage = {
  from: DashboardLanguageType;
  index: number;
};

type DashboardLanguageEditorProps = {
  editLanguage: EditLanguage;
};

const getCurrentCode = (
  from: DashboardLanguageType,
  index: number,
  choosableLanguageCode: string[],
  languagesTranslation: StudioProjectLanguageTranslation[]
) => {
  if (from === 'translation') return choosableLanguageCode[index];
  return languagesTranslation[index].code;
};

export const DashboardLanguageEditor = forwardRef<EditorHandlingClose, DashboardLanguageEditorProps>(({ editLanguage }, ref) => {
  const { languageConfig, projectStudio, updateLanguageConfig, updateProjectStudio } = useDashboardLanguage();
  const { t } = useTranslation('dashboard_language');
  const [languageIndex, setLanguageIndex] = useState(editLanguage.index);
  const languageLength = editLanguage.from === 'player' ? languageConfig.choosableLanguageTexts.length : projectStudio.languagesTranslation.length;
  const languageTexts = useMemo(
    () => (editLanguage.from === 'player' ? languageConfig.choosableLanguageTexts : projectStudio.languagesTranslation.map(({ name }) => name)),
    [languageConfig, projectStudio, editLanguage]
  );
  const languageTextRef = useRef<HTMLInputElement>(null);
  const currentCode = getCurrentCode(editLanguage.from, languageIndex, languageConfig.choosableLanguageCode, projectStudio.languagesTranslation);

  const updateNameOfLanguagesTranslation = (index: number, newLanguageText: string) => {
    const languagesTranslation = cloneEntity(projectStudio.languagesTranslation);
    languagesTranslation[index].name = newLanguageText;
    updateProjectStudio({ languagesTranslation });
  };

  const updateNameOfChoosableLanguageTexts = (index: number, newLanguageText: string) => {
    const languageConfigTexts = cloneEntity(languageConfig.choosableLanguageTexts);
    languageConfigTexts[index] = newLanguageText;
    updateLanguageConfig({ choosableLanguageTexts: languageConfigTexts });
  };

  const updateText = (newLanguageText: string) => {
    const playerTextIndex = languageConfig.choosableLanguageCode.indexOf(currentCode);
    if (playerTextIndex !== -1) {
      updateNameOfChoosableLanguageTexts(playerTextIndex, newLanguageText);
    }
    const languageTextIndex = projectStudio.languagesTranslation.findIndex(({ code }) => currentCode === code);
    if (languageTextIndex !== -1) {
      updateNameOfLanguagesTranslation(languageTextIndex, newLanguageText);
    }
  };

  const canClose = () => !!languageTextRef.current?.value;
  const onClose = () => {
    if (!languageTextRef.current || !canClose()) return;

    updateText(languageTextRef.current.value);
  };

  useEditorHandlingClose(ref, onClose, canClose);

  const onChangeIndex = (arrow: 'left' | 'right') => {
    if (arrow === 'left') {
      const newIndex = languageIndex <= 0 ? languageLength - 1 : languageIndex - 1;
      setLanguageIndex(newIndex);
      if (languageTextRef.current) languageTextRef.current.value = languageTexts[newIndex];
    } else {
      const newIndex = languageIndex >= languageLength - 1 ? 0 : languageIndex + 1;
      setLanguageIndex(newIndex);
      if (languageTextRef.current) languageTextRef.current.value = languageTexts[newIndex];
    }
  };

  const paginationProps: PaginationWithTitleProps = {
    title: `#${languageIndex + 1} - ${languageTexts[languageIndex] !== '' ? languageTexts[languageIndex] : '???'}`,
    onChangeIndex,
  };

  return (
    <EditorWithPagination
      type="edit"
      title={editLanguage.from === 'player' ? t('available_languages_players') : t('available_languages_translation')}
      paginationProps={paginationProps}
    >
      <EditorChildWithSubEditorContainer>
        <PaddedInputContainer>
          <InputWithTopLabelContainer>
            <Label htmlFor="language-text" required>
              {t('language')}
            </Label>
            <Input
              type="text"
              name="language-text"
              defaultValue={languageTexts[languageIndex]}
              placeholder={t('placeholder_language')}
              ref={languageTextRef}
            />
          </InputWithTopLabelContainer>
        </PaddedInputContainer>
      </EditorChildWithSubEditorContainer>
    </EditorWithPagination>
  );
});
DashboardLanguageEditor.displayName = 'DashboardLanguageEditor';
