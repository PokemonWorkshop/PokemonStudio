import { SecondaryButtonWithPlusIcon } from '@components/buttons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { ControlBar } from '@components/ControlBar';
import GroupModel from '@modelEntities/group/Group.model';
import { SelectGroup } from '@components/selects';

type GroupControlBarProps = {
  onChange: (selected: SelectOption) => void;
  group: GroupModel;
  onClickNewGroup: () => void;
};

export const GroupControlBar = ({ onChange, group, onClickNewGroup }: GroupControlBarProps) => {
  const { t } = useTranslation('database_groups');

  return (
    <ControlBar>
      <SecondaryButtonWithPlusIcon onClick={onClickNewGroup}>{t('new')}</SecondaryButtonWithPlusIcon>
      <SelectGroup dbSymbol={group.dbSymbol} onChange={onChange} />
    </ControlBar>
  );
};
