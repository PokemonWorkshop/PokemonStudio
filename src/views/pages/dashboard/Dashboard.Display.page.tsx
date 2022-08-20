import React from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardTemplate, DashboardDisplay } from '@components/dashboard';

export const DashboardDisplayPage = () => {
  const { t } = useTranslation('dashboard');
  return (
    <DashboardTemplate title={t('display')}>
      <DashboardDisplay />
    </DashboardTemplate>
  );
};
