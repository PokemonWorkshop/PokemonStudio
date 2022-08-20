import React from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardTemplate, DashboardSave } from '@components/dashboard';

export const DashboardSavePage = () => {
  const { t } = useTranslation('dashboard');
  return (
    <DashboardTemplate title={t('save')}>
      <DashboardSave />
    </DashboardTemplate>
  );
};
