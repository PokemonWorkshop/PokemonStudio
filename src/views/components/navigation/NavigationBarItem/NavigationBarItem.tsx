import React, { ReactNode, MouseEventHandler } from 'react';
import { NavigationBarItemContainer } from './NavigationBarItemContainer';
import { StyledNavLink } from './StyledNavLink';
import { playSound } from '@utils/sound';

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
    <StyledNavLink
      to={path}
      // Moving between top-level sections (Database / Text / World / ...). Gate
      // on aria-current so re-clicking the section you're already on stays
      // silent -- NavLink marks the active link with aria-current="page".
      onClick={(event) => {
        if (event.currentTarget.getAttribute('aria-current') !== 'page') playSound('page');
      }}
    >
      <NavigationBarItemContainer onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        {children}
      </NavigationBarItemContainer>
    </StyledNavLink>
  );
};
