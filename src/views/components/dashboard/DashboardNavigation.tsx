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
        <NavigationDatabaseItem path="/dashboard/settings" label={t('settings')} />
        {/*<NavigationDatabaseItem path="/dashboard/texts" label={t('texts')} /> */}
        <NavigationDatabaseItem path="/dashboard/devices" label={t('devices')} />
      </NavigationDatabaseGroup>
      <NavigationDatabaseGroup title={t('appearance')}>
        <NavigationDatabaseItem path="/dashboard/display" label={t('display')} />
        <NavigationDatabaseItem path="/dashboard/graphics" label={t('graphic_settings')} />
      </NavigationDatabaseGroup>
      <NavigationDatabaseGroup title={t('config')}>
        <NavigationDatabaseItem path="/dashboard/gamestart" label={t('game_start')} />
        {/*<NavigationDatabaseItem path="/dashboard/options" label={t('options')} /> */}
        <NavigationDatabaseItem path="/dashboard/save" label={t('save')} />
        {/*<NavigationDatabaseItem path="/dashboard/game_credits" label={t('game_credits')} /> */}
      </NavigationDatabaseGroup>
    </NavigationDatabaseStyle>
  );
};
