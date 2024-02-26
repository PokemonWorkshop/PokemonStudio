import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { EditorOverlay } from '@components/editor';
import { useTranslation } from 'react-i18next';
import { PageEditor } from '@components/pages';
import { Input, InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectCustomSimple } from '@components/SelectCustom';
import { TagWithDeletion } from '@components/Tag';
import { DashboardLanguageEditor, DashboardLanguageNewEditor } from './editors';
import { useConfigGameOptions, useConfigLanguage } from '@utils/useProjectConfig';
import { useProjectSavingLanguage } from '@utils/useProjectSavingLanguage';
import { StudioLanguageConfig } from '@modelEntities/config';
import { cloneEntity } from '@utils/cloneEntity';
import { useProjectStudio } from '@utils/useProjectStudio';

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

const languageDefaultEntries = (language: StudioLanguageConfig) =>
  language.choosableLanguageCode
    .map((code, index) => ({ value: code, label: language.choosableLanguageTexts[index] }))
    .sort((a, b) => a.label.localeCompare(b.label));

const getCode = (languageText: string) => languageText.slice(0, languageText.length === 1 ? 1 : 2).toLocaleLowerCase();
const isCodeUnique = (language: StudioLanguageConfig) => {
  return language.choosableLanguageCode.every(
    (code, codeIndex) => language.choosableLanguageCode.find((c, idx) => c === code && codeIndex !== idx) === undefined
  );
};

const updateDefaultLanguage = (language: StudioLanguageConfig) => {
  if (language.choosableLanguageCode.indexOf(language.defaultLanguage) === -1) {
    language.defaultLanguage = language.choosableLanguageCode[0];
  }
};

export const DashboardLanguage = () => {
  const { projectConfigValues: language, setProjectConfigValues: setLanguage } = useConfigLanguage();
  const { projectConfigValues: gameOption, setProjectConfigValues: setGameOption } = useConfigGameOptions();
  const { projectStudioValues: projectStudio, setProjectStudioValues: setProjectStudio } = useProjectStudio();
  const currentEditedLanguage = useMemo(() => cloneEntity(language), [language]);
  const currentEditedGameOption = useMemo(() => cloneEntity(gameOption), [gameOption]);
  const languageDefaultOptions = useMemo(() => languageDefaultEntries(language), [language]);
  const [currentEditor, setCurrentEditor] = useState<string | undefined>(undefined);
  const [newLanguage, setNewLanguage] = useState('');
  const [languageIndex, setLanguageIndex] = useState(0);
  const { t } = useTranslation('dashboard_language');
  const { savingLanguage, setSavingLanguage } = useProjectSavingLanguage();

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
    const currentCode = currentEditedLanguage.choosableLanguageCode[index];
    setSavingLanguage(savingLanguage.filter((code) => code != currentCode));

    currentEditedLanguage.choosableLanguageCode.splice(index, 1);
    currentEditedLanguage.choosableLanguageTexts.splice(index, 1);
    if (currentEditedLanguage.choosableLanguageCode.length <= 1) {
      currentEditedGameOption.order = currentEditedGameOption.order.filter((k) => k !== 'language');
    }
    updateDefaultLanguage(currentEditedLanguage);
    setLanguage(currentEditedLanguage);
    setGameOption(currentEditedGameOption);
  };

  const onChangeDefaultLanguage = (defaultLanguage: string) => {
    currentEditedLanguage.defaultLanguage = defaultLanguage;
    setLanguage(currentEditedLanguage);
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
    <PageEditor editorTitle={t('language')} title={t('settings')}>
      <InputWithTopLabelContainer>
        <Label htmlFor="languages-translation">{t('available_languages_translation')}</Label>
        <Input
          type="text"
          name="languages-translation"
          value={newLanguage}
          onChange={(event) => setNewLanguage(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <TagLanguageContainer noHideCode={projectStudio.languagesTranslation.length === 1}>
          {projectStudio.languagesTranslation.map((language, index) => (
            <TagWithDeletion
              key={`languages-translation-${language.code}-${index}`}
              index={index}
              onClickDelete={onDeleteLanguage}
              noDeletion={projectStudio.languagesTranslation.length === 1}
              onClick={() => onEditLanguage(index)}
            >
              <TagLanguage>
                <span className="text">{language.name}</span>
                <span className="code">{`- ${language.code}`}</span>
              </TagLanguage>
            </TagWithDeletion>
          ))}
        </TagLanguageContainer>
      </InputWithTopLabelContainer>
      <InputWithTopLabelContainer>
        <Label htmlFor="languages-players">{t('available_languages_players')}</Label>
        <Input
          type="text"
          name="languages-players"
          value={newLanguage}
          onChange={(event) => setNewLanguage(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <TagLanguageContainer noHideCode={language.choosableLanguageCode.length === 1}>
          {language.choosableLanguageCode.map((code, index) => (
            <TagWithDeletion
              key={`language-players${code}-${index}`}
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
    </PageEditor>
  );
};
