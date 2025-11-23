import React from 'react';
import { NavigationDatabaseItemStyle, StyledNavLink } from './NavigationDatabaseItemStyle';

interface NavigationDatabaseItemProps {
  path: string;
  label: string;
  activeForced?: boolean;
}

export const NavigationDatabaseItem = (props: NavigationDatabaseItemProps) => {
  const { path, label, activeForced } = props;
  return (
    <StyledNavLink to={path} data-active-forced={activeForced}>
      <NavigationDatabaseItemStyle>{label}</NavigationDatabaseItemStyle>
    </StyledNavLink>
  );
};
