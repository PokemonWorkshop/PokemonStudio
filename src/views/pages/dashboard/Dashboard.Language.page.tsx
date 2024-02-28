import React from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLanguage, DashboardTemplate } from '@components/dashboard';

export const DashboardLanguagePage = () => {
  const { t } = useTranslation('dashboard');
  return (
    <DashboardTemplate title={t('language')}>
      <DashboardLanguage />
    </DashboardTemplate>
  );
};
