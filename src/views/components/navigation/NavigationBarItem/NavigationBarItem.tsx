import React, { ReactNode, MouseEventHandler } from 'react';
import { NavigationBarItemContainer } from './NavigationBarItemContainer';
import { StyledNavLink } from './StyledNavLink';

interface NavigationBarItemProps {
  path: string;
  children?: ReactNode;
  disabled?: boolean;
  onMouseEnter?: MouseEventHandler;
  onMouseLeave?: MouseEventHandler;
}

export const NavigationBarItem = ({ path, children, disabled, onMouseEnter, onMouseLeave }: NavigationBarItemProps) => {
  return disabled ? (
    <NavigationBarItemContainer disabled={disabled} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {children}
    </NavigationBarItemContainer>
  ) : (
    <StyledNavLink to={path}>
      <NavigationBarItemContainer onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        {children}
      </NavigationBarItemContainer>
    </StyledNavLink>
  );
};
