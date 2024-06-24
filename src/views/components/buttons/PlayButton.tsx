import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { StyledNavLinkActionItem } from '@components/navigation/NavigationBarItem/StyledNavLink';
import { NavigationBarItemContainer } from '@components/navigation/NavigationBarItem/NavigationBarItemContainer';
import { ReactComponent as PlayIcon } from '@assets/icons/global/play.svg';
import { useGlobalState } from '@src/GlobalStateProvider';
import { useTranslation } from 'react-i18next';
import { StudioShortcutActions, useShortcut } from '@hooks/useShortcuts';

const PlayMenuButtonContainer = styled.div`
  position: fixed;
  left: 60px;
  width: 256px;
  z-index: 100;
  cursor: default;

  & .play-menu {
    width: 240px;
    margin-left: 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    box-sizing: border-box;
    padding: 8px;
    background-color: ${({ theme }) => theme.colors.dark20};
    border-radius: 8px;

    & span {
      display: flex;
      align-items: center;
      padding: 8px 16px 8px 16px;
      border-radius: 8px;
      ${({ theme }) => theme.fonts.normalRegular};
      color: ${({ theme }) => theme.colors.text400};
      user-select: none;
      cursor: pointer;

      &:hover {
        background-color: ${({ theme }) => theme.colors.dark22};
      }
    }
  }
`;

const PlayButtonContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;

  & span.triangle {
    position: absolute;
    display: inline-block;
    bottom: 8px;
    right: 4px;
    height: 0;
    width: 0;
    border-bottom: 4px solid ${({ theme }) => theme.colors.text600};
    border-left: 4px solid transparent;
  }

  &[data-disabled='true'] {
    & span.triangle {
      display: none;
    }
  }

  &.open,
  &.open:hover {
    ${NavigationBarItemContainer} {
      background-color: ${({ theme }) => theme.colors.dark18};

      &:active {
        background-color: ${({ theme }) => theme.colors.primarySoft};
      }
    }

    ${PlayMenuButtonContainer} {
      visibility: visible;
      transition: visibility 0s ease-in 300ms;
    }
  }

  ${PlayMenuButtonContainer} {
    visibility: hidden;
  }
`;

export const PlayButton = () => {
  const [state] = useGlobalState();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation('main_menu');

  const startPSDKAndCloseMenu = (startPSDK: (projectPath: string) => void) => {
    startPSDK(state.projectPath || '');
    setIsOpen(false);
  };

  const shortcutMap = useMemo<StudioShortcutActions>(() => {
    // No shortcut if an editor is opened
    const isShortcutEnabled = () => !document.querySelector('#dialogs')?.textContent;
    return {
      play: () => isShortcutEnabled() && startPSDKAndCloseMenu(window.api.startPSDKDebug),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.projectPath]);
  useShortcut(shortcutMap);

  return (
    <PlayButtonContainer className={isOpen ? 'open' : undefined} onMouseLeave={() => setIsOpen(false)}>
      <StyledNavLinkActionItem onMouseEnter={() => setIsOpen(true)}>
        <NavigationBarItemContainer onClick={() => startPSDKAndCloseMenu(window.api.startPSDKDebug)}>
          <PlayIcon />
          <span className="triangle" />
        </NavigationBarItemContainer>
      </StyledNavLinkActionItem>
      <PlayMenuButtonContainer>
        <div className="play-menu">
          <span onClick={() => startPSDKAndCloseMenu(window.api.startPSDK)}>{t('play_release_mode')}</span>
          <span onClick={() => startPSDKAndCloseMenu(window.api.startPSDKDebug)}>{t('play_debug_mode')}</span>
          {!state.projectStudio.isTiledMode && <span onClick={() => startPSDKAndCloseMenu(window.api.startPSDKTags)}>{t('play_tags_mode')}</span>}
          <span onClick={() => startPSDKAndCloseMenu(window.api.startPSDKWorldmap)}>{t('play_worldmap_mode')}</span>
        </div>
      </PlayMenuButtonContainer>
    </PlayButtonContainer>
  );
};
