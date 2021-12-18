import React from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardInfos, DashboardTemplate } from '@components/dashboard';

export const DashboardInfosPage = () => {
  const { t } = useTranslation('dashboard');
  return (
    <DashboardTemplate title={t('infos')}>
      <DashboardInfos />
    </DashboardTemplate>
  );
};
