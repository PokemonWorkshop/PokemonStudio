import React from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardInfos, DashboardTemplate } from '@components/dashboard';

export const SettingsMapsPage = () => {
  const { t } = useTranslation('settings');
  return (
    <DashboardTemplate title={t('map_management')}>
      <div>Gestion des cartes</div>
    </DashboardTemplate>
  );
};
