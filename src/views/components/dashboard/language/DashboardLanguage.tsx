import React, { useMemo, useRef, useState } from 'react';
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
import { useDashboardLanguage } from './useDashboardLanguage';
import { NewLanguage } from './editors/DashboardLanguageNewEditor';
import { useDialogsRef } from '@utils/useDialogsRef';
import { DashboardLanguageEditorAndDeletionKeys, DashboardLanguageEditorOverlay } from './editors/DashboardLanguageEditorOverlay';
import { DashboardEditorOverlay } from '../editors/DashboardEditorOverlay';

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
  const { languageConfig, projectStudio, onChangeDefaultLanguage, onDeleteLanguage } = useDashboardLanguage();
  const dialogsRef = useDialogsRef<DashboardLanguageEditorAndDeletionKeys>();
  const { t } = useTranslation('dashboard_language');
  /*const currentEditedLanguage = useMemo(() => cloneEntity(language), [language]);
  const currentEditedGameOption = useMemo(() => cloneEntity(gameOptions), [gameOptions]);*/
  const languageDefaultOptions = useMemo(() => languageDefaultEntries(languageConfig), [languageConfig]);
  const [newLanguage, setNewLanguage] = useState<NewLanguage>({ from: 'player', name: '' });
  const [languageIndex, setLanguageIndex] = useState(0);
  const languagesTranslationRef = useRef<HTMLInputElement>(null);
  const languagesPlayersRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (from: 'translation' | 'player', event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const target = event.target as HTMLInputElement;
      if (target.value.length === 0) return;

      target.blur();
      setNewLanguage({ from, name: target.value });
      dialogsRef.current?.openDialog('new');
    }
  };

  const onEditLanguage = (index: number) => {
    setLanguageIndex(index);
    //setCurrentEditor('edit');
    // TODO: from and index
  };

  /*const onCloseEditor = () => {
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
  };*/

  return (
    <PageEditor editorTitle={t('language')} title={t('settings')}>
      <InputWithTopLabelContainer>
        <Label htmlFor="languages-translation">{t('available_languages_translation')}</Label>
        <Input type="text" name="languages-translation" onKeyDown={(event) => handleKeyDown('translation', event)} ref={languagesTranslationRef} />
        <TagLanguageContainer noHideCode={projectStudio.languagesTranslation.length === 1}>
          {projectStudio.languagesTranslation.map((language, index) => (
            <TagWithDeletion
              key={`languages-translation-${language.code}-${index}`}
              index={index}
              onClickDelete={() => onDeleteLanguage(index, 'translation')}
              noDeletion={projectStudio.languagesTranslation.length === 1 || languageConfig.choosableLanguageCode.indexOf(language.code) !== -1}
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
        <Input type="text" name="languages-players" onKeyDown={(event) => handleKeyDown('player', event)} ref={languagesPlayersRef} />
        <TagLanguageContainer noHideCode={languageConfig.choosableLanguageCode.length === 1}>
          {languageConfig.choosableLanguageCode.map((code, index) => (
            <TagWithDeletion
              key={`language-players${code}-${index}`}
              index={index}
              onClickDelete={() => onDeleteLanguage(index, 'player')}
              noDeletion={languageConfig.choosableLanguageCode.length === 1}
              onClick={() => onEditLanguage(index)}
            >
              <TagLanguage>
                <span className="text">{languageConfig.choosableLanguageTexts[index]}</span>
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
          value={languageConfig.defaultLanguage}
          noTooltip
        />
      </InputWithTopLabelContainer>
      <DashboardLanguageEditorOverlay ref={dialogsRef} newLanguage={newLanguage} />
    </PageEditor>
  );
};
