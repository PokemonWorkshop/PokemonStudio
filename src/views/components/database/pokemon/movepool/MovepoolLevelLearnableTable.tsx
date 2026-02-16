import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MoveCategory, TypeCategory } from '@components/categories';
import { DataGrid } from '@components/database/dataBlocks';
import { ProjectData, useGlobalState } from '@src/GlobalStateProvider';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Input } from '@components/inputs';
import { DarkButtonImportResponsive, DeleteButtonOnlyIcon, PrimaryButton } from '@components/buttons';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { SelectCustom } from '@components/SelectCustom';
import { useProjectData, useProjectDataReadonly } from '@hooks/useProjectData';
import { DataMoveTable, NoMoveFound, LastAddedMovesContainer, ScrollableContent, HighlightWrapper } from './MovepoolTableStyle';
import { getNameType } from '@utils/getNameType';
import { useGetEntityNameText } from '@utils/ReadingProjectText';
import { cloneEntity } from '@utils/cloneEntity';
import { StudioCreature, StudioCreatureForm, StudioLearnableMove, StudioLevelLearnableMove } from '@modelEntities/creature';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { ButtonContainer } from '@components/editor/DataBlockEditorStyle';
import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { assertUnreachable } from '@utils/assertUnreachable';
import { MovepoolMultiple } from '@components/database/pokemon/movepool/MovepoolMultiple';
import { useDialogsRef } from '@src/hooks/useDialogsRef';
import { SecondaryButtonWithPlusIconResponsive } from '@components/buttons';
import { ButtonRightContainer } from '@components/editor/DataBlockEditorStyle';

export const SelectEditorOverlay = defineEditorOverlay<
  'multiple_add',
  {
    type: 'level';
    moves: SelectOption[];
    setLastAddedMoves: React.Dispatch<React.SetStateAction<StudioLevelLearnableMove[]>>;
  }
>('SelectEditorOverlay', (dialogToShow, handleCloseRef, closeDialog, props) => {
  switch (dialogToShow) {
    case 'multiple_add':
      return (
        <MovepoolMultiple
          type={props.type}
          moves={props.moves}
          hasLevel={true}
          setLastAddedMoves={props.setLastAddedMoves as React.Dispatch<React.SetStateAction<StudioLearnableMove[]>>}
          closeDialog={closeDialog}
          ref={handleCloseRef}
        />
      );
    default:
      return assertUnreachable(dialogToShow);
  }
});

type RenderEditMoveProps = {
  learnableMove: StudioLevelLearnableMove;
  index: number;
  moves: ProjectData['moves'];
  types: ProjectData['types'];
  moveOptions: SelectOption[];
  error?: boolean;

  disableDelete?: boolean;

  onEditMove(move: DbSymbol, index: number): void;
  onEditLevel(level: number, index: number): void;
  onDelete(index: number): void;
};

type PokemonIdentifierType = {
  specie: string;
  form: number;
};

type MoveOccurrenceType = {
  move: { dbSymbol: string; level: number };
  occurrence: number;
};

const DataMoveGrid = styled(DataGrid)`
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text400};
  grid-template-columns: 58px 280px 75px 75px 49px 87px 82px auto;
  align-items: center;

  &:hover:not(.header) {
    background-color: ${({ theme }) => theme.colors.dark18};
    color: ${({ theme }) => theme.colors.text100};
    border-radius: 8px;

    .delete {
      display: flex;
    }
  }

  & span:nth-child(5),
  & span:nth-child(6),
  & span:nth-child(7) {
    text-align: right;
  }

  .delete:nth-child(8) {
    display: none;
    justify-content: end;
  }

  @media ${({ theme }) => theme.breakpoints.dataBox422} {
    grid-template-columns: 58px 252px auto;

    & span:nth-child(3),
    & span:nth-child(4),
    & span:nth-child(5),
    & span:nth-child(6),
    & span:nth-child(7) {
      display: none;
    }
  }
`;

const RenderMoveContainer = styled(DataMoveGrid)`
  box-sizing: border-box;
  height: 48px;
  padding: 0 8px 0 4px;
  margin: 0 -4px 0 0;
`;

const AddMoveContainer = styled.div`
  display: flex;
  flex-direction: row;

  & input {
    width: 58px;
  }

  gap: 0.5rem;
  align-items: center;
`;

