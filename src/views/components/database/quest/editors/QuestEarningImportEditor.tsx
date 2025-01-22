import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { Editor } from '@components/editor';

import { useTranslation } from 'react-i18next';
import { InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, Toggle } from '@components/inputs';

import styled from 'styled-components';
import { SelectQuest } from '@components/selects';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { cloneEntity } from '@utils/cloneEntity';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useQuestPage } from '@src/hooks/usePage';
import { useUpdateQuest } from './useUpdateQuest';

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
  closeDialog: () => void;
};

export const QuestEarningImportEditor = forwardRef<EditorHandlingClose, QuestEarningImportEditorProps>(({ closeDialog }, ref) => {
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

    if (overrideRef.current.checked) updateQuest({ earnings: cloneEntity(quests[selectedQuest].earnings) });
    else updateQuest({ earnings: [...quest.earnings, ...cloneEntity(quests[selectedQuest].earnings)] });
    closeDialog();
  };

  return (
    <Editor type="quest" title={t('import')}>
      <InputContainer size="m">
        <EarningImportInfo>{t('earning_import_info')}</EarningImportInfo>
        <InputWithTopLabelContainer>
          <Label htmlFor="quest">{t('import_earning_from')}</Label>
          <SelectQuest
            dbSymbol={selectedQuest}
            onChange={(dbSymbol) => setSelectedQuest(dbSymbol)}
            filter={(dbSymbol) => dbSymbol !== quest.dbSymbol}
            noLabel
          />
        </InputWithTopLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="override">{t('replace_earnings')}</Label>
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
QuestEarningImportEditor.displayName = 'QuestEarningImportEditor';
