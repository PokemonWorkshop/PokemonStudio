import React, { useState } from 'react';
import { Editor, useRefreshUI } from '@components/editor';

import { useTranslation } from 'react-i18next';
import { InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, Toggle } from '@components/inputs';

import QuestModel from '@modelEntities/quest/Quest.model';
import styled from 'styled-components';
import { SelectQuest } from '@components/selects';
import { useProjectQuests } from '@utils/useProjectData';
import { DarkButton, PrimaryButton } from '@components/buttons';

const EarningImportInfo = styled.div`
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text400};
  user-select: none;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0 0 0;
  gap: 8px;
`;

type QuestEarningImportEditorProps = {
  quest: QuestModel;
  onClose: () => void;
};

export const QuestEarningImportEditor = ({ quest, onClose }: QuestEarningImportEditorProps) => {
  const { projectDataValues: quests, setProjectDataValues: setQuest } = useProjectQuests();
  const firstDbSymbol = Object.entries(quests)
    .map(([value, questData]) => ({ value, index: questData.id }))
    .filter((d) => d.value !== quest.dbSymbol)
    .sort((a, b) => a.index - b.index)[0].value;
  const [selectedQuest, setSelectedQuest] = useState(firstDbSymbol);
  const { t } = useTranslation('database_quests');
  const [override, setOverride] = useState(false);
  const refreshUI = useRefreshUI();

  const onClickImport = () => {
    if (override) quest.earnings = quests[selectedQuest].clone().earnings;
    else quest.earnings.push(...quests[selectedQuest].clone().earnings);
    setQuest({ [quest.dbSymbol]: quest });
    onClose();
  };

  return (
    <Editor type="quest" title={t('import')}>
      <InputContainer size="m">
        <EarningImportInfo>{t('earning_import_info')}</EarningImportInfo>
        <InputWithTopLabelContainer>
          <Label htmlFor="quest">{t('import_earning_from')}</Label>
          <SelectQuest dbSymbol={selectedQuest} onChange={(selected) => setSelectedQuest(selected.value)} rejected={[quest.dbSymbol]} noLabel />
        </InputWithTopLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="override">{t('replace_earnings')}</Label>
          <Toggle name="override" checked={override} onChange={(event) => refreshUI(setOverride(event.target.checked))} />
        </InputWithLeftLabelContainer>
        <ButtonContainer>
          <PrimaryButton onClick={onClickImport}>{t('to_import')}</PrimaryButton>
          <DarkButton onClick={onClose}>{t('cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
};
