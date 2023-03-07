import { DarkButton } from '@components/buttons';
import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { EditorTitle } from './Editor';
import { EditorContainer } from './EditorContainer';
import { ReactComponent as ClearIcon } from '@assets/icons/global/clear-tag-icon.svg';
import { projectTextSave, useGlobalState } from '@src/GlobalStateProvider';
import { Input, InputContainer, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import { SecondaryTag } from '@components/Tag';
import { getText, useGetProjectText } from '@utils/ReadingProjectText';
import { EditorHandlingClose, useEditorHandlingClose } from './useHandleCloseEditor';
import { getProjectMultiLanguageTextChange } from '@utils/updateProjectText';

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
  defaultValue: string;
  name: string;
  isMultiline: boolean | undefined;
  inputRef: (element: HTMLTextAreaElement | HTMLInputElement | null) => void;
};

const TranslationInput = ({ defaultValue, name, isMultiline, inputRef }: TranslationInputProps) => {
  if (isMultiline) {
    return <MultiLineInput name={name} defaultValue={defaultValue} ref={inputRef} />;
  }

  return <Input type="text" name={name} defaultValue={defaultValue} ref={inputRef} />;
};

export type TranslationEditorTitle =
  | 'translation_name'
  | 'translation_description'
  | 'translation_species'
  | 'translation_class'
  | 'translation_victory'
  | 'translation_defeat';

type InputRefsType = Record<string, HTMLInputElement | HTMLTextAreaElement | null>;

type TranslateEditorProps = {
  title: TranslationEditorTitle;
  name: string;
  onClose: () => void;
  textId: number;
  fileId: number;
  isMultiline?: boolean;
  inputRefs: React.MutableRefObject<InputRefsType>;
};

const TranslationEditor = ({ title, name, textId, fileId, onClose, isMultiline, inputRefs }: TranslateEditorProps) => {
  const { t } = useTranslation('editor');
  const { t: tq } = useTranslation('pokemon_battler_list');
  const [state] = useGlobalState();
  const projectText = { texts: state.projectText, config: state.projectConfig.language_config };
  const defaultLanguageCode = state.projectConfig.language_config.defaultLanguage;
  const languageOrder = useMemo(
    () =>
      state.projectConfig.language_config.choosableLanguageCode
        .map<[string, number]>((code, index) => [code, index])
        .filter(([code]) => code !== defaultLanguageCode),
    [state.projectConfig.language_config, defaultLanguageCode]
  );
  const defaultLanguageName = useMemo(
    () =>
      state.projectConfig.language_config.choosableLanguageTexts[
        state.projectConfig.language_config.choosableLanguageCode.indexOf(defaultLanguageCode)
      ],
    [state.projectConfig.language_config, defaultLanguageCode]
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
            <TranslationInput
              defaultValue={getText(projectText, fileId, textId, defaultLanguageCode)}
              name={defaultLanguageCode}
              isMultiline={isMultiline}
              inputRef={(e) => {
                inputRefs.current[defaultLanguageCode] = e;
              }}
            />
          </InputContainer>
        </InputWithTopLabelContainer>
        {languageOrder.map(([code, index]) => (
          <InputWithTopLabelContainer key={code}>
            <Label htmlFor={code}>{state.projectConfig.language_config.choosableLanguageTexts[index]}</Label>
            <InputContainer>
              <TranslationInput
                defaultValue={getText(projectText, fileId, textId, code)}
                name={code}
                isMultiline={isMultiline}
                inputRef={(e) => {
                  inputRefs.current[code] = e;
                }}
              />
            </InputContainer>
          </InputWithTopLabelContainer>
        ))}
      </InputContainer>
    </TranslationEditorContainer>
  );
};

type TranslationEditorWithCloseHandlingProps = {
  title: TranslationEditorTitle;
  nameTextId: number;
  fileId: number;
  textIndex: number;
  isMultiline: boolean;
  closeDialog: () => void;
  onClose: () => void;
};

/** Wrapper allowing the TranslationEditor to be used with EditorOverlayV2 */
export const TranslationEditorWithCloseHandling = forwardRef<EditorHandlingClose, TranslationEditorWithCloseHandlingProps>(
  ({ title, closeDialog, onClose, fileId, nameTextId, textIndex, isMultiline }, ref) => {
    const [, setState] = useGlobalState();
    const getNameText = useGetProjectText();
    const inputRefs = useRef<InputRefsType>({});
    // Save the name in state to prevent the re-render to change the title when saving new name
    const [name] = useState(getNameText(nameTextId, textIndex));

    const onDialogClose = () => {
      setState((currentState) => {
        const localeChanges = Object.entries(inputRefs.current).map(([key, value]) => [key, value?.value || ''] as const);
        const change = getProjectMultiLanguageTextChange(localeChanges, textIndex, fileId, currentState.projectText);
        return {
          ...currentState,
          tmpHackHasTextToSave: projectTextSave.some((b) => b),
          projectText: {
            ...currentState.projectText,
            [change[0]]: change[1],
          },
        };
      });
      // Let react re-render the back components
      setTimeout(() => onClose(), 0);
    };
    useEditorHandlingClose(ref, onDialogClose);

    return (
      <TranslationEditor
        title={title}
        name={name}
        onClose={closeDialog}
        fileId={fileId}
        textId={textIndex}
        isMultiline={isMultiline}
        inputRefs={inputRefs}
      />
    );
  }
);
TranslationEditorWithCloseHandling.displayName = 'TranslationEditorWithCloseHandling';
