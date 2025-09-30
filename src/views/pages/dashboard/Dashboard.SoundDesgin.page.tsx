import React from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardTemplate } from '@components/dashboard';
import { DashboardSoundDesign } from '@components/dashboard/music/DashboardSoundDesign';

export const DashboardSoundDesignPage = () => {
  const { t } = useTranslation();
  return (
    <DashboardTemplate title={t('sound_default')}>
      <DashboardSoundDesign />
    </DashboardTemplate>
  );
};
