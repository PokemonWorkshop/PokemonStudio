import React, { useContext } from 'react';
import { ThemeContext } from 'styled-components';
import { NavigationBarItem } from '../NavigationBarItem';
import { NavigationBarGroupSeparator } from '../NavigationBarGroupSeparator';
import { BaseIcon } from '../../icons/BaseIcon';
import { NavigationBarContainer } from './NavigationBarContainer';
import { useGlobalState } from '../../../../GlobalStateProvider';
import { SaveProjectButton } from '@components/buttons/SaveProjectButton';
import { PlayButton } from '@components/buttons';

export const NavigationBarComponent = () => {
  const theme = useContext(ThemeContext);
  const [state] = useGlobalState();
  const needUpdate = state.projectData && state.currentPSDKVersion.int < state.lastPSDKVersion.int;

  return !state.projectData ? (
    <div />
  ) : (
    <NavigationBarContainer>
      <div id="navigation-bar-top">
        <NavigationBarItem path="/home">
          <BaseIcon color={theme.colors.navigationTopIconColor} size="m" icon="top" />
        </NavigationBarItem>

        <NavigationBarGroupSeparator />

        <NavigationBarItem path="/dashboard">
          <BaseIcon color={theme.colors.navigationIconColor} size="s" icon="dashboard" />
        </NavigationBarItem>
        <NavigationBarItem path="/psdkupdate">
          <BaseIcon color={needUpdate ? theme.colors.successBase : theme.colors.navigationIconColor} size="s" icon="update" />
        </NavigationBarItem>

        <NavigationBarGroupSeparator />

        <NavigationBarItem path="/database">
          <BaseIcon color={theme.colors.navigationIconColor} size="s" icon="database" />
        </NavigationBarItem>
        <NavigationBarItem path="/map">
          <BaseIcon color={theme.colors.navigationIconColor} size="s" icon="map" />
        </NavigationBarItem>
        <NavigationBarItem path="/code" disabled>
          <BaseIcon color={theme.colors.navigationIconColor} size="s" icon="code" disabled />
        </NavigationBarItem>
      </div>
      <div id="navigation-bar-bottom">
        <PlayButton />

        {/* <NavigationBarItem path="/help">
          <BaseIcon color={theme.colors.navigationIconColor} size="s" icon="help" />
        </NavigationBarItem>
        <NavigationBarItem path="/settings">
          <BaseIcon color={theme.colors.navigationIconColor} size="s" icon="settings" />
        </NavigationBarItem> */}

        <NavigationBarGroupSeparator />

        <SaveProjectButton />
        <NavigationBarItem path="/account" disabled>
          <BaseIcon color="" size="l" icon="account" />
        </NavigationBarItem>
      </div>
    </NavigationBarContainer>
  );
};
