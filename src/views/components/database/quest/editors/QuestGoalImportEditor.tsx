import { Editor } from '@components/editor';
import { useTranslation } from 'react-i18next';
import { InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, Toggle } from '@components/inputs';
import { SelectQuest } from '@components/selects';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { cloneEntity } from '@utils/cloneEntity';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useQuestPage } from '@src/hooks/usePage';
import { useUpdateQuest } from './useUpdateQuest';
import styled from 'styled-components';
import React, { forwardRef, useMemo, useRef, useState } from 'react';

const GoalImportInfo = styled.div`
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

type QuestGoalImportEditorProps = {
  closeDialog: () => void;
};

export const QuestGoalImportEditor = forwardRef<EditorHandlingClose, QuestGoalImportEditorProps>(({ closeDialog }, ref) => {
  const { t } = useTranslation('database_quests');
  const { quests, quest } = useQuestPage();
  const updateQuest = useUpdateQuest(quest);
  const firstDbSymbol = useMemo(
    () =>
      Object.entries(quests)
        .map(([value, questData]) => ({ value, index: questData.id }))
        .filter((d) => d.value !== quest.dbSymbol)
        .sort((a, b) => a.index - b.index)[0].value,
    [quests, quest]
  );
  const [selectedQuest, setSelectedQuest] = useState(firstDbSymbol);
  const overrideRef = useRef<HTMLInputElement>(null);

  useEditorHandlingClose(ref);

  const onClickImport = () => {
    if (!overrideRef.current) return;

    if (overrideRef.current.checked) updateQuest({ objectives: cloneEntity(quests[selectedQuest].objectives) });
    else updateQuest({ objectives: [...quest.objectives, ...cloneEntity(quests[selectedQuest].objectives)] });
    closeDialog();
  };

  return (
    <Editor type="quest" title={t('import')}>
      <InputContainer size="m">
        <GoalImportInfo>{t('goal_import_info')}</GoalImportInfo>
        <InputWithTopLabelContainer>
          <Label htmlFor="quest">{t('import_goal_from')}</Label>
          <SelectQuest
            dbSymbol={selectedQuest}
            onChange={(dbSymbol) => setSelectedQuest(dbSymbol)}
            filter={(dbSymbol) => dbSymbol !== quest.dbSymbol}
            noLabel
          />
        </InputWithTopLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="override">{t('replace_goals')}</Label>
          <Toggle name="override" ref={overrideRef} />
        </InputWithLeftLabelContainer>
        <ButtonContainer>
          <PrimaryButton onClick={onClickImport}>{t('to_import')}</PrimaryButton>
          <DarkButton onClick={closeDialog}>{t('cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
});
QuestGoalImportEditor.displayName = 'QuestGoalImportEditor';