const getMoveOptions = (allMoves: ProjectData['moves'], getMoveName: ReturnType<typeof useGetEntityNameText>): SelectOption[] =>
  Object.entries(allMoves)
    .map(([value, moveData]) => ({ value, label: getMoveName(moveData), index: moveData.id }))
    .sort((a, b) => a.index - b.index);

const getOccurrences = (form: StudioCreatureForm) => {
  const occurrences: MoveOccurrenceType[] = [];
  form.moveSet
    .filter((m): m is StudioLevelLearnableMove => m.klass === 'LevelLearnableMove')
    .map((levelLearnableMove) => {
      const occurrence = occurrences.find((dbs) => dbs.move.dbSymbol === levelLearnableMove.move && dbs.move.level === levelLearnableMove.level);
      if (occurrence) occurrence.occurrence += 1;
      else occurrences.push({ move: { dbSymbol: levelLearnableMove.move, level: levelLearnableMove.level }, occurrence: 1 });
    });
  return occurrences;
};

const editLevel = (
  index: number,
  movePool: StudioLevelLearnableMove[],
  pokemonIdentifier: PokemonIdentifierType,
  currentEditedPokemon: StudioCreature,
  level: number,
) => {
  const currentEditedForm = currentEditedPokemon.forms[pokemonIdentifier.form];
  movePool[index].level = level;
  movePool.sort((a, b) => a.level - b.level);
  currentEditedForm.moveSet = [...movePool, ...currentEditedForm.moveSet.filter((m) => m.klass !== 'LevelLearnableMove')];
  return currentEditedPokemon;
};

const editMove = (index: number, movePool: StudioLevelLearnableMove[], currentEditedPokemon: StudioCreature, move: string) => {
  movePool[index].move = move as DbSymbol;
  return currentEditedPokemon;
};

const deleteMove = (
  index: number,
  movePool: StudioLevelLearnableMove[],
  pokemonIdentifier: PokemonIdentifierType,
  currentEditedPokemon: StudioCreature,
) => {
  const currentEditedForm = currentEditedPokemon.forms.find((f) => f.form === pokemonIdentifier.form);
  if (!currentEditedForm) return;

  const movePoolEdited = cloneEntity(movePool);
  movePoolEdited.splice(index, 1);
  currentEditedForm.moveSet = [...movePoolEdited, ...currentEditedForm.moveSet.filter((m) => m.klass !== 'LevelLearnableMove')];
  return currentEditedPokemon;
};

const RenderEditMove = ({
  learnableMove,
  index,
  moves,
  types,
  moveOptions,
  error,
  disableDelete,
  onEditMove,
  onEditLevel,
  onDelete,
}: RenderEditMoveProps) => {
  const { t } = useTranslation();
  const [state] = useGlobalState();
  const getMoveName = useGetEntityNameText();

  const move = moves[learnableMove.move];
  const [currentLevel, setCurrentLevel] = useState(learnableMove.level);

  useEffect(() => {
    setCurrentLevel(learnableMove.level);
  }, [learnableMove.level]);

  return (
    <RenderMoveContainer gap="8px">
      <Input
        type="number"
        min="1"
        max="999"
        value={currentLevel}
        onChange={(e) => {
          const value = Number(e.target.value);
          if (!value) setCurrentLevel(0);
          if (value >= 1) setCurrentLevel(value);
        }}
        onBlur={() => {
          if (currentLevel !== learnableMove.level) {
            onEditLevel(currentLevel, index);
          }
          if (currentLevel === 0) {
            setCurrentLevel(1);
          }
        }}
      />

      <SelectCustom
        options={moveOptions}
        value={{ value: learnableMove.move, label: move ? getMoveName(move) : t('move_deleted') }}
        error={error || !move}
        noOptionsText={t('no_move_found')}
        onChange={(selected) => onEditMove(selected.value as DbSymbol, index)}
      />

      {move ? <TypeCategory type={move.type}>{getNameType(types, move.type, state)}</TypeCategory> : <TypeCategory type="normal">???</TypeCategory>}

      {move ? (
        <MoveCategory category={move.category}>{t(`${move.category}` as never)}</MoveCategory>
      ) : (
        <MoveCategory category="physical">???</MoveCategory>
      )}

      <span>{move ? move.pp : '---'}</span>
      <span>{move ? move.power : '---'}</span>
      <span>{move ? move.accuracy : '---'}</span>

      <div className="delete">
        <DeleteButtonOnlyIcon onClick={() => onDelete(index)} disabled={disableDelete} />
      </div>
    </RenderMoveContainer>
  );
};

