import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTranslationPage } from '@utils/usePage';
import { DataGrid } from '@components/database/dataBlocks';
import styled from 'styled-components';
import { Language, LanguageContext } from '@pages/texts/Translation.page';
import { SecondaryButton } from '@components/buttons';

type RenderTextProps = {
  language: Language;
  text: string;
};

const DataTranslateGrid = styled(DataGrid)`
  color: ${({ theme }) => theme.colors.text400};
  grid-template-columns: 100px 655px 191px;
  align-items: center;
  width: auto;

  @media ${(props) => props.theme.breakpoints.dataBox422} {
    grid-template-columns: 100px 135px 191px;
  }

  &:hover:not(.header) {
    background-color: ${({ theme }) => theme.colors.dark14};
    border-radius: 8px;

    .text {
      color: ${({ theme }) => theme.colors.text100};
    }
  }

  .language {
    ${({ theme }) => theme.fonts.normalRegular}
  }

  & .error {
    color: ${({ theme }) => theme.colors.dangerBase};
  }
`;

const RenderTranslateContainer = styled(DataTranslateGrid)`
  box-sizing: border-box;
  height: 40px;
  padding: 0 8px 0 8px;
  margin: 0 -8px 0 -8px;

  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  ${SecondaryButton} {
    height: 32px;
  }
`;

const RenderText = ({ text, language }: RenderTextProps) => {
  const [hovered, setHovered] = useState(false);
  const { t, i18n } = useTranslation('text_management');
  const languageContext = useContext(LanguageContext);

  const languageToDisplay = i18n.exists(`text_management:language.${language.value.toLowerCase()}`)
    ? t(`language.${language.value.toLowerCase()}` as never)
    : t(`language.default`, { prefix: language.value });

  return (
    <RenderTranslateContainer gap="16px" onMouseOver={() => setHovered(true)} onMouseOut={() => setHovered(false)}>
      <span className="language">{languageToDisplay}</span>
      <span className="text">{text}</span>
      <span>
        {hovered && (
          <SecondaryButton
            onClick={() => {
              languageContext.setLanguage(language);
            }}
          >
            {t('change_language')}
          </SecondaryButton>
        )}
      </span>
    </RenderTranslateContainer>
  );
};

const DataTranslatesTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  & span {
    color: ${({ theme }) => theme.colors.text400};
    ${({ theme }) => theme.fonts.normalMedium};
  }
`;

export const TranslateList = () => {
  const { t } = useTranslation('text_management');
  const languageContext = useContext(LanguageContext);
  const { state, languageByIndexFiltered, currentTextFromFile, allTextsFromFile } = useTranslationPage(languageContext.positionLanguage);
  const defaultLanguageCode = state.projectConfig.language_config.defaultLanguage;
  const textExistOrCanExist = currentTextFromFile && allTextsFromFile[0].length > languageContext.language.index;
  
  const languageFilteredWithoutCurrentValue = languageByIndexFiltered.filter((language) => {
    if (language.value === defaultLanguageCode) return;
    if (languageContext.language.value === language.value) return;
    return language;
  });

  return (
    <DataTranslatesTable>
      <DataTranslateGrid gap="16px" className="header">
        <span></span>
        <span></span>
        <span></span>
      </DataTranslateGrid>
      {languageFilteredWithoutCurrentValue.length ? (
        languageFilteredWithoutCurrentValue.map((language) => (
          <RenderText
            key={`type-pokemon-${language.index}`}
            text={textExistOrCanExist ? currentTextFromFile[language.index] : ''}
            language={language}
          />
        ))
      ) : (
        <span>{t('no_langues')}</span>
      )}
    </DataTranslatesTable>
  );
};
