import { SecondaryButtonWithPlusIcon, SecondaryButton } from '@components/buttons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ControlBar, ControlBarLabelContainer } from '@components/ControlBar';
import { SelectChangeEvent } from '@components/SelectCustom/SelectCustomPropsInterface';
import { SelectType } from '@components/selects';
import { StudioType } from '@modelEntities/type';
import { useSetCurrentDatabasePath } from '@utils/useSetCurrentDatabasePage';

type TypeControlBarProps = {
  onChange: SelectChangeEvent;
  onClickNewType?: () => void;
  onClickTypeTable?: () => void;
  type: StudioType;
};

export const TypeControlBar = ({ onChange, onClickNewType, type, onClickTypeTable }: TypeControlBarProps) => {
  const { t } = useTranslation('database_types');
  useSetCurrentDatabasePath();

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
