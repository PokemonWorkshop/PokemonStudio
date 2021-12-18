import React from 'react';
import { NavigationDatabaseItemStyle, StyledNavLink } from './NavigationDatabaseItemStyle';

interface NavigationDatabaseItemProps {
  path: string;
  label: string;
}

export const NavigationDatabaseItem = (props: NavigationDatabaseItemProps) => {
  const { path, label } = props;
  return (
    <StyledNavLink to={path}>
      <NavigationDatabaseItemStyle>{label}</NavigationDatabaseItemStyle>
    </StyledNavLink>
  );
};
