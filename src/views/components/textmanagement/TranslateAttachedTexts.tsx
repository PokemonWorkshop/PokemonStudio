import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTranslationPage } from '@utils/usePage';
import { DataBlockWrapper } from '@components/database/dataBlocks';
import { Input } from '@components/inputs';
import styled from 'styled-components';
import { LanguageContext } from '@pages/texts/Translation.page';

import { ReactComponent as LeftIcon } from '@assets/icons/global/left-icon.svg';
import { ReactComponent as RightIcon } from '@assets/icons/global/right-icon.svg';

export const DataTextWrapper = styled(DataBlockWrapper)`
  width: 1024px;
  justify-content: space-around;

  @media ${(props) => props.theme.breakpoints.smallScreen} {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-items: center;
  }
`;

export const StyledTextNavigationItem = styled.div<{ align?: string }>`
  display: inline-flex;
  flex-wrap: nowrap;
  align-items: center;

  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  color: ${({ theme }) => theme.colors.text400};
  ${({ theme }) => theme.fonts.normalRegular}

  & span {
    width: 400px;
    margin: 0 12px 0 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: ${({ align = 'center' }) => align};
  }

  &[data-disabled='false'] {
    color: ${({ theme }) => theme.colors.text700};
  }

  &[data-disabled='true']:hover {
    cursor: pointer;
  }

  & Input {
    margin-right: 8px;
  }
`;

export const TranslateAttachedTexts = () => {
  const { t } = useTranslation('text_management');
  const languageContext = useContext(LanguageContext);
  const { allTextsFromFile, defaultLanguageIndexFromFile } = useTranslationPage(languageContext.positionLanguage);
  const textsWithoutIndex = allTextsFromFile.slice(1);
  const [position, setPosition] = useState<number>(languageContext.positionLanguage);

  const getWantedText = (wanted: 'before' | 'after') => {
    // We use -2 for index cause we have to substract Index from allTextsFromFile too
    const beforeText = textsWithoutIndex[languageContext.positionLanguage - 2];
    if (wanted === 'before' && beforeText && beforeText.length > 1) {
      if (beforeText[defaultLanguageIndexFromFile.index] === '') {
        return t('waiting_tranlaste');
      }
      return beforeText[defaultLanguageIndexFromFile.index];
    }
    const afterText = textsWithoutIndex[languageContext.positionLanguage];
    if (wanted === 'after' && afterText && afterText.length > 1) {
      if (afterText[defaultLanguageIndexFromFile.index] === '') {
        return t('waiting_tranlaste');
      }
      return afterText[defaultLanguageIndexFromFile.index];
    }

    return t('no_text');
  };

  const beforeText = getWantedText('before');
  const afterText = getWantedText('after');

  useEffect(() => {
    setPosition(languageContext.positionLanguage);
  }, [languageContext.positionLanguage]);

  useEffect(() => {
    if (position === 0 && allTextsFromFile[languageContext.positionLanguage]) {
      setPosition(languageContext.positionLanguage);
    }
  }, [allTextsFromFile]);

  return (
    <DataTextWrapper>
      <StyledTextNavigationItem
        data-disabled={languageContext.positionLanguage > 1}
        align="start"
        onClick={languageContext.positionLanguage > 1 ? () => languageContext.setPositionLanguage(languageContext.positionLanguage - 1) : undefined}
      >
        <LeftIcon />
        <span>{beforeText.toString()}</span>
      </StyledTextNavigationItem>
      <StyledTextNavigationItem>
        <Input
          type="number"
          name="pagination-position"
          disabled={textsWithoutIndex.length === 0}
          min={textsWithoutIndex.length ? 1 : 0}
          max={allTextsFromFile.length - 1}
          value={!textsWithoutIndex.length ? 0 : position}
          onChange={(event) => {
            const value = Number(event.target.value);
            setPosition(value);
          }}
          onBlur={() => languageContext.setPositionLanguage(position >= 1 && position < allTextsFromFile.length ? position : 1)}
        />
        / {allTextsFromFile.length - 1}
      </StyledTextNavigationItem>
      <StyledTextNavigationItem
        data-disabled={languageContext.positionLanguage < allTextsFromFile.length - 1}
        align="end"
        onClick={
          languageContext.positionLanguage < allTextsFromFile.length - 1
            ? () => languageContext.setPositionLanguage(languageContext.positionLanguage + 1)
            : undefined
        }
      >
        <span>{afterText.toString()}</span>
        <RightIcon />
      </StyledTextNavigationItem>
    </DataTextWrapper>
  );
};
