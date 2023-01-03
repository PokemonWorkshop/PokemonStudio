import { SecondaryButtonWithPlusIcon } from '@components/buttons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SelectChangeEvent } from '@components/SelectCustom/SelectCustomPropsInterface';
import { ControlBar } from '@components/ControlBar';
import { SelectQuest } from '@components/selects';
import { StudioQuest } from '@modelEntities/quest';

type QuestControlBarProps = {
  onChange: SelectChangeEvent;
  quest: StudioQuest;
  onClickNewQuest: () => void;
};

export const QuestControlBar = ({ onChange, quest, onClickNewQuest }: QuestControlBarProps) => {
  const { t } = useTranslation('database_quests');

  return (
    <ControlBar>
      <SecondaryButtonWithPlusIcon onClick={onClickNewQuest}>{t('new')}</SecondaryButtonWithPlusIcon>
      <SelectQuest dbSymbol={quest.dbSymbol} onChange={onChange} />
    </ControlBar>
  );
};
