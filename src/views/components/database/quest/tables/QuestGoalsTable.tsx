import React, { useState } from 'react';
import { DataGoalGrid, DataQuestTable, TableEmpty } from './QuestTableStyle';
import { useTranslation } from 'react-i18next';
import { RenderGoal } from './RenderGoal';
import { DragDropContext, Droppable, Draggable, DroppableProvided, DraggableProvided, DraggableStateSnapshot, DropResult } from '@hello-pangea/dnd';
import { StudioQuest, updateIndexSpeakToBeatNpc } from '@modelEntities/quest';
import { cloneEntity } from '@utils/cloneEntity';
import { useUpdateQuest } from '../editors/useUpdateQuest';

type QuestGoalsTableProps = {
  quest: StudioQuest;
  editGoal: (index: number) => void;
};

export const QuestGoalsTable = ({ quest, editGoal }: QuestGoalsTableProps) => {
  const updateQuest = useUpdateQuest(quest);
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

          const newObjectives = cloneEntity(quest.objectives);
          newObjectives.splice(desI, 0, newObjectives.splice(srcI, 1)[0]);
          updateIndexSpeakToBeatNpc(newObjectives);
          updateQuest({ objectives: newObjectives });
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
                      onClickEdit={() => editGoal(index)}
                      onClickDelete={() => {
                        const newObjectives = cloneEntity(quest.objectives);
                        newObjectives.splice(index, 1);
                        updateIndexSpeakToBeatNpc(newObjectives);
                        updateQuest({ objectives: newObjectives });
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
