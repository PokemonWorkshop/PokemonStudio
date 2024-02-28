import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { PageEditor } from '@components/pages';
import { Input, InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectCustomSimple } from '@components/SelectCustom';
import { TagWithDeletion } from '@components/Tag';
import { StudioLanguageConfig } from '@modelEntities/config';
import { useDashboardLanguage } from './useDashboardLanguage';
import { useDialogsRef } from '@utils/useDialogsRef';
import { DashboardLanguageEditorAndDeletionKeys, DashboardLanguageEditorOverlay } from './editors/DashboardLanguageEditorOverlay';
import type { NewLanguage } from './editors/DashboardLanguageNewEditor';
import type { EditLanguage } from './editors/DashboardLanguageEditor';
import { TextInputError } from '@components/inputs/Input';

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

export const DashboardLanguage = () => {
  const { languageConfig, projectStudio, onChangeDefaultLanguage, onDeleteLanguage, quickAddLanguageConfig } = useDashboardLanguage();
  const dialogsRef = useDialogsRef<DashboardLanguageEditorAndDeletionKeys>();
  const { t } = useTranslation('dashboard_language');
  const languageDefaultOptions = useMemo(() => languageDefaultEntries(languageConfig), [languageConfig]);
  const [newLanguage, setNewLanguage] = useState<NewLanguage>({ from: 'player', name: '' });
  const [editLanguage, setEditLanguage] = useState<EditLanguage>({ from: 'player', index: 0 });
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleKeyDown = (from: 'translation' | 'player', event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const target = event.target as HTMLInputElement;
      if (target.value.length === 0) return;

      setErrorMessage('');
      const result = quickAddLanguageConfig(from, target.value);
      if (result === 'open_new') {
        setNewLanguage({ from, name: target.value });
        dialogsRef.current?.openDialog('new');
      } else if (result === 'already_exist') {
        setErrorMessage(t('language_already_exists', { language: target.value }));
      }
      target.blur();
      target.value = '';
    }
  };

  const onEditLanguage = (from: 'translation' | 'player', index: number) => {
    setEditLanguage({ from, index });
    dialogsRef.current?.openDialog('edit');
  };

  return (
    <PageEditor editorTitle={t('language')} title={t('settings')}>
      <InputWithTopLabelContainer>
        <Label htmlFor="languages-translation">{t('available_languages_translation')}</Label>
        <Input type="text" name="languages-translation" onKeyDown={(event) => handleKeyDown('translation', event)} />
        <TagLanguageContainer noHideCode={projectStudio.languagesTranslation.length === 1}>
          {projectStudio.languagesTranslation.map((language, index) => (
            <TagWithDeletion
              key={`languages-translation-${language.code}-${index}`}
              index={index}
              onClickDelete={() => onDeleteLanguage(index, 'translation')}
              noDeletion={projectStudio.languagesTranslation.length === 1 || languageConfig.choosableLanguageCode.indexOf(language.code) !== -1}
              onClick={() => onEditLanguage('translation', index)}
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
        <Input type="text" name="languages-players" onKeyDown={(event) => handleKeyDown('player', event)} />
        {errorMessage && <TextInputError>{errorMessage}</TextInputError>}
        <TagLanguageContainer noHideCode={languageConfig.choosableLanguageCode.length === 1}>
          {languageConfig.choosableLanguageCode.map((code, index) => (
            <TagWithDeletion
              key={`language-players${code}-${index}`}
              index={index}
              onClickDelete={() => onDeleteLanguage(index, 'player')}
              noDeletion={languageConfig.choosableLanguageCode.length === 1}
              onClick={() => onEditLanguage('player', index)}
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
      <DashboardLanguageEditorOverlay ref={dialogsRef} newLanguage={newLanguage} editLanguage={editLanguage} />
    </PageEditor>
  );
};
