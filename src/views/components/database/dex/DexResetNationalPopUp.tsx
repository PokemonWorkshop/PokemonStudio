import React from 'react';
import styled from 'styled-components';
import theme from '@src/AppTheme';
import { useTranslation } from 'react-i18next';

import { DeleteButton } from '@components/buttons';
import { DeletionContainer } from '@components/deletion/DeletionContainer';

const TitleContainer = styled.div`
  padding-top: 8px;

  & > h3 {
    ${theme.fonts.titlesHeadline6};
    margin: 0;
    line-height: 22px;
    text-align: center;
  }
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
`;

const CancelLink = styled.span`
  ${theme.fonts.normalMedium};
  color: ${theme.colors.text400};

  :hover {
    cursor: pointer;
  }
`;

type DexResetNationalPopUpProps = {
  onClickReset: () => void;
  onClose: () => void;
};

export const DexResetNationalPopUp = ({ onClickReset, onClose }: DexResetNationalPopUpProps) => {
  const { t } = useTranslation(['deletion', 'database_dex']);

  return (
    <DeletionContainer>
      <TitleContainer>
        <h3>{t('database_dex:reset_national_title')}</h3>
      </TitleContainer>
      <TextWarningContainer>
        <p>{t('database_dex:reset_national_warning_message')}</p>
        <p className="red">{t('deletion:action_irreversible')}</p>
      </TextWarningContainer>
      <ActionContainer>
        <CancelLink onClick={onClose}>{t('deletion:cancel')}</CancelLink>
        <DeleteButton onClick={onClickReset}>{t('database_dex:reset_national_action')}</DeleteButton>
      </ActionContainer>
    </DeletionContainer>
  );
};
