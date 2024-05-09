import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboardGameOptions } from './useDashboardGameOptions';
import { DashboardGameOptionsInactiveTableContainer } from './DashboardGameOptionsStyle';
import { SecondaryButton } from '@components/buttons';
import { TooltipWrapper } from '@ds/Tooltip';

export const DashboardGameOptionsInactive = () => {
  const { inactiveOptions, enableOption } = useDashboardGameOptions();
  const { t } = useTranslation('dashboard_game_options');

  return (
    <DashboardGameOptionsInactiveTableContainer>
      {inactiveOptions.length === 0 ? (
        <span className="empty-list">{t('no_inactive_option')}</span>
      ) : (
        inactiveOptions.map((option, index) => {
          const disabledLanguage = option === 'language';
          return (
            <div key={`inactive-option-${index}`} className="game-option">
              <span className="name">{t(option)}</span>
              <TooltipWrapper data-tooltip={disabledLanguage ? t('language_message') : undefined}>
                <SecondaryButton onClick={() => enableOption(option)} disabled={disabledLanguage}>
                  {t('enable')}
                </SecondaryButton>
              </TooltipWrapper>
            </div>
          );
        })
      )}
    </DashboardGameOptionsInactiveTableContainer>
  );
};
