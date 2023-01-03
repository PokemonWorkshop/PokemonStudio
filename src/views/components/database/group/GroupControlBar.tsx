import { SecondaryButtonWithPlusIcon } from '@components/buttons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SelectChangeEvent } from '@components/SelectCustom/SelectCustomPropsInterface';
import { ControlBar } from '@components/ControlBar';
import { SelectGroup } from '@components/selects';
import { StudioGroup } from '@modelEntities/group';

type GroupControlBarProps = {
  onChange: SelectChangeEvent;
  group: StudioGroup;
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
