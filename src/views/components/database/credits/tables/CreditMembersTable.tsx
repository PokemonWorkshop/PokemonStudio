import React, { useMemo, useState } from 'react';
import { useConfigCredits } from '@utils/useProjectConfig';
import { StudioCreditConfig } from '@modelEntities/config';
import { cloneEntity } from '@utils/cloneEntity';
import { useTranslation } from 'react-i18next';
import { TableEmpty, DataMemberTable, DataMemberGrid } from './CreditMemberTableStyle';
import { RenderMember } from './RenderMember';
import { DragDropContext, Droppable, Draggable, DroppableProvided, DraggableProvided, DraggableStateSnapshot, DropResult } from 'react-beautiful-dnd';

type CreditsMembersTableProps = {
  credits: StudioCreditConfig;
  onEdit: (index: number) => void;
};

export const CreditMembersTable = ({ credits, onEdit }: CreditsMembersTableProps) => {
  const { setProjectConfigValues: setCredits } = useConfigCredits();
  const currentEditedCredits = useMemo(() => cloneEntity(credits), [credits]);
  const { t } = useTranslation('database_credits');
  const [dragOn, setDragOn] = useState(false);

  return credits.leaders.length === 0 ? (
    <TableEmpty>{t('database_credits:no_member')}</TableEmpty>
  ) : (
    <DataMemberTable>
      <DataMemberGrid gap="16px" className="header" dragOn={true}>
        <span></span>
        <span>{t('database_credits:role')}</span>
        <span>{t('database_credits:names')}</span>
      </DataMemberGrid>
      <DragDropContext
        onDragStart={() => setDragOn(true)}
        onDragEnd={(result: DropResult) => {
          setDragOn(false);
          const srcI = result.source.index;
          const desI = result.destination?.index;
          if (desI === undefined) return;

          currentEditedCredits.leaders.splice(desI, 0, currentEditedCredits.leaders.splice(srcI, 1)[0]);
          setCredits({ ...currentEditedCredits });
        }}
      >
        <Droppable droppableId="droppable-member">
          {(droppableProvided: DroppableProvided) => (
            <div ref={droppableProvided.innerRef} {...droppableProvided.droppableProps}>
              {credits.leaders.map((member, index) => (
                <Draggable key={`member-${index}`} draggableId={`draggable-member-${index}`} index={index}>
                  {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                    <RenderMember
                      ref={provided.innerRef}
                      member={member}
                      index={index}
                      key={index}
                      provided={provided}
                      isDragging={snapshot.isDragging}
                      dragOn={dragOn}
                      onClickEdit={() => {
                        onEdit(index);
                      }}
                      onClickDelete={() => {
                        currentEditedCredits.leaders.splice(index, 1);
                        setCredits({ ...currentEditedCredits });
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
    </DataMemberTable>
  );
};
