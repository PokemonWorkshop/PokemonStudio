import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { NavigationDatabaseGroupSeparatorContainer } from './NavigationDatabaseGroupSeparatorContainer';

interface NavigationDatabaseGroupSeparatorProps {
  text: string;
}

export const NavigationDatabaseGroupSeparator: FunctionComponent<NavigationDatabaseGroupSeparatorProps> = (
  props: NavigationDatabaseGroupSeparatorProps
) => {
  const { t } = useTranslation('submenu_database');
  const { text } = props;
  return (
    <NavigationDatabaseGroupSeparatorContainer>
      {t(text)}
    </NavigationDatabaseGroupSeparatorContainer>
  );
};
