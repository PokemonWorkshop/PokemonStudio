import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboardGameOptions } from './useDashboardGameOptions';
import { DashboardGameOptionsTableContainer, RenderOptionContainer } from './DashboardGameOptionsStyle';
import { SecondaryButton } from '@components/buttons';
import { TooltipWrapper } from '@ds/Tooltip';

export const DashboardGameOptionsInactive = () => {
  const { inactiveOptions, enableOption } = useDashboardGameOptions();
  const { t } = useTranslation('dashboard_game_options');

  return (
    <DashboardGameOptionsTableContainer>
      {inactiveOptions.length === 0 ? (
        <span className="empty-list">{t('no_inactive_option')}</span>
      ) : (
        inactiveOptions.map((option, index) => {
          const disabledLanguage = option === 'language';
          return (
            <RenderOptionContainer key={`inactive-option-${index}`}>
              <span className="name">{t(option)}</span>
              <TooltipWrapper data-tooltip={disabledLanguage ? t('language_message') : undefined}>
                <SecondaryButton onClick={() => enableOption(option)} disabled={disabledLanguage}>
                  {t('enable')}
                </SecondaryButton>
              </TooltipWrapper>
            </RenderOptionContainer>
          );
        })
      )}
    </DashboardGameOptionsTableContainer>
  );
};
