import React from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardTemplate, DashboardDevices } from '@components/dashboard';

export const DashboardDevicesPage = () => {
  const { t } = useTranslation('dashboard');
  return (
    <DashboardTemplate title={t('devices')}>
      <DashboardDevices />
    </DashboardTemplate>
  );
};
