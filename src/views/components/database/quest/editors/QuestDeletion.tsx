import React, { forwardRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Deletion } from '@components/deletion';
import { useProjectQuests } from '@hooks/useProjectData';
import { getEntityNameText } from '@utils/ReadingProjectText';
import { useUpdateQuest } from './useUpdateQuest';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';

type QuestDeletionProps = {
  type: 'quest' | 'goals' | 'earnings';
  closeDialog: () => void;
};

export const QuestDeletion = forwardRef<EditorHandlingClose, QuestDeletionProps>(({ type, closeDialog }, ref) => {
  const { projectDataValues: quests, selectedDataIdentifier: questDbSymbol, removeProjectDataValue: deleteQuest, state } = useProjectQuests();
  const { t } = useTranslation('database_quests');
  const quest = quests[questDbSymbol];
  const updateQuest = useUpdateQuest(quest);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const questName = useMemo(() => getEntityNameText(quest, state).replaceAll(' ', '\u00a0'), []);

  const onClickDelete = () => {
    if (type === 'quest') {
      const firstDbSymbol = Object.entries(quests)
        .map(([value, questData]) => ({ value, index: questData.id }))
        .filter((d) => d.value !== questDbSymbol)
        .sort((a, b) => a.index - b.index)[0].value;
      deleteQuest(questDbSymbol, { quest: firstDbSymbol });
    } else if (type === 'goals') {
      updateQuest({ objectives: [] });
    } else if (type === 'earnings') {
      updateQuest({ earnings: [] });
    }
    closeDialog();
  };

  useEditorHandlingClose(ref);

  return (
    <Deletion
      title={t(`${type}_deletion_of`)}
      message={t(`${type}_deletion_message`, { quest: questName })}
      onClickDelete={onClickDelete}
      onClose={closeDialog}
    />
  );
});
QuestDeletion.displayName = 'QuestDeletion';
