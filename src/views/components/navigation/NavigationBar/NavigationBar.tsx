import React, { FunctionComponent, useContext } from 'react';
import { ThemeContext } from 'styled-components';
import { NavigationBarItem } from '../NavigationBarItem';
import { NavigationBarGroupSeparator } from '../NavigationBarGroupSeparator';
import { BaseIcon } from '../../icons/BaseIcon';
import { NavigationBarContainer } from './NavigationBarContainer';
import { useGlobalState } from '../../../../GlobalStateProvider';

export const NavigationBarComponent: FunctionComponent = () => {
  const theme = useContext(ThemeContext);
  const [state] = useGlobalState();

  return !state.projectData ? (
    <div />
  ) : (
    <NavigationBarContainer>
      <div id="navigation-bar-top">
        <NavigationBarItem path="/home">
          <BaseIcon
            color={theme.colors.navigationTopIconColor}
            size="s"
            icon="top"
          />
        </NavigationBarItem>

        <NavigationBarGroupSeparator />

        <NavigationBarItem path="/dashboard">
          <BaseIcon
            color={theme.colors.navigationIconColor}
            size="s"
            icon="dashboard"
          />
        </NavigationBarItem>
        <NavigationBarItem path="/update">
          <BaseIcon
            color={theme.colors.navigationIconColor}
            size="s"
            icon="update"
          />
        </NavigationBarItem>

        <NavigationBarGroupSeparator />

        <NavigationBarItem path="/database">
          <BaseIcon
            color={theme.colors.navigationIconColor}
            size="s"
            icon="database"
          />
        </NavigationBarItem>
        <NavigationBarItem path="/map">
          <BaseIcon
            color={theme.colors.navigationIconColor}
            size="s"
            icon="map"
          />
        </NavigationBarItem>
        <NavigationBarItem path="/code">
          <BaseIcon
            color={theme.colors.navigationIconColor}
            size="s"
            icon="code"
          />
        </NavigationBarItem>
      </div>
      <div id="navigation-bar-bottom">
        <NavigationBarItem path="/help">
          <BaseIcon
            color={theme.colors.navigationIconColor}
            size="s"
            icon="help"
          />
        </NavigationBarItem>
        <NavigationBarItem path="/settings">
          <BaseIcon
            color={theme.colors.navigationIconColor}
            size="s"
            icon="settings"
          />
        </NavigationBarItem>

        <NavigationBarGroupSeparator />

        <NavigationBarItem path="/account">
          <BaseIcon color="" size="m" icon="account" />
        </NavigationBarItem>
      </div>
    </NavigationBarContainer>
  );
};
