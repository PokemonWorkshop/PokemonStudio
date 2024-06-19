import { DarkButton } from '@components/buttons';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { EditorTitle } from './Editor';
import { EditorContainer } from './EditorContainer';
import { ReactComponent as ClearIcon } from '@assets/icons/global/clear-tag-icon.svg';
import { useGlobalState } from '@src/GlobalStateProvider';
import { Input, InputContainer, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import { SecondaryTag } from '@components/Tag';
import { getText } from '@utils/ReadingProjectText';
import { getProjectTextChange } from '@hooks/updateProjectText';
import { SavingTextMap } from '@utils/SavingUtils';

const TranslationEditorContainer = styled(EditorContainer)`
  position: absolute;
  top: 0;

  label {
    justify-content: space-between;
    align-items: center;

    & span:first-child {
      color: ${({ theme }) => theme.colors.text100};
    }

    & span:last-child {
      color: ${({ theme }) => theme.colors.primaryBase};
    }
  }
`;

const TranslateEditorTitleContainer = styled.div`
  display: flex;
  gap: 8px;
  justify-content: space-between;

  ${DarkButton} {
    padding: 0;
    min-width: 32px;
    height: 32px;
  }

  ${EditorTitle} {
    padding: 0;

    & > h3 {
      padding: 0;
      border: none;
    }
  }

  padding: 0 0 12px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark20};
  margin-bottom: 16px;
`;

type TranslationInputProps = {
  textId: number;
  fileId: number;
  languageCode: string;
  isMultiline: boolean | undefined;
};

const TranslationInput = ({ textId, fileId, languageCode, isMultiline }: TranslationInputProps) => {
  const [{ projectText: texts, projectConfig, projectStudio }, setState] = useGlobalState();
  const projectText = {
    texts,
    languages: projectStudio.languagesTranslation,
    defaultLanguage: projectConfig.language_config.defaultLanguage,
  };

  const handleChange = (text: string) =>
    setState((currentState) => {
      const currentText = getText(projectText, fileId, textId, projectConfig.language_config.defaultLanguage);
      if (currentText === text) {
        return currentState;
      }
      const change = getProjectTextChange(languageCode, textId, fileId, text, currentState.projectText);
      return {
        ...currentState,
        projectText: {
          ...currentState.projectText,
          [change[0]]: change[1] as string[][],
        },
        savingText: new SavingTextMap(currentState.savingText.set(fileId, 'UPDATE')),
      };
    });

  if (isMultiline) {
    return (
      <MultiLineInput
        name={languageCode}
        value={getText(projectText, fileId, textId, languageCode)}
        onChange={(event) => handleChange(event.currentTarget.value)}
      />
    );
  }

  return (
    <Input
      type="text"
      name={languageCode}
      value={getText(projectText, fileId, textId, languageCode)}
      onChange={(event) => handleChange(event.currentTarget.value)}
    />
  );
};

export type TranslationEditorTitle =
  | 'translation_name'
  | 'translation_description'
  | 'translation_species'
  | 'translation_class'
  | 'translation_victory'
  | 'translation_defeat'
  | 'translation_name_plural';

type TranslateEditorProps = {
  title: TranslationEditorTitle;
  name: string;
  onClose: () => void;
  textId: number;
  fileId: number;
  isMultiline?: boolean;
};

export const TranslationEditor = ({ title, name, textId, fileId, onClose, isMultiline }: TranslateEditorProps) => {
  const { t } = useTranslation('editor');
  const { t: tq } = useTranslation('pokemon_battler_list');
  const [state] = useGlobalState();
  const defaultLanguageCode = state.projectConfig.language_config.defaultLanguage;
  const languageOrder = useMemo(
    () =>
      state.projectStudio.languagesTranslation
        .map<[string, number]>(({ code }, index) => [code, index])
        .filter(([code]) => code !== defaultLanguageCode),
    [state.projectStudio.languagesTranslation, defaultLanguageCode]
  );
  const defaultLanguageName = useMemo(
    () => state.projectStudio.languagesTranslation.find(({ code }) => code === defaultLanguageCode)?.name || '???',
    [defaultLanguageCode, state.projectStudio.languagesTranslation]
  );

  return (
    <TranslationEditorContainer>
      <TranslateEditorTitleContainer>
        <EditorTitle>
          <p>{t('translation')}</p>
          <h3>{t(title, { name })}</h3>
        </EditorTitle>
        <DarkButton onClick={onClose}>
          <ClearIcon />
        </DarkButton>
      </TranslateEditorTitleContainer>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor={defaultLanguageCode}>
            <span>{defaultLanguageName}</span>
            <SecondaryTag>{tq('by_default')}</SecondaryTag>
          </Label>
          <InputContainer>
            <TranslationInput textId={textId} fileId={fileId} languageCode={defaultLanguageCode} isMultiline={isMultiline} />
          </InputContainer>
        </InputWithTopLabelContainer>
        {languageOrder.map(([code, index]) => (
          <InputWithTopLabelContainer key={code}>
            <Label htmlFor={code}>{state.projectStudio.languagesTranslation[index].name}</Label>
            <InputContainer>
              <TranslationInput textId={textId} fileId={fileId} languageCode={code} isMultiline={isMultiline} />
            </InputContainer>
          </InputWithTopLabelContainer>
        ))}
      </InputContainer>
    </TranslationEditorContainer>
  );
};
