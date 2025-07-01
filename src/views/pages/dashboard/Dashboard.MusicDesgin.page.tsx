import React from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardMusicDesign, DashboardTemplate } from '@components/dashboard';

export const DashboardMusicDesignPage = () => {
  const { t } = useTranslation();
  return (
    <DashboardTemplate title={t('music_default')}>
      <DashboardMusicDesign />
    </DashboardTemplate>
  );
};
