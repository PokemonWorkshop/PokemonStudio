import { SecondaryButtonWithPlusIcon } from '@components/buttons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SelectChangeEvent } from '@components/SelectCustom/SelectCustomPropsInterface';
import { ControlBar } from '@components/ControlBar';
import { SelectAbility } from '@components/selects';
import { StudioAbility } from '@modelEntities/ability';

type AbilityControlBarProps = {
  onChange: SelectChangeEvent;
  ability: StudioAbility;
  onClickNewAbility?: () => void;
};

export const AbilityControlBar = ({ onChange, ability, onClickNewAbility }: AbilityControlBarProps) => {
  const { t } = useTranslation('database_abilities');

  return (
    <ControlBar>
      {onClickNewAbility ? <SecondaryButtonWithPlusIcon onClick={onClickNewAbility}>{t('new')}</SecondaryButtonWithPlusIcon> : <div />}
      <SelectAbility dbSymbol={ability.dbSymbol} onChange={onChange} />
    </ControlBar>
  );
};
