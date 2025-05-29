import React from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardTemplate, DashboardCredits } from '@components/dashboard';

export const DashboardCreditsPage = () => {
  const { t } = useTranslation();
  return (
    <DashboardTemplate title={t('credits')}>
      <DashboardCredits />
    </DashboardTemplate>
  );
};
