import React, { useEffect } from 'react';
import styled from 'styled-components';
import theme from '@src/AppTheme';
import { useTranslation } from 'react-i18next';
import { DeleteButton } from '@components/buttons';
import { BaseIcon } from '@components/icons/BaseIcon';
import {
  MessageBoxActionContainer,
  MessageBoxCancelLink,
  MessageBoxContainer,
  MessageBoxIconContainer,
  MessageBoxTextContainer,
  MessageBoxTitleIconContainer,
} from '@components/MessageBoxContainer';

const DeletionContainer = styled(MessageBoxContainer)`
  ${MessageBoxIconContainer} {
    background-color: ${theme.colors.dangerSoft};
    color: ${theme.colors.dangerBase};
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
    window.addEventListener('keydown', deleteKeyListener);

    return () => {
      window.removeEventListener('keydown', deleteKeyListener);
    };
  }, []);

  return (
    <DeletionContainer>
      <MessageBoxTitleIconContainer>
        <MessageBoxIconContainer>
          <BaseIcon icon={icon || 'delete'} size="s" color={theme.colors.dangerBase} />
        </MessageBoxIconContainer>
        <h3>{title}</h3>
      </MessageBoxTitleIconContainer>
      <MessageBoxTextContainer>
        <p>{message}</p>
        <p className="red">{t('action_irreversible')}</p>
      </MessageBoxTextContainer>
      <MessageBoxActionContainer>
        <MessageBoxCancelLink onClick={onClose}>{t('cancel')}</MessageBoxCancelLink>
        <DeleteButton onClick={onClickDelete}>{t(icon || 'delete')}</DeleteButton>
      </MessageBoxActionContainer>
    </DeletionContainer>
  );
};
