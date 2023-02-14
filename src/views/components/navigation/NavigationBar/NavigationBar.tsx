import React from 'react';
import { useTheme } from 'styled-components';
import { NavigationBarItem } from '../NavigationBarItem';
import { NavigationBarGroupSeparator } from '../NavigationBarGroupSeparator';
import { BaseIcon } from '../../icons/BaseIcon';
import { NavigationBarContainer } from './NavigationBarContainer';
import { useGlobalState } from '../../../../GlobalStateProvider';
import { SaveProjectButton } from '@components/buttons/SaveProjectButton';
import { PlayButton } from '@components/buttons';
import { useTranslation } from 'react-i18next';
import { useToolTip } from '@utils/useToolTip';

export const NavigationBarComponent = () => {
  const theme = useTheme();
  const [state] = useGlobalState();
  const { t } = useTranslation('main_menu');
  const { buildOnMouseEnter, onMouseLeave, renderToolTip } = useToolTip();
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

        <NavigationBarItem path="/dashboard" onMouseLeave={onMouseLeave} onMouseEnter={buildOnMouseEnter(t('dashboard'), 'right-center', true)}>
          <BaseIcon color={theme.colors.navigationIconColor} size="s" icon="dashboard" />
        </NavigationBarItem>
        <NavigationBarItem path="/psdkupdate" onMouseLeave={onMouseLeave} onMouseEnter={buildOnMouseEnter(t('update'), 'right-center', true)}>
          <BaseIcon color={needUpdate ? theme.colors.successBase : theme.colors.navigationIconColor} size="s" icon="update" />
        </NavigationBarItem>

        <NavigationBarGroupSeparator />

        <NavigationBarItem path="/database" onMouseLeave={onMouseLeave} onMouseEnter={buildOnMouseEnter(t('database'), 'right-center', true)}>
          <BaseIcon color={theme.colors.navigationIconColor} size="s" icon="database" />
        </NavigationBarItem>
        <NavigationBarItem path="/map" onMouseLeave={onMouseLeave} onMouseEnter={buildOnMouseEnter(t('map'), 'right-center', true)}>
          <BaseIcon color={theme.colors.navigationIconColor} size="s" icon="map" />
        </NavigationBarItem>
        <NavigationBarItem
          path="/code"
          disabled
          onMouseLeave={onMouseLeave}
          onMouseEnter={buildOnMouseEnter(t('not_available_yet'), 'right-center', true)}
        >
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
        {renderToolTip()}
      </div>
    </NavigationBarContainer>
  );
};
