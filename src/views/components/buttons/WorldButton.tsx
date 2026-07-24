import styled from 'styled-components';
import React, { MouseEventHandler, useEffect, useState } from 'react';
import theme from '@src/AppTheme';
import { BaseIcon } from '@components/icons/BaseIcon';
import { NavigationBarItemContainer } from '@components/navigation/NavigationBarItem/NavigationBarItemContainer';
import { StyledNavLink } from '@components/navigation/NavigationBarItem/StyledNavLink';
import { useCheckMapsModified } from '@hooks/useCheckMapsModified';
import { playSound } from '@utils/sound';

const WorldButtonContainer = styled(StyledNavLink)`
  ${NavigationBarItemContainer} {
    position: relative;
  }

  .badge {
    position: absolute;
    border-radius: 100%;
    background-color: ${theme.colors.warningBase};
    width: 8px;
    height: 8px;
    right: 6px;
    bottom: 6px;
  }
`;

type WorldButtonProps = {
  path: string;
  disabled?: boolean;
  onMouseEnter?: MouseEventHandler;
  onMouseLeave?: MouseEventHandler;
};

export const WorldButton = ({ path, disabled, onMouseEnter, onMouseLeave }: WorldButtonProps) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const { checkMaps, state } = useCheckMapsModified();

  useEffect(() => {
    setIsVisible(() => state.mapsModified.length !== 0);
  }, [state.mapsModified]);

  useEffect(() => {
    const listener = () => {
      checkMaps({ method: 'mtime' });
    };
    window.addEventListener('focus', listener);
    return () => window.removeEventListener('focus', listener);
  }, [checkMaps]);

  return (
    <WorldButtonContainer
      to={path}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      // World management is its own NavLink (not NavigationBarItem), so it needs
      // the same top-level-nav `page` cue wired here. Gate on aria-current so
      // re-clicking it while already on World stays silent.
      onClick={(event) => {
        if (event.currentTarget.getAttribute('aria-current') !== 'page') playSound('page');
      }}
    >
      <NavigationBarItemContainer disabled={disabled}>
        <BaseIcon color={theme.colors.navigationIconColor} size="s" icon="map" />
        {isVisible && <span className="badge" />}
      </NavigationBarItemContainer>
    </WorldButtonContainer>
  );
};
