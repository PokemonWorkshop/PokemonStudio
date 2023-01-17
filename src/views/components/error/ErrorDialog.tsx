import React from 'react';
import styled from 'styled-components';
import theme from '@src/AppTheme';
import { useTranslation } from 'react-i18next';
import { DeletionContainer } from '@components/deletion/DeletionContainer';
import { DarkButton, SecondaryButton } from '@components/buttons';
import { ReactComponent as ErrorIcon } from '@assets/icons/global/error.svg';
import { useOpenStudioLogsFolder } from '@utils/useOpenStudioLogsFolder';

const TitleWithIconContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  padding-top: 8px;

  & > h3 {
    ${theme.fonts.titlesHeadline6};
    margin: 0;
    line-height: 22px;
    text-align: center;
  }
`;

const ErrorIconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 100%;
  background-color: ${theme.colors.dangerSoft};
  color: ${theme.colors.dangerBase};
`;

const TextWarningContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  ${theme.fonts.normalMedium};
  color: ${theme.colors.text400};

  & > p {
    margin: 0;
    text-align: center;
  }

  .red {
    color: ${theme.colors.dangerBase};
  }
`;

const ActionContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-self: flex-end;
  align-items: center;
  gap: 16px;
  padding-top: 8px;

  ${DarkButton} {
    width: min-content;
  }
`;

type DeletionProps = {
  title: string;
  message: string;
  isLogsAvailable: boolean;
  onClose: () => void;
};

export const ErrorDialog = ({ title, message, isLogsAvailable, onClose }: DeletionProps) => {
  const { t } = useTranslation(['error']);
  const openStudioLogsFolder = useOpenStudioLogsFolder();

  const onClickLogs = async () => {
    openStudioLogsFolder(
      () => {},
      ({ errorMessage }) => console.log(errorMessage)
    );
  };

  return (
    <DeletionContainer>
      <TitleWithIconContainer>
        <ErrorIconContainer>
          <ErrorIcon />
        </ErrorIconContainer>
        <h3>{title}</h3>
      </TitleWithIconContainer>
      <TextWarningContainer>
        <p>{message}</p>
      </TextWarningContainer>
      <ActionContainer>
        {isLogsAvailable && <SecondaryButton onClick={onClickLogs}>{t('error:logs')}</SecondaryButton>}
        <DarkButton onClick={onClose}>{t('error:dismiss')}</DarkButton>
      </ActionContainer>
    </DeletionContainer>
  );
};
