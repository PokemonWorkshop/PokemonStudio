import { NavigationDatabaseStyle } from '@components/database/navigation/NavigationDatabase/NavigationDatabaseStyle';
import { NavigationDatabaseGroup } from '@components/database/navigation/NavigationDatabaseGroup';
import { NavigationDatabaseItem } from '@components/database/navigation/NavigationDatabaseItem';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const SettingsNavigation = () => {
  const { t } = useTranslation();
  return (
    <NavigationDatabaseStyle>
      <NavigationDatabaseGroup title={t('user_settings')}>
        <NavigationDatabaseItem path="/settings/language" label={t('language')} />
      </NavigationDatabaseGroup>
      <NavigationDatabaseGroup title={t('app_settings')}>
        <NavigationDatabaseItem path="/settings/shortcuts" label={t('keyboard_shortcuts')} />
      </NavigationDatabaseGroup>
      <NavigationDatabaseGroup title={t('integrations')}>
        <NavigationDatabaseItem path="/settings/maps" label={t('map_management')} />
      </NavigationDatabaseGroup>
    </NavigationDatabaseStyle>
  );
};
