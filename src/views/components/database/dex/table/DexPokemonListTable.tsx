import React, { useMemo, useState } from 'react';
import { DataPokemonGrid, DataPokemonListTable, DataPokemonVirtualizedListContainer, PokemonList, TableEmpty } from './DexPokemonListTableStyle';
import { useTranslation } from 'react-i18next';
import { useProjectDex, useProjectPokemon } from '@hooks/useProjectData';
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
import { RenderPokemon } from './RenderPokemon';
import { AutoSizer, List } from 'react-virtualized';
import ReactDOM from 'react-dom';
import { StudioDex } from '@modelEntities/dex';
import { DexDialogsRef } from '../editors/DexEditorOverlay';
import { cloneEntity } from '@utils/cloneEntity';

type RowRendererType = {
  key: string;
  index: number;
  style: React.CSSProperties;
};

type DexPokemonListTableProps = {
  dex: StudioDex;
  dialogsRef: DexDialogsRef;
  setCreatureIndex: (index: number) => void;
};

export const DexPokemonListTable = ({ dex, dialogsRef, setCreatureIndex }: DexPokemonListTableProps) => {
  const { selectedDataIdentifier: selectedDex, setProjectDataValues: setDex } = useProjectDex();
  const { projectDataValues: allPokemon } = useProjectPokemon();
  const { t } = useTranslation(['database_dex', 'database_pokemon', 'database_types']);
  const [dragOn, setDragOn] = useState(false);
  const [scrollToRow, setScrollToRow] = useState<number | undefined>(undefined);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const currentEditedDex = useMemo(() => cloneEntity(dex), [dex, dex.creatures]);

  useMemo(() => {
    setScrollToRow(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDex]);

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
          setDex({ [currentEditedDex.dbSymbol]: currentEditedDex });
        }}
      >
        <DataPokemonVirtualizedListContainer height={dex.creatures.length <= 10 ? 40 * dex.creatures.length : 420}>
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
                      isDragging={snapshot.isDragging}
                      style={{ height: 40 }}
                      pokemon={{
                        data: allPokemon[creature.dbSymbol],
                        form: creature.form,
                        id: index + dex.startId,
                        undef: creature.dbSymbol === '__undef__',
                      }}
                      {...{ provided, dragOn, index, dex: currentEditedDex, dialogsRef, setScrollToRow, setCreatureIndex }}
                    />
                  );
                }}
              >
                {(droppableProvided: DroppableProvided) => (
                  <PokemonList
                    width={width}
                    height={dex.creatures.length <= 10 ? 40 * dex.creatures.length : 420}
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
                              isDragging={snapshot.isDragging}
                              {...{ provided, dragOn, index, dex: currentEditedDex, dialogsRef, setScrollToRow, setCreatureIndex }}
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
