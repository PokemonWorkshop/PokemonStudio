import React from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardTemplate } from '@components/dashboard';
import { DashboardMusic } from '@components/dashboard/music/DashboardMusic';

export const DashboardMusicPage = () => {
  const { t } = useTranslation();
  return (
    <DashboardTemplate title={t('music_default')}>
      <DashboardMusic />
    </DashboardTemplate>
  );
};
