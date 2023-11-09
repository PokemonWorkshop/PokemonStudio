import React, { useEffect } from 'react';
import styled from 'styled-components';
import theme from '@src/AppTheme';
import { useTranslation } from 'react-i18next';
import { DeletionContainer } from './DeletionContainer';
import { DeleteButton } from '@components/buttons';
import { BaseIcon } from '@components/icons/BaseIcon';
import SvgContainer from '@components/icons/BaseIcon/SvgContainer';

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

const DeleteIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 100%;
  background-color: ${theme.colors.dangerSoft};
  color: ${theme.colors.dangerBase};

  ${SvgContainer} {
    align-items: center;
    justify-content: center;
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

type DeletionProps = {
  title: string;
  message: string;
  icon?: 'delete' | 'clear';
  onClickDelete: () => void;
  onClose: () => void;
};

export const Deletion = ({ title, message, icon, onClickDelete, onClose }: DeletionProps) => {
  const { t } = useTranslation('deletion');

  useEffect(() => {
    const deleteKeyListener = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        onClickDelete();
      }
    };
    window.addEventListener('keydown', DeleteKeyListener);

    return () => {
      window.removeEventListener('keydown', DeleteKeyListener);
    };
  }, []);

  return (
    <DeletionContainer>
      <TitleWithIconContainer>
        <DeleteIcon>
          <BaseIcon icon={icon || 'delete'} size="s" color={theme.colors.dangerBase} />
        </DeleteIcon>
        <h3>{title}</h3>
      </TitleWithIconContainer>
      <TextWarningContainer>
        <p>{message}</p>
        <p className="red">{t('action_irreversible')}</p>
      </TextWarningContainer>
      <ActionContainer>
        <CancelLink onClick={onClose}>{t('cancel')}</CancelLink>
        <DeleteButton onClick={onClickDelete}>{t(icon || 'delete')}</DeleteButton>
      </ActionContainer>
    </DeletionContainer>
  );
};
