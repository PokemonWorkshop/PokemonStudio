import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { EditorOverlayContainer } from '@components/editor';
import {
  MessageBoxActionContainer,
  MessageBoxCancelLink,
  MessageBoxContainer,
  MessageBoxIconContainer,
  MessageBoxTextContainer,
  MessageBoxTitleIconContainer,
} from '@components/MessageBoxContainer';
import { PrimaryButton, SecondaryButton } from '@components/buttons';
import { BaseIcon } from '@components/icons/BaseIcon';
import theme from '@src/AppTheme';

const RMXP_MIGRATION_GUIDE_URLS: Record<string, string> = {
  fr: 'https://pokemonworkshop.com/fr/learn/migrating-from-rpg-maker-xp-to-tiled',
  en: 'https://pokemonworkshop.com/en/learn/migrating-from-rpg-maker-xp-to-tiled',
};

const getRmxpMigrationGuideUrl = (language: string) => RMXP_MIGRATION_GUIDE_URLS[language] ?? RMXP_MIGRATION_GUIDE_URLS['en'];

const OverlayContainer = styled(EditorOverlayContainer)`
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 8001;
`;

type RmxpMigrationDialogProps = {
  onContinue: () => void;
  closeDialog: () => void;
};

export const RmxpMigrationDialog = ({ onContinue, closeDialog }: RmxpMigrationDialogProps) => {
  const { t, i18n } = useTranslation();

  return (
    <OverlayContainer className="active">
      <MessageBoxContainer>
        <MessageBoxTitleIconContainer>
          <MessageBoxIconContainer>
            <BaseIcon icon="map" size="m" color={theme.colors.primaryBase} />
          </MessageBoxIconContainer>
          <h3 style={{ color: theme.colors.text100 }}>{t('rmxp_migration_dialog_title')}</h3>
        </MessageBoxTitleIconContainer>
        <MessageBoxTextContainer>
          <p>{t('rmxp_migration_dialog_text')}</p>
          <br />
          <p style={{ color: theme.colors.dangerBase }}>{t('rmxp_migration_dialog_danger')}</p>
        </MessageBoxTextContainer>
        <MessageBoxActionContainer>
          <MessageBoxCancelLink style={{ width: 'auto' }} onClick={() => closeDialog()}>
            {t('close')}
          </MessageBoxCancelLink>
          <PrimaryButton style={{ width: 'auto' }} onClick={() => window.api.externalWindow(getRmxpMigrationGuideUrl(i18n.language))}>
            {t('rmxp_migration_dialog_learn_more')}
          </PrimaryButton>
          <SecondaryButton
            style={{ width: 'auto' }}
            onClick={() => {
              closeDialog();
              onContinue();
            }}
          >
            {t('button_use_tiled')}
          </SecondaryButton>
        </MessageBoxActionContainer>
      </MessageBoxContainer>
    </OverlayContainer>
  );
};
