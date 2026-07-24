import React from 'react';
import { NavigationDatabaseStyle } from '@components/database/navigation/NavigationDatabase/NavigationDatabaseStyle';
import { NavigationDatabaseGroup } from '@components/database/navigation/NavigationDatabaseGroup';
import { NavigationDatabaseItem } from '@components/database/navigation/NavigationDatabaseItem';
import { useTranslation } from 'react-i18next';

export const SettingsNavigation = () => {
  const { t } = useTranslation();
  return (
    <NavigationDatabaseStyle>
      <NavigationDatabaseGroup title={t('user_settings')}>
        <NavigationDatabaseItem path="/settings/language" label={t('language')} />
        <NavigationDatabaseItem path="/settings/sound" label={t('sound')} />
      </NavigationDatabaseGroup>
      <NavigationDatabaseGroup title={t('integrations')}>
        <NavigationDatabaseItem path="/settings/maps" label={t('map_management')} />
      </NavigationDatabaseGroup>
    </NavigationDatabaseStyle>
  );
};