type MovePoolLevelProps = {
  importation: { label: string; onClick: () => void };
};

export const MovepoolLevelLearnableTable = ({ importation }: MovePoolLevelProps) => {
  const { projectDataValues: moves } = useProjectDataReadonly('moves', 'move');
  const { projectDataValues: types } = useProjectDataReadonly('types', 'type');

  const {
    projectDataValues: pokemon,
    selectedDataIdentifier: pokemonIdentifier,
    setProjectDataValues: setPokemon,
  } = useProjectData('pokemon', 'pokemon');
  const dialogsRef = useDialogsRef<'multiple_add'>();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastAddedRef = useRef<HTMLDivElement>(null);
  const [highlightedMoves, setHighlightedMoves] = useState<Set<string>>(new Set());
  const [alreadyHighlightedMoves, setAlreadyHighlightedMoves] = useState<Set<string>>(new Set());
  const { t } = useTranslation();
  const currentEditedPokemon = useMemo(() => cloneEntity(pokemon[pokemonIdentifier.specie]), [pokemon, pokemonIdentifier.specie]);
  const getMoveName = useGetEntityNameText();
  const moveOptions = useMemo(() => getMoveOptions(moves, getMoveName), [moves, getMoveName]);
  const form = useMemo(
    () => currentEditedPokemon.forms.find((form) => form.form === pokemonIdentifier.form) || currentEditedPokemon.forms[0],
    [currentEditedPokemon.forms, pokemonIdentifier.form],
  );
  const [latestAdded, setLatestAdded] = useState<StudioLevelLearnableMove[]>([]);

  const movePoolData = useMemo(() => {
    const allMoves = form.moveSet.filter((m): m is StudioLevelLearnableMove => m.klass === 'LevelLearnableMove');
    const latestAddedMoves = new Set(latestAdded.map((m) => `${m.move}-${m.level}`));
    return allMoves.filter((move) => !latestAddedMoves.has(`${move.move}-${move.level}`));
  }, [form, latestAdded]);

  const occurrences = getOccurrences(form);

  const moveNotSelectedOptions = useMemo(() => {
    return moveOptions.filter((option) => !movePoolData.some((m) => m.move === option.value) && !latestAdded.some((m) => m.move === option.value));
  }, [moveOptions, movePoolData, latestAdded]);

  const [selectedToAdd, setSelectedToAdd] = useState<SelectOption | null>(moveNotSelectedOptions[0]);
  const [levelToAdd, setLevelToAdd] = useState<number>(1);

  const onAddSelectedMove = () => {
    if (!selectedToAdd) return;
    setLatestAdded([...latestAdded, { klass: 'LevelLearnableMove', move: selectedToAdd.value as DbSymbol, level: levelToAdd }]);

    // Sélectionner la suivante dans la liste actuelle
    const currentIndex = moveNotSelectedOptions.findIndex((option) => option.value === selectedToAdd.value);
    const nextIndex = currentIndex + 1;

    if (nextIndex < moveNotSelectedOptions.length) {
      setSelectedToAdd(moveNotSelectedOptions[nextIndex]);
    } else {
      // Si c'était la dernière, sélectionner la première ou null
      setSelectedToAdd(moveNotSelectedOptions[0] || null);
    }

    setLevelToAdd(1);
  };

  const handleDeleteMove = (indexToRemove: number) => {
    const updatedLatestAdded = latestAdded.filter((_, i) => i !== indexToRemove);
    setLatestAdded(updatedLatestAdded);
    const index = currentEditedPokemon.forms.findIndex((form) => form.form === pokemonIdentifier.form);
    const clonedPokemon = cloneEntity(pokemon[pokemonIdentifier.specie]);
    const currentEditedForm = clonedPokemon.forms[index === -1 ? 0 : index];

    currentEditedForm.moveSet = [...movePoolData, ...updatedLatestAdded];
    setPokemon({ [pokemonIdentifier.specie]: clonedPokemon });
  };

  useEffect(() => {
    const listener = () => setLatestAdded([]);
    window.addEventListener('project-saved', listener);
    return () => window.removeEventListener('project-saved', listener);
  }, []);

  const previousPokemonRef = useRef<{ specie: string; form: number }>({
    specie: pokemonIdentifier.specie,
    form: pokemonIdentifier.form,
  });

  useEffect(() => {
    const hasChanged = previousPokemonRef.current.specie !== pokemonIdentifier.specie || previousPokemonRef.current.form !== pokemonIdentifier.form;

    if (hasChanged && latestAdded.length > 0) {
      setLatestAdded([]);
      previousPokemonRef.current = {
        specie: pokemonIdentifier.specie,
        form: pokemonIdentifier.form,
      };
      return;
    }

    // Ne mettre à jour le moveSet que si on est sur le même Pokémon && qu'aucun move n'ait été ajouté
    if (!hasChanged && latestAdded.length > 0) {
      const index = currentEditedPokemon.forms.findIndex((form) => form.form === pokemonIdentifier.form);
      const clonedPokemon = cloneEntity(pokemon[pokemonIdentifier.specie]);
      const currentEditedForm = clonedPokemon.forms[index === -1 ? 0 : index];

      const otherMoves = currentEditedForm.moveSet.filter((m) => m.klass !== 'LevelLearnableMove');
      const allLevelMoves = [...movePoolData, ...latestAdded].sort((a, b) => a.level - b.level);
      currentEditedForm.moveSet = [...allLevelMoves, ...otherMoves];

      setPokemon({ [pokemonIdentifier.specie]: clonedPokemon });
      // Mettre à jour la référence à la fin
      previousPokemonRef.current = {
        specie: pokemonIdentifier.specie,
        form: pokemonIdentifier.form,
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestAdded, movePoolData.length, pokemonIdentifier.specie, pokemonIdentifier.form]);

  // Système de highlight - déclenché quand latestAdded change
  useEffect(() => {
    if (latestAdded.length > 0) {
      requestAnimationFrame(() => {
        // Scroll vers le dernier élément ajouté
        if (lastAddedRef.current && scrollContainerRef.current) {
          lastAddedRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          });
        }

        // Créer les clés uniques pour les moves (incluant le level pour les LevelLearnableMove)
        const newHighlights = new Set(latestAdded.map((m) => `${m.move}-${m.level}-${m.klass}`).filter((key) => !alreadyHighlightedMoves.has(key)));

        setHighlightedMoves(newHighlights);
        setAlreadyHighlightedMoves((prev) => new Set([...prev, ...newHighlights]));

        // Désactiver le highlight après 2 secondes
        setTimeout(() => {
          setHighlightedMoves(new Set());
        }, 2000);
      });
    }
  }, [latestAdded]);

  return (
    <DataMoveTable>
      {movePoolData.length === 0 && latestAdded.length === 0 ? (
        <NoMoveFound>{t('no_option')}</NoMoveFound>
      ) : (
        <>
          <DataMoveGrid gap="8px" className="header">
            <span>{t('level')}</span>
            <span>{t('move')}</span>
            <span>{t('type')}</span>
            <span>{t('category')}</span>
            <span>{t('pp')}</span>
            <span>{t('power')}</span>
            <span>{t('accuracy')}</span>
          </DataMoveGrid>
          <ScrollableContent ref={scrollContainerRef}>
            {movePoolData.map((learnableMove, index) => {
              const isError =
                (occurrences.find((o) => o.move.dbSymbol === learnableMove.move && o.move.level === learnableMove.level)?.occurrence || 1) > 1;

              return (
                <RenderEditMove
                  key={`${learnableMove.move}-${learnableMove.level}-${index}`}
                  learnableMove={learnableMove}
                  index={index}
                  moves={moves}
                  types={types}
                  moveOptions={moveOptions}
                  error={isError}
                  onEditMove={(move, i) => {
                    setPokemon({
                      [pokemonIdentifier.specie]: editMove(i, movePoolData, currentEditedPokemon, move),
                    });
                  }}
                  onEditLevel={(level, i) => {
                    const updated = cloneEntity(movePoolData);
                    updated[i].level = level;
                    updated.sort((a, b) => a.level - b.level);

                    setPokemon({
                      [pokemonIdentifier.specie]: (() => {
                        const cloned = cloneEntity(currentEditedPokemon);
                        const formIndex = cloned.forms.findIndex((f) => f.form === pokemonIdentifier.form);
                        const form = cloned.forms[formIndex === -1 ? 0 : formIndex];
                        form.moveSet = [...updated, ...form.moveSet.filter((m) => m.klass !== 'LevelLearnableMove')];
                        return cloned;
                      })(),
                    });
                  }}
                  disableDelete={movePoolData.length === 1}
                  onDelete={(i) => {
                    if (movePoolData.length === 1) return;

                    setPokemon({
                      [pokemonIdentifier.specie]: deleteMove(i, movePoolData, pokemonIdentifier, currentEditedPokemon),
                    });
                  }}
                />
              );
            })}
            {latestAdded.length !== 0 && (
              <LastAddedMovesContainer>
                <div className="last-added-header">
                  <span>{t('last_added_moves', { defaultValue: 'Last added' })}</span>
                </div>
                {latestAdded.map((pending, index) => {
                  const isError =
                    [...movePoolData, ...latestAdded].filter((m) => m.move === pending.move && m.level === pending.level).length > 1 ||
                    !moves[pending.move];
                  const isLastItem = index === latestAdded.length - 1;
                  const moveKey = `${pending.move}-${pending.level}-${pending.klass}`;
                  const shouldHighlight = highlightedMoves.has(moveKey);

                  return (
                    <HighlightWrapper
                      key={`pending-${pending.move}-${pending.level}-${index}`}
                      ref={isLastItem ? lastAddedRef : null}
                      shouldHighlight={shouldHighlight}
                    >
                      <RenderEditMove
                        learnableMove={pending}
                        index={index}
                        moves={moves}
                        types={types}
                        moveOptions={moveNotSelectedOptions}
                        error={isError}
                        onEditMove={(move, i) => {
                          const updated = latestAdded.map((m, idx) => (idx === i ? { ...m, move } : m));
                          setLatestAdded(updated);
                        }}
                        onEditLevel={(level, i) => {
                          const updated = latestAdded.map((m, idx) => (idx === i ? { ...m, level } : m));
                          updated[i].level = level;
                          updated.sort((a, b) => a.level - b.level);
                          setLatestAdded(updated);
                          setPokemon({
                            [pokemonIdentifier.specie]: (() => {
                              const cloned = cloneEntity(currentEditedPokemon);
                              const formIndex = cloned.forms.findIndex((f) => f.form === pokemonIdentifier.form);
                              const form = cloned.forms[formIndex === -1 ? 0 : formIndex];
                              form.moveSet = [...updated, ...form.moveSet.filter((m) => m.klass !== 'LevelLearnableMove')];
                              return cloned;
                            })(),
                          });
                        }}
                        onDelete={(i) => handleDeleteMove(i)}
                      />
                    </HighlightWrapper>
                  );
                })}
              </LastAddedMovesContainer>
            )}
          </ScrollableContent>
        </>
      )}
      <ButtonContainer style={{ paddingLeft: '4px' }}>
        <AddMoveContainer>
          <Input
            type="number"
            name="level"
            min="1"
            max="999"
            value={levelToAdd}
            onChange={(event) => {
              const newValue = Number(event.target.value);
              if (!newValue) setLevelToAdd(0);
              if (newValue >= 1) setLevelToAdd(newValue);
            }}
            onBlur={() => {
              if (levelToAdd === 0) {
                setLevelToAdd(1);
              }
            }}
            placeholder={t('level')}
          />
          <SelectCustom
            options={moveNotSelectedOptions}
            onChange={(selected) => setSelectedToAdd(selected)}
            noOptionsText={t('no_move_found')}
            value={selectedToAdd || undefined}
          />
          <PrimaryButton onClick={onAddSelectedMove} data-tooltip={t('add_move')} disabled={!selectedToAdd || false}>
            {t('add_move')}
          </PrimaryButton>
        </AddMoveContainer>
        <ButtonRightContainer>
          <SecondaryButtonWithPlusIconResponsive
            onClick={() => dialogsRef.current?.openDialog('multiple_add')}
            data-tooltip={t('add_move_multiple')}
            disabled={false}
          >
            {t('add_move_multiple')}
          </SecondaryButtonWithPlusIconResponsive>
          {importation && (
            <DarkButtonImportResponsive data-tooltip={importation.label} onClick={importation.onClick}>
              {t('movepool_import')}
            </DarkButtonImportResponsive>
          )}
        </ButtonRightContainer>
      </ButtonContainer>
      <SelectEditorOverlay ref={dialogsRef} type="level" moves={moveNotSelectedOptions} setLastAddedMoves={setLatestAdded} />
    </DataMoveTable>
  );
};
