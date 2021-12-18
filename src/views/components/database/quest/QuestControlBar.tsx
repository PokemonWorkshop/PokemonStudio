import { SecondaryButtonWithPlusIcon } from '@components/buttons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { ControlBar } from '@components/ControlBar';
import QuestModel from '@modelEntities/quest/Quest.model';
import { SelectQuest } from '@components/selects';

type QuestControlBarProps = {
  onChange: (selected: SelectOption) => void;
  quest: QuestModel;
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
