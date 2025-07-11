import React, { FunctionComponent } from 'react';
import Styled from 'styled-components';

import TopIcon from '@assets/icons/navigation/top-icon.svg';
import DashboardIcon from '@assets/icons/navigation/dashboard-icon.svg';
import UpdateIcon from '@assets/icons/navigation/update-icon.svg';
import Database from '@assets/icons/navigation/database-icon.svg';
import MapIcon from '@assets/icons/navigation/map-icon.svg';
import CodeIcon from '@assets/icons/navigation/code-icon.svg';
import HelpIcon from '@assets/icons/navigation/help-icon.svg';
import SettingsIcon from '@assets/icons/navigation/settings-icon.svg';
import AccountIcon from '@assets/icons/navigation/account-icon.svg';

type IconName = 'top' | 'dashboard' | 'update' | 'update' | 'database' | 'map' | 'code' | 'help' | 'settings' | 'account';
const iconNameToIcon: Record<IconName, React.FunctionComponent> = {
  top: TopIcon,
  dashboard: DashboardIcon,
  update: UpdateIcon,
  database: Database,
  map: MapIcon,
  code: CodeIcon,
  help: HelpIcon,
  settings: SettingsIcon,
  account: AccountIcon,
};

type Size = 's' | 'm';
const sizeToPx: Record<Size, string> = {
  s: '20px',
  m: '32px',
};

interface IconProps {
  color: string;
  icon: IconName;
  size: Size;
}

/**
 * Styled component used for setting the size of the inline svgs
 * @param size px size of the div
 */
const SvgContainer = Styled.div<{ size: string }>`
  display: flex;
  width: ${(props) => props.size};
  height: ${(props) => props.size};
  `;

/**
 * Component rendering our svg icons
 * @param color the color
 * @param icon the icon name
 * @param size the size of the icon
 */
const IconComponent: FunctionComponent<IconProps> = (iconProps) => {
  const { color, icon, size } = iconProps;
  const Renderer: React.FunctionComponent<React.SVGProps<SVGSVGElement>> = iconNameToIcon[icon];

  if (Renderer === undefined) return <div />;
  return (
    <SvgContainer size={sizeToPx[size]}>
      <Renderer color={color} width="100%" />
    </SvgContainer>
  );
};

export default IconComponent;
