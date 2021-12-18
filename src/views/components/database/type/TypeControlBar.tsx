import { SecondaryButtonWithPlusIcon, SecondaryButton } from '@components/buttons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ControlBar, ControlBarLabelContainer } from '@components/ControlBar';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import TypeModel from '@modelEntities/type/Type.model';
import { SelectType } from '@components/selects';

type TypeControlBarProps = {
  onChange: (selected: SelectOption) => void;
  onClickNewType?: () => void;
  onClickTypeTable?: () => void;
  type: TypeModel;
};

export const TypeControlBar = ({ onChange, onClickNewType, type, onClickTypeTable }: TypeControlBarProps) => {
  const { t } = useTranslation('database_types');

  return (
    <ControlBar>
      <ControlBarLabelContainer>
        {onClickNewType && <SecondaryButtonWithPlusIcon onClick={onClickNewType}>{t('new')}</SecondaryButtonWithPlusIcon>}
        {onClickTypeTable && <SecondaryButton onClick={onClickTypeTable}>{t('type_table')}</SecondaryButton>}
      </ControlBarLabelContainer>
      <SelectType dbSymbol={type.dbSymbol} onChange={onChange} />
    </ControlBar>
  );
};
