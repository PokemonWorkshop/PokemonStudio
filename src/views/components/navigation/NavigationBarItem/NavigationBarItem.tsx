import React, { ReactNode } from 'react';
import { NavigationBarItemContainer } from './NavigationBarItemContainer';
import { StyledNavLink } from './StyledNavLink';

interface NavigationBarItemProps {
  path: string;
  children?: ReactNode;
  disabled?: boolean;
}

export const NavigationBarItem = ({ path, children, disabled }: NavigationBarItemProps) => {
  return disabled ? (
    <NavigationBarItemContainer disabled={disabled}>{children}</NavigationBarItemContainer>
  ) : (
    <StyledNavLink to={path}>
      <NavigationBarItemContainer>{children}</NavigationBarItemContainer>
    </StyledNavLink>
  );
};
