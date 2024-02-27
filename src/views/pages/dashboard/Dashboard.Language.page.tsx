import React from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardTemplate } from '@components/dashboard';
import { DashboardLanguage } from '@components/dashboard/language/DashboardLanguage';

export const DashboardLanguagePage = () => {
  const { t } = useTranslation('dashboard');
  return (
    <DashboardTemplate title={t('language')}>
      <DashboardLanguage />
    </DashboardTemplate>
  );
};
