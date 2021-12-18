import { SecondaryButtonWithPlusIcon } from '@components/buttons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { ControlBar } from '@components/ControlBar';
import AbilityModel from '@modelEntities/ability/Ability.model';
import { SelectAbility } from '@components/selects';

type AbilityControlBarProps = {
  onChange: (selected: SelectOption) => void;
  ability: AbilityModel;
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
