import React from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardTemplate } from '@components/dashboard';
import { DashboardGameStartCinematic, DashboardGameStartSplashScreen, DashboardGameStartTitleScreen } from '@components/dashboard/gameStart';

export const DashboardGameStartPage = () => {
  const { t } = useTranslation('dashboard');
  return (
    <DashboardTemplate title={t('game_start')}>
      <DashboardGameStartSplashScreen />
      <DashboardGameStartCinematic />
      <DashboardGameStartTitleScreen />
    </DashboardTemplate>
  );
};
