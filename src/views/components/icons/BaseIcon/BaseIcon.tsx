import React from 'react';
import theme from '@src/AppTheme';
import SvgContainer from './SvgContainer';
import { ReactComponent as TopIcon } from '../../../../../assets/icons/navigation/top-icon.svg';
import { ReactComponent as DashboardIcon } from '../../../../../assets/icons/navigation/dashboard-icon.svg';
import { ReactComponent as UpdateIcon } from '../../../../../assets/icons/navigation/update-icon.svg';
import { ReactComponent as Database } from '../../../../../assets/icons/navigation/database-icon.svg';
import { ReactComponent as MapIcon } from '../../../../../assets/icons/navigation/map-icon.svg';
import { ReactComponent as TextsIcon } from '../../../../../assets/icons/global/texts-icon.svg';
import { ReactComponent as MapPaddedIcon } from '../../../../../assets/icons/global/map-padded.svg';
import { ReactComponent as CodeIcon } from '../../../../../assets/icons/navigation/code-icon.svg';
import { ReactComponent as HelpIcon } from '../../../../../assets/icons/navigation/help-icon.svg';
import { ReactComponent as SettingsIcon } from '../../../../../assets/icons/navigation/settings-icon.svg';
import { ReactComponent as AccountIcon } from '../../../../../assets/icons/navigation/account-icon.svg';
import { ReactComponent as PlusIcon } from '../../../../../assets/icons/global/plus-icon.svg';
import { ReactComponent as DeleteIcon } from '../../../../../assets/icons/global/delete-icon.svg';
import { ReactComponent as SaveIcon } from '../../../../../assets/icons/navigation/save-icon.svg';
import { ReactComponent as EditIcon } from '../../../../../assets/icons/global/edit-icon.svg';
import { ReactComponent as ClearIcon } from '../../../../../assets/icons/global/clear-icon.svg';
import { ReactComponent as FolderIcon } from '../../../../../assets/icons/global/folder.svg';
import { ReactComponent as NewFolderIcon } from '../../../../../assets/icons/global/new-folder.svg';

type IconName =
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
  | 'newFolder';

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
