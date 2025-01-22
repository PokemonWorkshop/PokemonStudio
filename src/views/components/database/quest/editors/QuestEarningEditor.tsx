import { Editor } from '@components/editor/Editor';
import { InputContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { QUEST_EARNINGS, StudioQuestEarningType } from '@modelEntities/quest';
import { padStr } from '@utils/PadStr';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { QuestEarningItem, QuestEarningMoney, QuestEarningPokemon } from './earnings';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useQuestPage } from '@src/hooks/usePage';
import { useUpdateQuest } from './useUpdateQuest';
import { useEarningQuest } from './useEarningQuest';
import { cloneEntity } from '@utils/cloneEntity';
import { assertUnreachable } from '@utils/assertUnreachable';
import { cleanNaNValue } from '@utils/cleanNaNValue';
import { Select } from '@ds/Select';
import React, { forwardRef, useMemo } from 'react';

const earningCategoryEntries = (t: TFunction<'database_quests'>) => QUEST_EARNINGS.map((earning) => ({ value: earning, label: t(earning) }));

type QuestEarningEditorProps = {
  earningIndex: number;
};

export const QuestEarningEditor = forwardRef<EditorHandlingClose, QuestEarningEditorProps>(({ earningIndex }, ref) => {
  const { t } = useTranslation('database_quests');
  const { quest } = useQuestPage();
  const updateQuest = useUpdateQuest(quest);
  const { earning, refs, updateEarning, checkIsValid } = useEarningQuest(quest.earnings[earningIndex]);
  const earningOptions = useMemo(() => earningCategoryEntries(t), [t]);
  const earningMethodName = earning.earningMethodName;

  const changeEarning = (value: StudioQuestEarningType) => {
    if (value === earningMethodName) return;

    updateEarning(value);
  };

  const canClose = () => checkIsValid();

  const onClose = () => {
    if (!canClose()) return;

    const newEarning = cloneEntity(earning);
    const oldEarning = quest.earnings[earningIndex];
    const isSameMethodName = newEarning.earningMethodName === oldEarning.earningMethodName;
    switch (earningMethodName) {
      case 'earning_money': {
        if (!refs.inputRef.current) return;

        const backupValue = isSameMethodName ? (oldEarning.earningArgs[0] as number) : 100;
        newEarning.earningArgs[0] = cleanNaNValue(refs.inputRef.current.valueAsNumber, backupValue);
        break;
      }
      case 'earning_item': {
        if (!refs.entityRef.current || !refs.inputRef.current) return;

        const backupValue = isSameMethodName ? (oldEarning.earningArgs[1] as number) : 1;
        newEarning.earningArgs[0] = refs.entityRef.current;
        newEarning.earningArgs[1] = cleanNaNValue(refs.inputRef.current.valueAsNumber, backupValue);
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
    const updatedEarnings = cloneEntity(quest.earnings);
    updatedEarnings[earningIndex] = cloneEntity(newEarning);
    updateQuest({ earnings: updatedEarnings });
  };

  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <Editor type="edit" title={t('earning_title', { id: padStr(earningIndex + 1, 2) })}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="earning-method-name">{t('earning_type')}</Label>
          <Select name="earning-method-name" value={earning.earningMethodName} options={earningOptions} onChange={changeEarning} />
        </InputWithTopLabelContainer>
        {earningMethodName === 'earning_money' && <QuestEarningMoney earning={earning} refs={refs} />}
        {earningMethodName === 'earning_item' && <QuestEarningItem earning={earning} refs={refs} />}
        {earningMethodName === 'earning_pokemon' && <QuestEarningPokemon earning={earning} refs={refs} />}
        {earningMethodName === 'earning_egg' && <QuestEarningPokemon earning={earning} refs={refs} />}
      </InputContainer>
    </Editor>
  );
});
QuestEarningEditor.displayName = 'QuestEarningEditor';
