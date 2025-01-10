import { DarkButton, PrimaryButton } from '@components/buttons';
import { Editor } from '@components/editor/Editor';
import { InputContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { QUEST_EARNINGS, StudioQuestEarningType } from '@modelEntities/quest';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { QuestEarningItem, QuestEarningMoney, QuestEarningPokemon } from './earnings';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useQuestPage } from '@src/hooks/usePage';
import { useUpdateQuest } from './useUpdateQuest';
import { Select } from '@ds/Select';
import { useEarningQuest } from './useEarningQuest';
import { cloneEntity } from '@utils/cloneEntity';
import { cleanNaNValue } from '@utils/cleanNaNValue';
import styled from 'styled-components';
import React, { forwardRef, useMemo } from 'react';
import { assertUnreachable } from '@utils/assertUnreachable';

const earningCategoryEntries = (t: TFunction<'database_quests'>) => QUEST_EARNINGS.map((earning) => ({ value: earning, label: t(earning) }));

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0 0 0;
  gap: 8px;
`;

type QuestNewEarningEditorProps = {
  closeDialog: () => void;
};

export const QuestNewEarningEditor = forwardRef<EditorHandlingClose, QuestNewEarningEditorProps>(({ closeDialog }, ref) => {
  const { t } = useTranslation('database_quests');
  const { quest } = useQuestPage();
  const updateQuest = useUpdateQuest(quest);
  const earningOptions = useMemo(() => earningCategoryEntries(t), [t]);
  const { earning, refs, updateEarning, checkIsValid, isValid } = useEarningQuest();
  const earningMethodName = earning.earningMethodName;

  useEditorHandlingClose(ref);

  const changeEarning = (value: StudioQuestEarningType) => {
    if (value === earning.earningMethodName) return;

    updateEarning(value);
  };

  const onClickNew = () => {
    if (!isValid) return;

    const newEarning = cloneEntity(earning);
    switch (earningMethodName) {
      case 'earning_money': {
        if (!refs.inputRef.current) return;

        newEarning.earningArgs[0] = cleanNaNValue(refs.inputRef.current.valueAsNumber, 100);
        break;
      }
      case 'earning_item': {
        if (!refs.entityRef.current || !refs.inputRef.current) return;

        newEarning.earningArgs[0] = refs.entityRef.current;
        newEarning.earningArgs[1] = cleanNaNValue(refs.inputRef.current.valueAsNumber, 1);
        break;
      }
      case 'earning_pokemon':
      case 'earning_egg': {
        if (!refs.entityRef.current) return;

        newEarning.earningArgs[0] = refs.entityRef.current;
        break;
      }
      default:
        assertUnreachable(earningMethodName);
    }
    updateQuest({ earnings: [...quest.earnings, newEarning] });
    closeDialog();
  };

  return (
    <Editor type="creation" title={t('earning')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="earning-method-name">{t('earning_type')}</Label>
          <Select name="earning-method-name" value={earning.earningMethodName} options={earningOptions} onChange={changeEarning} />
        </InputWithTopLabelContainer>
        {earningMethodName === 'earning_money' && <QuestEarningMoney earning={earning} refs={refs} checkIsValid={checkIsValid} />}
        {earningMethodName === 'earning_item' && <QuestEarningItem earning={earning} refs={refs} checkIsValid={checkIsValid} />}
        {earningMethodName === 'earning_pokemon' && <QuestEarningPokemon earning={earning} refs={refs} />}
        {earningMethodName === 'earning_egg' && <QuestEarningPokemon earning={earning} refs={refs} />}
        <ButtonContainer>
          <PrimaryButton onClick={onClickNew} disabled={!isValid}>
            {t('add_earning')}
          </PrimaryButton>
          <DarkButton onClick={closeDialog}>{t('cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
});
QuestNewEarningEditor.displayName = 'QuestNewEarningEditor';
