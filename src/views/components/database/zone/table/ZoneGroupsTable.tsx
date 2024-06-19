import React, { useMemo, useState } from 'react';
import { DataGroupGrid, DataZoneGroupsTable, TableEmpty } from './ZoneTableStyle';
import { useTranslation } from 'react-i18next';
import { useProjectZones } from '@hooks/useProjectData';
import { DragDropContext, Droppable, Draggable, DroppableProvided, DraggableProvided, DraggableStateSnapshot, DropResult } from 'react-beautiful-dnd';
import { ProjectData } from '@src/GlobalStateProvider';
import { RenderGroup } from './RenderGroup';
import { cloneEntity } from '@utils/cloneEntity';
import { StudioZone } from '@modelEntities/zone';

type ZoneGroupsTableProps = {
  zone: StudioZone;
  groups: ProjectData['groups'];
  onEdit: (index: number) => void;
};

export const ZoneGroupsTable = ({ zone, groups, onEdit }: ZoneGroupsTableProps) => {
  const { setProjectDataValues: setZone } = useProjectZones();
  const currentEditedZone = useMemo(() => cloneEntity(zone), [zone]);
  const { t } = useTranslation('database_zones');
  const [dragOn, setDragOn] = useState(false);

  return zone.wildGroups.length === 0 ? (
    <TableEmpty>{t('no_group')}</TableEmpty>
  ) : (
    <DataZoneGroupsTable>
      <DataGroupGrid gap="16px" className="header" dragOn={dragOn}>
        <span></span>
        <span>{t('group_name')}</span>
        <span className="environment">{t('environment')}</span>
        <span>{t('present_on_maps')}</span>
      </DataGroupGrid>
      <DragDropContext
        onDragStart={() => setDragOn(true)}
        onDragEnd={(result: DropResult) => {
          setDragOn(false);
          const srcI = result.source.index;
          const desI = result.destination?.index;
          if (desI === undefined) return;

          currentEditedZone.wildGroups.splice(desI, 0, currentEditedZone.wildGroups.splice(srcI, 1)[0]);
          setZone({ [zone.dbSymbol]: currentEditedZone });
        }}
      >
        <Droppable droppableId="droppable-goal">
          {(droppableProvided: DroppableProvided) => (
            <div ref={droppableProvided.innerRef} {...droppableProvided.droppableProps}>
              {zone.wildGroups.map((wildGroup, index) => (
                <Draggable key={`wild-group-${index}`} draggableId={`draggable-wild-group-${index}`} index={index}>
                  {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                    <RenderGroup
                      ref={provided.innerRef}
                      group={groups[wildGroup]}
                      zone={zone}
                      provided={provided}
                      isDragging={snapshot.isDragging}
                      dragOn={dragOn}
                      onClickEdit={() => {
                        onEdit(index);
                      }}
                      onClickDelete={() => {
                        currentEditedZone.wildGroups.splice(index, 1);
                        setZone({ [zone.dbSymbol]: currentEditedZone });
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
    </DataZoneGroupsTable>
  );
};
