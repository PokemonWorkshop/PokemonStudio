import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTranslationPage } from '@utils/usePage';
import { DataBlockWrapper, DataInfoContainerHeaderTitle } from '@components/database/dataBlocks';
import styled from 'styled-components';
import { LanguageContext } from '@pages/texts/Translation.page';
import { ButtonRightContainer, DataBlockEditorContainer } from '@components/editor/DataBlockEditorStyle';
import { SeparatorGreyLine } from '@components/separators/SeparatorGreyLine';
import { MultiLineInput } from '@components/inputs';
import { DarkButton } from '@components/buttons';
import { ReactComponent as TranslateIcon } from '@assets/icons/global/translate.svg';
import { ReactComponent as CopyIcon } from '@assets/icons/global/copy.svg';
import { useGlobalState } from '@src/GlobalStateProvider';
import { SavingTextMap } from '@utils/SavingUtils';
import { useTextInfosReadonly } from '@utils/useTextInfos';
import { getProjectTextChange } from '@utils/updateProjectText';
import { ProgressBar } from '@components/progress-bar/ProgressBar';
import { CONTROL } from '@utils/useKeyPress';
import { cleanNaNValue } from '@utils/cleanNaNValue';

const UNTRANSLATED_TEXT_REG = /^$|^NewText$|^\[~[^\]]+\]$/;

const calculateTranslatedTexts = (allTextsFromFile: string[][], index: number) => {
  const untranslatedTextCount = allTextsFromFile.reduce(
    (count, line) => (!line || typeof line[index] !== 'string' || line[index].match(UNTRANSLATED_TEXT_REG) ? count + 1 : count),
    0
  );
  return allTextsFromFile.length - 1 - untranslatedTextCount;
};

const DataBlockTranslateHeader = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  & > h4 {
    ${({ theme }) => theme.fonts.titlesOverline}
    color: ${({ theme }) => theme.colors.text400};
    margin: 0;
    line-height: 22px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
  }

  & > h3 {
    ${({ theme }) => theme.fonts.titlesHeadline6}
    color: ${({ theme }) => theme.colors.text100};
    margin: 0;
    line-height: 22px;
  }
`;

type RenderTextTranslate = {
  isDefault: boolean;
  languageTitle: string;
  textFromFileByIndex: string;
  sourceToCopy?: string;
};

const DataBlockTextTranslate = ({ isDefault, languageTitle, textFromFileByIndex, sourceToCopy }: RenderTextTranslate) => {
  const { currentTextInfo } = useTextInfosReadonly();
  const [, setState] = useGlobalState();
  const languageContext = useContext(LanguageContext);
  const { allTextsFromFile } = useTranslationPage(languageContext.positionLanguage);
  const { t } = useTranslation('text_management');
  const [textTranslate, setTextTranslate] = useState<string>(textFromFileByIndex);
  const [numberOfTextTranslated, setNumberOfTextTranslated] = useState(calculateTranslatedTexts(allTextsFromFile, languageContext.language.index));
  const percentage: number = cleanNaNValue((numberOfTextTranslated / (allTextsFromFile.length - 1)) * 100);

  useEffect(() => {
    setTextTranslate(textFromFileByIndex);
    setNumberOfTextTranslated(calculateTranslatedTexts(allTextsFromFile, languageContext.language.index));
  }, [textFromFileByIndex]);

  const saveText = (copyText?: string) => {
    setState((currentState) => {
      if (textFromFileByIndex === textTranslate && !copyText) {
        return currentState;
      }
      const change = getProjectTextChange(
        languageContext.language.value,
        languageContext.positionLanguage - 1,
        currentTextInfo.fileId,
        copyText ? copyText : textTranslate,
        currentState.projectText
      );
      return {
        ...currentState,
        projectText: {
          ...currentState.projectText,
          [change[0]]: change[1] as string[][],
        },
        savingText: new SavingTextMap(currentState.savingText.set(currentTextInfo.fileId, 'UPDATE')),
      };
    });
  };

  const copyDefaultText = () => {
    if (!sourceToCopy) return;
    setTextTranslate(sourceToCopy);
    saveText(sourceToCopy);
  };
  return (
    <DataBlockEditorContainer size="half" color="light" data-noactive>
      <DataInfoContainerHeaderTitle style={{ justifyContent: 'space-between' }}>
        <DataBlockTranslateHeader>
          <h4>{languageTitle}</h4>
          <h3>{isDefault ? t('default_language') : t('translation')}</h3>
        </DataBlockTranslateHeader>
        {!isDefault && (
          <ProgressBar
            label={`${numberOfTextTranslated}/${allTextsFromFile.length - 1} ` + t('tranlasted_text')}
            value={percentage}
            maxValue={100}
            style={{ alignSelf: 'center' }}
          />
        )}
      </DataInfoContainerHeaderTitle>
      <SeparatorGreyLine />
      <MultiLineInput
        disabled={isDefault}
        id="descr"
        value={textTranslate}
        placeholder={t('example_description')}
        onChange={(event) => setTextTranslate(event.target.value)}
        onKeyDown={(e) => {
          if (e.key === CONTROL) {
            saveText();
          }
        }}
        onFocus={() => languageContext.setDisabledNavigation(true)}
        onBlur={() => {
          saveText();
          languageContext.setDisabledNavigation(false);
        }}
      />
      {!isDefault && (
        <ButtonRightContainer>
          <DarkButton onClick={() => copyDefaultText()}>
            <CopyIcon />
            {t('use_default_language')}
          </DarkButton>
          {/* TODO Maybe later
          <DarkButton disabled={true}>
            <TranslateIcon />
            {t('translate_deepl')}
          </DarkButton> */}
        </ButtonRightContainer>
      )}
    </DataBlockEditorContainer>
  );
};

export const TranslateTarget = () => {
  const { t, i18n } = useTranslation('text_management');
  const languageContext = useContext(LanguageContext);
  const { defaultLanguage, currentTextFromFile, allTextsFromFile, defaultLanguageIndexFromFile } = useTranslationPage(
    languageContext.positionLanguage
  );

  const defaultLanguageToDisplay = i18n.exists(`text_management:language.${defaultLanguage.toLowerCase()}`)
    ? t(`language.${defaultLanguage.toLowerCase()}` as never)
    : t(`language.default`, { prefix: defaultLanguage });

  const languageToDisplay = i18n.exists(`text_management:language.${languageContext.language.value.toLowerCase()}`)
    ? t(`language.${languageContext.language.value.toLowerCase()}` as never)
    : t(`language.default`, { prefix: languageContext.language.value });

  const textExistOrCanExist = currentTextFromFile && allTextsFromFile[0].length > languageContext.language.index;

  return (
    <DataBlockWrapper>
      <DataBlockTextTranslate
        isDefault
        languageTitle={defaultLanguageToDisplay}
        textFromFileByIndex={textExistOrCanExist ? currentTextFromFile[defaultLanguageIndexFromFile.index] : ''}
      />
      <DataBlockTextTranslate
        isDefault={false}
        languageTitle={languageToDisplay}
        textFromFileByIndex={textExistOrCanExist ? currentTextFromFile[languageContext.language.index] : ''}
        sourceToCopy={textExistOrCanExist ? currentTextFromFile[defaultLanguageIndexFromFile.index] : ''}
      />
    </DataBlockWrapper>
  );
};
