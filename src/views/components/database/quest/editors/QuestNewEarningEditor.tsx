import { DarkButton, PrimaryButton } from '@components/buttons';
import { useRefreshUI } from '@components/editor';
import { Editor } from '@components/editor/Editor';
import { InputContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectCustomSimple } from '@components/SelectCustom';
import { QUEST_EARNINGS, StudioQuest, StudioQuestEarningType } from '@modelEntities/quest';
import { createQuestEarning } from '@utils/entityCreation';
import { useProjectQuests } from '@hooks/useProjectData';
import React, { useMemo, useState } from 'react';
import { TFunction, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { QuestEarningItem, QuestEarningMoney, QuestEarningPokemon } from './earnings';

const earningCategoryEntries = (t: TFunction<'database_quests'>) => QUEST_EARNINGS.map((earning) => ({ value: earning, label: t(earning) }));

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0 0 0;
  gap: 8px;
`;

type QuestNewEarningEditorProps = {
  quest: StudioQuest;
  onClose: () => void;
};

export const QuestNewEarningEditor = ({ quest, onClose }: QuestNewEarningEditorProps) => {
  const { t } = useTranslation('database_quests');
  const refreshUI = useRefreshUI();
  const earningOptions = useMemo(() => earningCategoryEntries(t), [t]);
  const [newEarning, setNewEarning] = useState(createQuestEarning('earning_money'));
  const { setProjectDataValues: setQuest } = useProjectQuests();

  const changeEarning = (value: StudioQuestEarningType) => {
    if (value === newEarning.earningMethodName) return;
    setNewEarning(createQuestEarning(value));
  };

  const onClickNew = () => {
    quest.earnings.push(newEarning);
    setQuest({ [quest.dbSymbol]: quest });
    onClose();
  };

  return (
    <Editor type="creation" title={t('earning')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="earning-type">{t('earning_type')}</Label>
          <SelectCustomSimple
            id={'earning-type-select'}
            value={newEarning.earningMethodName}
            options={earningOptions}
            onChange={(value) => refreshUI(changeEarning(value as StudioQuestEarningType))}
            noTooltip
          />
        </InputWithTopLabelContainer>
        {newEarning.earningMethodName === 'earning_money' && <QuestEarningMoney earning={newEarning} />}
        {newEarning.earningMethodName === 'earning_item' && <QuestEarningItem earning={newEarning} />}
        {newEarning.earningMethodName === 'earning_pokemon' && <QuestEarningPokemon earning={newEarning} />}
        {newEarning.earningMethodName === 'earning_egg' && <QuestEarningPokemon earning={newEarning} />}
        <ButtonContainer>
          <PrimaryButton onClick={onClickNew}>{t('add_earning')}</PrimaryButton>
          <DarkButton onClick={onClose}>{t('cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
};
