import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { NavigationDatabaseItemContainer } from './NavigationDatabaseItemContainer';
import { StyledNavLink } from './StyledNavLink';

interface NavigationDatabaseItemProps {
  path: string;
  text: string;
}

export const NavigationDatabaseItem: FunctionComponent<NavigationDatabaseItemProps> = (
  props: NavigationDatabaseItemProps
) => {
  const { path, text } = props;
  const { t } = useTranslation('submenu_database');
  return (
    <StyledNavLink to={path}>
      <NavigationDatabaseItemContainer>
        {t(text)}
      </NavigationDatabaseItemContainer>
    </StyledNavLink>
  );
};
