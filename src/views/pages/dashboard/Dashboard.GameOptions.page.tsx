import React from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardTemplate } from '@components/dashboard';
import { DashboardGameOptions } from '@components/dashboard/gameOptions';

export const DashboardGameOptionsPage = () => {
  const { t } = useTranslation('dashboard_game_options');
  return (
    <DashboardTemplate title={t('game_options')}>
      <DashboardGameOptions />
    </DashboardTemplate>
  );
};
