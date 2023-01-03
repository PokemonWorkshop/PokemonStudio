import React, { useMemo, useState } from 'react';
import { DataGoalGrid, DataQuestTable, TableEmpty } from './QuestTableStyle';
import { useTranslation } from 'react-i18next';
import { useProjectQuests } from '@utils/useProjectData';
import { RenderGoal } from './RenderGoal';
import { DragDropContext, Droppable, Draggable, DroppableProvided, DraggableProvided, DraggableStateSnapshot, DropResult } from 'react-beautiful-dnd';
import { StudioQuest, updateIndexSpeakToBeatNpc } from '@modelEntities/quest';
import { cloneEntity } from '@utils/cloneEntity';

type QuestGoalsTableProps = {
  quest: StudioQuest;
  onEdit: (index: number) => void;
};

export const QuestGoalsTable = ({ quest, onEdit }: QuestGoalsTableProps) => {
  const { setProjectDataValues: setQuest } = useProjectQuests();
  const currentEditedQuest = useMemo(() => cloneEntity(quest), [quest]);
  const { t } = useTranslation('database_quests');
  const [dragOn, setDragOn] = useState(false);

  return quest.objectives.length === 0 ? (
    <TableEmpty>{t('no_goal')}</TableEmpty>
  ) : (
    <DataQuestTable>
      <DataGoalGrid gap="16px" className="header" dragOn={dragOn}>
        <span></span>
        <span>ID</span>
        <span>{t('goal_type')}</span>
        <span>{t('category')}</span>
        <span>{t('details')}</span>
      </DataGoalGrid>
      <DragDropContext
        onDragStart={() => setDragOn(true)}
        onDragEnd={(result: DropResult) => {
          setDragOn(false);
          const srcI = result.source.index;
          const desI = result.destination?.index;
          if (desI === undefined) return;

          currentEditedQuest.objectives.splice(desI, 0, currentEditedQuest.objectives.splice(srcI, 1)[0]);
          updateIndexSpeakToBeatNpc(currentEditedQuest);
          setQuest({ [quest.dbSymbol]: currentEditedQuest });
        }}
      >
        <Droppable droppableId="droppable-goal">
          {(droppableProvided: DroppableProvided) => (
            <div ref={droppableProvided.innerRef} {...droppableProvided.droppableProps}>
              {quest.objectives.map((objective, index) => (
                <Draggable key={`objective-${index}`} draggableId={`draggable-objective-${index}`} index={index}>
                  {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                    <RenderGoal
                      ref={provided.innerRef}
                      objective={objective}
                      index={index}
                      provided={provided}
                      isDragging={snapshot.isDragging}
                      dragOn={dragOn}
                      onClickEdit={() => {
                        onEdit(index);
                      }}
                      onClickDelete={() => {
                        currentEditedQuest.objectives.splice(index, 1);
                        updateIndexSpeakToBeatNpc(currentEditedQuest);
                        setQuest({ [quest.dbSymbol]: currentEditedQuest });
                      }}
                    />
                  )}
                </Draggable>
              ))}
              {droppableProvided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </DataQuestTable>
  );
};
