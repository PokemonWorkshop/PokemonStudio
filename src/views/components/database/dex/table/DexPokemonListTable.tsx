import React, { useMemo, useState } from 'react';
import { DataPokemonGrid, DataPokemonListTable, DataPokemonVirtualizedListContainer, PokemonList, TableEmpty } from './DexPokemonListTableStyle';
import { useTranslation } from 'react-i18next';
import { useProjectDex, useProjectPokemon } from '@utils/useProjectData';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DroppableProvided,
  DraggableProvided,
  DraggableStateSnapshot,
  DropResult,
  DraggableRubric,
} from 'react-beautiful-dnd';
import DexModel from '@modelEntities/dex/Dex.model';
import { RenderPokemon } from './RenderPokemon';
import { AutoSizer, List } from 'react-virtualized';
import ReactDOM from 'react-dom';

type RowRendererType = {
  key: string;
  index: number;
  style: React.CSSProperties;
};

type DexPokemonListTableProps = {
  dex: DexModel;
  onEdit: (index: number) => void;
  onAddEvolution: (index: number) => void;
};

export const DexPokemonListTable = ({ dex, onEdit, onAddEvolution }: DexPokemonListTableProps) => {
  const { selectedDataIdentifier: selectedDex, setProjectDataValues: setDex } = useProjectDex();
  const { projectDataValues: allPokemon } = useProjectPokemon();
  const currentEditedDex = useMemo(() => dex.clone(), [dex]);
  const { t } = useTranslation(['database_dex', 'database_pokemon', 'database_types']);
  const [dragOn, setDragOn] = useState(false);
  const [scrollToRow, setScrollToRow] = useState<number | undefined>(undefined);

  useMemo(() => {
    setScrollToRow(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDex]);

  const onEditId = (index: number, id: number) => {
    if (index === id - dex.startId) return;

    currentEditedDex.changeId(index, id);
    setDex({ [dex.dbSymbol]: currentEditedDex });
    setScrollToRow(id - dex.startId);
  };

  return dex.creatures.length === 0 ? (
    <TableEmpty>{t('database_dex:no_creature')}</TableEmpty>
  ) : (
    <DataPokemonListTable>
      <DataPokemonGrid gap="16px" className="header" dragOn={dragOn}>
        <span />
        <span>ID</span>
        <span />
        <span>{t('database_pokemon:pokemon')}</span>
        <span>{t('database_types:pokemon_types')}</span>
      </DataPokemonGrid>
      <DragDropContext
        onDragStart={() => setDragOn(true)}
        onDragEnd={(result: DropResult) => {
          setDragOn(false);
          const srcI = result.source.index;
          const desI = result.destination?.index;
          if (desI === undefined) return;

          currentEditedDex.creatures.splice(desI, 0, currentEditedDex.creatures.splice(srcI, 1)[0]);
          setDex({ [dex.dbSymbol]: currentEditedDex });
        }}
      >
        <DataPokemonVirtualizedListContainer height={dex.creatures.length < 10 ? 40 * dex.creatures.length : 400}>
          <AutoSizer>
            {({ width }) => (
              <Droppable
                droppableId="droppable-dex-creature"
                mode="virtual"
                renderClone={(provided: DraggableProvided, snapshot: DraggableStateSnapshot, rubric: DraggableRubric) => {
                  const index = rubric.source.index;
                  const creature = dex.creatures[index];
                  return (
                    <RenderPokemon
                      ref={provided.innerRef}
                      style={{ height: 40 }}
                      pokemon={{
                        data: allPokemon[creature.dbSymbol],
                        form: creature.form,
                        id: index + dex.startId,
                        undef: creature.dbSymbol === '__undef__',
                      }}
                      provided={provided}
                      isDragging={snapshot.isDragging}
                      dragOn={dragOn}
                      index={index}
                      dex={dex}
                      onClickEdit={() => onEdit(index)}
                      onClickDelete={() => {
                        currentEditedDex.creatures.splice(index, 1);
                        setDex({ [dex.dbSymbol]: currentEditedDex });
                      }}
                      onClickAddEvolution={() => onAddEvolution(index)}
                      onEditId={onEditId}
                    />
                  );
                }}
              >
                {(droppableProvided: DroppableProvided) => (
                  <PokemonList
                    width={width}
                    height={dex.creatures.length < 10 ? 40 * dex.creatures.length : 400}
                    rowCount={dex.creatures.length}
                    rowHeight={40}
                    ref={(ref: List | null) => {
                      // react-virtualized has no way to get the list's ref that I can so
                      // So we use the `ReactDOM.findDOMNode(ref)` escape hatch to get the ref
                      if (ref) {
                        // eslint-disable-next-line react/no-find-dom-node
                        const whatHasMyLifeComeTo = ReactDOM.findDOMNode(ref);
                        if (whatHasMyLifeComeTo instanceof HTMLElement) {
                          droppableProvided.innerRef(whatHasMyLifeComeTo);
                        }
                        if (scrollToRow !== undefined) {
                          ref.scrollToRow(scrollToRow);
                          setScrollToRow(undefined);
                        }
                      }
                    }}
                    rowRenderer={({ key, index, style }: RowRendererType) => {
                      const creature = dex.creatures[index];
                      return (
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        /* @ts-ignore for the properties style doesn't exist but necessary */
                        <Draggable key={`dex-creature-${index}`} draggableId={`draggable-dex-creature-${index}`} index={index} style={style}>
                          {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                            <RenderPokemon
                              key={key}
                              style={style}
                              ref={provided.innerRef}
                              pokemon={{
                                data: allPokemon[creature.dbSymbol],
                                form: creature.form,
                                id: index + dex.startId,
                                undef: creature.dbSymbol === '__undef__',
                              }}
                              provided={provided}
                              isDragging={snapshot.isDragging}
                              dragOn={dragOn}
                              index={index}
                              dex={dex}
                              onClickEdit={() => onEdit(index)}
                              onClickDelete={() => {
                                currentEditedDex.creatures.splice(index, 1);
                                setDex({ [dex.dbSymbol]: currentEditedDex });
                              }}
                              onClickAddEvolution={() => onAddEvolution(index)}
                              onEditId={onEditId}
                            />
                          )}
                        </Draggable>
                      );
                    }}
                  />
                )}
              </Droppable>
            )}
          </AutoSizer>
        </DataPokemonVirtualizedListContainer>
      </DragDropContext>
    </DataPokemonListTable>
  );
};
