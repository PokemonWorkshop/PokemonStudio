import React from 'react';
import { NavigationDatabaseStyle } from '@components/database/navigation/NavigationDatabase/NavigationDatabaseStyle';
import { NavigationDatabaseGroup } from '@components/database/navigation/NavigationDatabaseGroup';
import { NavigationDatabaseItem } from '@components/database/navigation/NavigationDatabaseItem';
import { useTranslation } from 'react-i18next';

export const DashboardNavigation = () => {
  const { t } = useTranslation('dashboard');
  return (
    <NavigationDatabaseStyle>
      <NavigationDatabaseGroup title={t('general_settings')}>
        <NavigationDatabaseItem path="/dashboard/infos" label={t('infos')} />
        <NavigationDatabaseItem path="/dashboard/language" label={t('language')} />
        {/* <NavigationDatabaseItem path="/dashboard/settings" label={t('settings')} />
        <NavigationDatabaseItem path="/dashboard/texts" label={t('texts')} />
        <NavigationDatabaseItem path="/dashboard/options" label={t('options')} />
        <NavigationDatabaseItem path="/dashboard/devices" label={t('devices')} /> */}
      </NavigationDatabaseGroup>
    </NavigationDatabaseStyle>
  );
};
