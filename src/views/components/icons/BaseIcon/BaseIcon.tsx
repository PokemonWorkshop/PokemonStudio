import React from 'react';
import theme from '@src/AppTheme';
import SvgContainer from './SvgContainer';
import TopIcon from '@assets/icons/navigation/top-icon.svg';
import DashboardIcon from '@assets/icons/navigation/dashboard-icon.svg';
import UpdateIcon from '@assets/icons/navigation/update-icon.svg';
import Database from '@assets/icons/navigation/database-icon.svg';
import MapIcon from '@assets/icons/navigation/map-icon.svg';
import TextsIcon from '@assets/icons/global/texts-icon.svg';
import MapPaddedIcon from '@assets/icons/global/map-padded.svg';
import CodeIcon from '@assets/icons/navigation/code-icon.svg';
import HelpIcon from '@assets/icons/navigation/help-icon.svg';
import SettingsIcon from '@assets/icons/navigation/settings-icon.svg';
import AccountIcon from '@assets/icons/navigation/account-icon.svg';
import PocIcon from '@assets/icons/navigation/poc-icon.svg';
import PlusIcon from '@assets/icons/global/plus-icon.svg';
import DeleteIcon from '@assets/icons/global/delete-icon.svg';
import SaveIcon from '@assets/icons/navigation/save-icon.svg';
import EditIcon from '@assets/icons/global/edit-icon.svg';
import ClearIcon from '@assets/icons/global/clear-icon.svg';
import FolderIcon from '@assets/icons/global/folder.svg';
import NewFolderIcon from '@assets/icons/global/new-folder.svg';
import TuneIcon from '@assets/icons/global/tune.svg';
import MapLinkIcon from '@assets/icons/global/map-link.svg';

export type IconName =
  | 'top'
  | 'dashboard'
  | 'update'
  | 'update'
  | 'database'
  | 'map'
  | 'mapPadded'
  | 'texts'
  | 'code'
  | 'help'
  | 'settings'
  | 'account'
  | 'plus'
  | 'delete'
  | 'save'
  | 'edit'
  | 'clear'
  | 'folder'
  | 'newFolder'
  | 'poc'
  | 'tune'
  | 'mapLink';

const iconNameToIcon: Record<IconName, typeof TopIcon> = {
  top: TopIcon,
  dashboard: DashboardIcon,
  update: UpdateIcon,
  database: Database,
  map: MapIcon,
  mapPadded: MapPaddedIcon,
  texts: TextsIcon,
  code: CodeIcon,
  help: HelpIcon,
  settings: SettingsIcon,
  account: AccountIcon,
  plus: PlusIcon,
  delete: DeleteIcon,
  save: SaveIcon,
  edit: EditIcon,
  clear: ClearIcon,
  folder: FolderIcon,
  newFolder: NewFolderIcon,
  poc: PocIcon,
  tune: TuneIcon,
  mapLink: MapLinkIcon,
};

type Size = 's' | 'm' | 'l';
const sizeToPx: Record<Size, string> = {
  s: '20px',
  m: '24px',
  l: '32px',
};

interface IconProps {
  color: string;
  icon: IconName;
  size: Size;
  disabled?: boolean;
}

/**
 * Component rendering our svg icons
 * @param color the color
 * @param icon the icon name
 * @param size the size of the icon
 */
const BaseIcon = ({ color, icon, size, disabled }: IconProps) => {
  const Renderer = iconNameToIcon[icon];

  return (
    <SvgContainer size={sizeToPx[size]}>
      <Renderer color={disabled ? theme.colors.text700 : color} width="100%" />
    </SvgContainer>
  );
};

export { BaseIcon };
