import React from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardTemplate, DashboardSave } from '@components/dashboard';

export const DashboardSavePage = () => {
  const { t } = useTranslation();
  return (
    <DashboardTemplate title={t('dashboard_save')}>
      <DashboardSave />
    </DashboardTemplate>
  );
};
