import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { EditorOverlay, useRefreshUI } from '@components/editor';
import { useConfigLanguage } from '@utils/useProjectConfig';
import { useTranslation } from 'react-i18next';
import { DashboardEditor } from './DashboardEditor';
import { Input, InputWithTopLabelContainer, Label } from '@components/inputs';
import LanguageConfigModel from '@modelEntities/config/LanguageConfig.model';
import { SelectCustomSimple } from '@components/SelectCustom';
import { TagWithDeletion } from '@components/Tag';
import { DashboardLanguageEditor, DashboardLanguageNewEditor } from './editors';

type TagLanguageContainerProps = {
  noHideCode: boolean;
};

const TagLanguageContainer = styled.div<TagLanguageContainerProps>`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
`;

const TagLanguage = styled.div`
  display: flex;
  gap: 4px;

  & span.text {
    color: ${({ theme }) => theme.colors.text100};
  }

  & span.code {
    color: ${({ theme }) => theme.colors.text400};
  }
`;

const languageDefaultEntries = (language: LanguageConfigModel) =>
  language.choosableLanguageCode
    .map((code, index) => ({ value: code, label: language.choosableLanguageTexts[index] }))
    .sort((a, b) => a.label.localeCompare(b.label));

const getCode = (languageText: string) => languageText.slice(0, languageText.length === 1 ? 1 : 2).toLocaleLowerCase();
const isCodeUnique = (language: LanguageConfigModel) => {
  return language.choosableLanguageCode.every(
    (code, codeIndex) => language.choosableLanguageCode.find((c, idx) => c === code && codeIndex !== idx) === undefined
  );
};

const updateDefaultLanguage = (language: LanguageConfigModel) => {
  if (language.choosableLanguageCode.indexOf(language.defaultLanguage) === -1) {
    language.defaultLanguage = language.choosableLanguageCode[0];
  }
};

export const DashboardLanguage = () => {
  const { projectConfigValues: language, setProjectConfigValues: setLanguage } = useConfigLanguage();
  const currentEditedLanguage = useMemo(() => language.clone(), [language]);
  const languageDefaultOptions = useMemo(() => languageDefaultEntries(language), [language]);
  const [currentEditor, setCurrentEditor] = useState<string | undefined>(undefined);
  const [newLanguage, setNewLanguage] = useState('');
  const [languageIndex, setLanguageIndex] = useState(0);
  const { t } = useTranslation('dashboard_language');
  const refreshUI = useRefreshUI();

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === 'Enter') {
      const target = event.target as HTMLInputElement;
      if (target.value.length === 0) return;

      target.blur();
      setCurrentEditor('new');
    }
  };

  const onEditLanguage = (index: number) => {
    setLanguageIndex(index);
    setCurrentEditor('edit');
  };

  const onDeleteLanguage = (index: number) => {
    currentEditedLanguage.choosableLanguageCode.splice(index, 1);
    currentEditedLanguage.choosableLanguageTexts.splice(index, 1);
    updateDefaultLanguage(currentEditedLanguage);
    refreshUI(setLanguage(currentEditedLanguage));
  };

  const onChangeDefaultLanguage = (defaultLanguage: string) => {
    currentEditedLanguage.defaultLanguage = defaultLanguage;
    refreshUI(setLanguage(currentEditedLanguage));
  };

  const onCloseEditor = () => {
    if (currentEditor === 'new') setCurrentEditor(undefined);
    if (
      !isCodeUnique(currentEditedLanguage) ||
      currentEditedLanguage.choosableLanguageCode.find((code) => code === '') !== undefined ||
      currentEditedLanguage.choosableLanguageTexts.find((text) => text === '') !== undefined
    )
      return;
    updateDefaultLanguage(currentEditedLanguage);
    setLanguage(currentEditedLanguage);
    setCurrentEditor(undefined);
  };

  const onCloseNew = () => {
    setNewLanguage('');
    setCurrentEditor(undefined);
  };

  const editors = {
    new: (
      <DashboardLanguageNewEditor
        defaultValue={{ text: newLanguage, code: getCode(newLanguage) }}
        onClose={() => setCurrentEditor(undefined)}
        onCloseNew={onCloseNew}
      />
    ),
    edit: <DashboardLanguageEditor language={currentEditedLanguage} index={languageIndex} />,
  };

  return (
    <DashboardEditor editorTitle={t('language')} title={t('settings')}>
      <InputWithTopLabelContainer>
        <Label htmlFor="supported-language">{t('supported_languages')}</Label>
        <Input
          type="text"
          name="supported-language"
          value={newLanguage}
          onChange={(event) => refreshUI(setNewLanguage(event.target.value))}
          onKeyDown={handleKeyDown}
        />
        <TagLanguageContainer noHideCode={language.choosableLanguageCode.length === 1}>
          {language.choosableLanguageCode.map((code, index) => (
            <TagWithDeletion
              key={`language-${code}-${index}`}
              index={index}
              onClickDelete={onDeleteLanguage}
              noDeletion={language.choosableLanguageCode.length === 1}
              onClick={() => onEditLanguage(index)}
            >
              <TagLanguage>
                <span className="text">{language.choosableLanguageTexts[index]}</span>
                <span className="code">{`- ${code}`}</span>
              </TagLanguage>
            </TagWithDeletion>
          ))}
        </TagLanguageContainer>
      </InputWithTopLabelContainer>
      <InputWithTopLabelContainer>
        <Label htmlFor="default-language">{t('default_language')}</Label>
        <SelectCustomSimple
          id="select-default-language"
          options={languageDefaultOptions}
          onChange={(value) => onChangeDefaultLanguage(value)}
          value={language.defaultLanguage}
          noTooltip
        />
      </InputWithTopLabelContainer>
      <EditorOverlay currentEditor={currentEditor} editors={editors} onClose={onCloseEditor} />
    </DashboardEditor>
  );
};
