import React from 'react';
import { useLocation } from 'react-router-dom';
import { playSound } from '@utils/sound';
import { NavigationDatabaseItemStyle, StyledNavLink } from './NavigationDatabaseItemStyle';

interface NavigationDatabaseItemProps {
  path: string;
  label: string;
  activeForced?: boolean;
}

export const NavigationDatabaseItem = (props: NavigationDatabaseItemProps) => {
  const { path, label, activeForced } = props;
  const location = useLocation();

  // Outcome, not input: only fires when this switches the active database
  // section, not when re-clicking the section already open (including a
  // detail route nested under it, e.g. /database/pokemon/some-dbSymbol).
  const onClick = () => {
    if (!location.pathname.startsWith(path)) playSound('whisper');
  };

  return (
    <StyledNavLink to={path} data-active-forced={activeForced} onClick={onClick}>
      <NavigationDatabaseItemStyle>{label}</NavigationDatabaseItemStyle>
    </StyledNavLink>
  );
};
