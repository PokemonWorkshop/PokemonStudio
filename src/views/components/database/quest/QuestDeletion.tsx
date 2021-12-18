import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Deletion } from '@components/deletion';
import { useProjectQuests } from '@utils/useProjectData';

type QuestDeletionProps = {
  type: 'quest' | 'goals' | 'earnings';
  onClose: () => void;
};

export const QuestDeletion = ({ type, onClose }: QuestDeletionProps) => {
  const {
    projectDataValues: quests,
    selectedDataIdentifier: questDbSymbol,
    setProjectDataValues: setQuest,
    removeProjectDataValue: removeQuest,
  } = useProjectQuests();
  const { t } = useTranslation('database_quests');
  const quest = quests[questDbSymbol];
  const currentDeletedQuest = useMemo(() => quest.clone(), [quest]);

  const onClickDelete = () => {
    if (type === 'quest') {
      const firstDbSymbol = Object.entries(quests)
        .map(([value, questData]) => ({ value, index: questData.id }))
        .filter((d) => d.value !== questDbSymbol)
        .sort((a, b) => a.index - b.index)[0].value;
      removeQuest(questDbSymbol, { quest: firstDbSymbol });
    } else if (type === 'goals') {
      currentDeletedQuest.objectives = [];
      setQuest({ [quest.dbSymbol]: currentDeletedQuest });
    } else if (type === 'earnings') {
      currentDeletedQuest.earnings = [];
      setQuest({ [quest.dbSymbol]: currentDeletedQuest });
    }
    onClose();
  };

  return (
    <Deletion
      title={t(`${type}_deletion_of`)}
      message={t(`${type}_deletion_message`, { quest: quest.name().replaceAll(' ', '\u00a0') })}
      onClickDelete={onClickDelete}
      onClose={onClose}
    />
  );
};
