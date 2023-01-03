import { useRefreshUI } from '@components/editor';
import { Editor } from '@components/editor/Editor';
import { InputContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectCustomSimple } from '@components/SelectCustom';
import { QUEST_EARNINGS, StudioQuest, StudioQuestEarningType } from '@modelEntities/quest';
import { createQuestEarning } from '@utils/entityCreation';
import { padStr } from '@utils/PadStr';
import React, { useMemo } from 'react';
import { TFunction, useTranslation } from 'react-i18next';
import { QuestEarningItem, QuestEarningMoney, QuestEarningPokemon } from './earnings';

const earningCategoryEntries = (t: TFunction<'database_quests'>) => QUEST_EARNINGS.map((earning) => ({ value: earning, label: t(earning) }));

type QuestEarningEditorProps = {
  quest: StudioQuest;
  earningIndex: number;
};

export const QuestEarningEditor = ({ quest, earningIndex }: QuestEarningEditorProps) => {
  const { t } = useTranslation('database_quests');
  const refreshUI = useRefreshUI();
  const earningOptions = useMemo(() => earningCategoryEntries(t), [t]);
  const earning = quest.earnings[earningIndex];

  const changeEarning = (value: StudioQuestEarningType) => {
    if (value === quest.earnings[earningIndex].earningMethodName) return;
    quest.earnings[earningIndex] = createQuestEarning(value);
  };

  return (
    <Editor type="edit" title={t('earning_title', { id: padStr(earningIndex + 1, 2) })}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="earning-type">{t('earning_type')}</Label>
          <SelectCustomSimple
            id={'earning-type-select'}
            value={earning.earningMethodName}
            options={earningOptions}
            onChange={(value) => refreshUI(changeEarning(value as StudioQuestEarningType))}
            noTooltip
          />
        </InputWithTopLabelContainer>
        {earning.earningMethodName === 'earning_money' && <QuestEarningMoney earning={earning} />}
        {earning.earningMethodName === 'earning_item' && <QuestEarningItem earning={earning} />}
        {earning.earningMethodName === 'earning_pokemon' && <QuestEarningPokemon earning={earning} />}
      </InputContainer>
    </Editor>
  );
};
