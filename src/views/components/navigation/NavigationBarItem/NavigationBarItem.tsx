import React, { FunctionComponent, ReactChild } from 'react';
import { NavigationBarItemContainer } from './NavigationBarItemContainer';
import { StyledNavLink } from './StyledNavLink';

interface NavigationBarItemProps {
  path: string;
  children: ReactChild;
}

export const NavigationBarItem: FunctionComponent<NavigationBarItemProps> = (
  props: NavigationBarItemProps
) => {
  const { path, children } = props;
  return (
    <StyledNavLink to={path}>
      <NavigationBarItemContainer>{children}</NavigationBarItemContainer>
    </StyledNavLink>
  );
};
