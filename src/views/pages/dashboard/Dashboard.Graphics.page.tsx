import React from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardTemplate, DashboardGraphics } from '@components/dashboard';

export const DashboardGraphicsPage = () => {
  const { t } = useTranslation('dashboard');
  return (
    <DashboardTemplate title={t('graphic_settings')}>
      <DashboardGraphics />
    </DashboardTemplate>
  );
};
