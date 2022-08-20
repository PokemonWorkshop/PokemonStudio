import React from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardTemplate, DashboardSettings } from '@components/dashboard';

export const DashboardSettingsPage = () => {
  const { t } = useTranslation('dashboard');
  return (
    <DashboardTemplate title={t('settings')}>
      <DashboardSettings />
    </DashboardTemplate>
  );
};
