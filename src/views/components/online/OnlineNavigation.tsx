import React from 'react';
import { NavigationDatabaseStyle } from '@components/database/navigation/NavigationDatabase/NavigationDatabaseStyle';
import { NavigationDatabaseGroup } from '@components/database/navigation/NavigationDatabaseGroup';
import { NavigationDatabaseItem } from '@components/database/navigation/NavigationDatabaseItem';
import { useTranslation } from 'react-i18next';

export const OnlineNavigation = () => {
  const { t } = useTranslation();
  return (
    <NavigationDatabaseStyle>
      <NavigationDatabaseGroup title={t('online_section_management')}>
        <NavigationDatabaseItem path="/online/mystery-gift" label={t('online_mystery_gift')} />
      </NavigationDatabaseGroup>
      <NavigationDatabaseGroup title={t('online_section_configuration')}>
        <NavigationDatabaseItem path="/online/settings" label={t('online_settings')} />
      </NavigationDatabaseGroup>
    </NavigationDatabaseStyle>
  );
};
