import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MoveCategory, TypeCategory } from '@components/categories';
import { ProjectData, useGlobalState } from '@src/GlobalStateProvider';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { DarkButtonImportResponsive, DeleteButtonOnlyIcon, PrimaryButton, SecondaryButtonWithPlusIconResponsive } from '@components/buttons';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { SelectCustom } from '@components/SelectCustom';
import { useProjectData, useProjectDataReadonly, useProjectMoves } from '@hooks/useProjectData';
import {
  AddMoveContainer,
  DataMoveGrid,
  DataMoveTable,
  HighlightWrapper,
  LastAddedMovesContainer,
  NoMoveFound,
  RenderMoveContainer,
  ScrollableContent,
} from './MovepoolTableStyle';
import { getNameType } from '@utils/getNameType';
import { useGetEntityNameText } from '@utils/ReadingProjectText';
import { getSelectDataOptionsOrderedById } from '@components/selects/SelectDataGeneric';
import { cloneEntity } from '@utils/cloneEntity';
import {
  StudioBreedLearnableMove,
  StudioCreature,
  StudioCreatureForm,
  StudioEvolutionLearnableMove,
  StudioLearnableMove,
  StudioLevelLearnableMove,
  StudioTechLearnableMove,
  StudioTutorLearnableMove,
} from '@modelEntities/creature';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { StudioTechItem } from '@modelEntities/item';
import { StudioMove } from '@modelEntities/move';
import { ButtonContainer, ButtonRightContainer } from '@components/editor/DataBlockEditorStyle';
import { MovepoolMultiple } from '@components/database/pokemon/movepool/MovepoolMultiple';
import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { assertUnreachable } from '@utils/assertUnreachable';
import { MovepoolType } from '@pages/database/Pokemon.Movepool.page';
import { useDialogsRef } from '@src/hooks/useDialogsRef';

type RenderEditMoveProps = {
  learnableMove: StudioLearnableMove;
  index: number;
  moves: ProjectData['moves'];
  types: ProjectData['types'];
  movepoolType: MovepoolTableType;
  moveOptions: SelectOption[];
  error?: boolean;

  onEdit(move: DbSymbol, index: number): void;
  onDelete(index: number): void;
};

type PokemonIdentifierType = {
  specie: string;
  form: number;
};

export type MovepoolTableType = 'tutor' | 'tech' | 'breed' | 'evolution';

type MovepoolTableProps = {
  movepoolType: MovepoolTableType;
  importation?: { label: string; onClick: () => void };
  add?: { label: string; onClick: () => void };
  disabledImport?: boolean;
  disabledAdd?: boolean;
  onClickDelete?: () => void;
  disabledDeletion?: boolean;
};

type MoveOccurrenceType = {
  dbSymbol: string;
  occurrence: number;
};

export const SelectEditorOverlay = defineEditorOverlay<
  'multiple_add',
  {
    type: MovepoolType;
    moves: SelectOption[];
    setLastAddedMoves: React.Dispatch<
      React.SetStateAction<
        (StudioTechLearnableMove | StudioLevelLearnableMove | StudioTutorLearnableMove | StudioBreedLearnableMove | StudioEvolutionLearnableMove)[]
      >
    >;
  }
>('SelectEditorOverlay', (dialogToShow, handleCloseRef, closeDialog, props) => {
  switch (dialogToShow) {
    case 'multiple_add':
      return (
        <MovepoolMultiple
          type={props.type}
          moves={props.moves}
          setLastAddedMoves={props.setLastAddedMoves}
          closeDialog={closeDialog}
          ref={handleCloseRef}
        />
      );
    default:
      return assertUnreachable(dialogToShow);
  }
});

const getSafeName = (move: StudioMove, t: TFunction, getEntityName: ReturnType<typeof useGetEntityNameText>) => {
  if (move) return getEntityName(move);
  return t('move_deleted');
};

const getMoveTechOptions = (
  allItems: ProjectData['items'],
  allMoves: ProjectData['moves'],
  t: TFunction,
  getEntityName: ReturnType<typeof useGetEntityNameText>,
) =>
  Object.values(allItems)
    .filter((itemData): itemData is StudioTechItem => itemData.klass === 'TechItem')
    .map((itemData) => ({
      value: itemData.move,
      label: `${getEntityName(itemData)} - ${getSafeName(allMoves[itemData.move], t, getEntityName)}`,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: 'base' }));

export const getMoveKlass = (movepoolType: MovepoolTableType) => {
  switch (movepoolType) {
    case 'tutor':
      return 'TutorLearnableMove';
    case 'tech':
      return 'TechLearnableMove';
    case 'breed':
      return 'BreedLearnableMove';
    default:
      return 'EvolutionLearnableMove';
  }
};

const getMovepool = (form: StudioCreatureForm, movepoolType: MovepoolTableType) => {
  const klass = getMoveKlass(movepoolType);
  return form.moveSet.filter((m) => m.klass === klass);
};

const getMovepoolData = (
  type: MovepoolTableType,
  moves: ProjectData['moves'],
  items: ProjectData['items'],
  currentEditedForm: StudioCreatureForm,
  t: TFunction,
  getEntityName: ReturnType<typeof useGetEntityNameText>,
) => {
  if (type === 'tech') {
    const techItems = Object.values(items).filter((itemData): itemData is StudioTechItem => itemData.klass === 'TechItem');
    return getMovepool(currentEditedForm, type).sort((a, b) => {
      const techItemA = techItems.filter((itemData) => itemData.move === a.move)[0];
      const techItemB = techItems.filter((itemData) => itemData.move === b.move)[0];
      const nameA = techItemA
        ? `${getEntityName(techItemA)} - ${getSafeName(moves[techItemA.move], t, getEntityName)}`
        : getSafeName(moves[a.move], t, getEntityName);
      const nameB = techItemB
        ? `${getEntityName(techItemB)} - ${getSafeName(moves[techItemB.move], t, getEntityName)}`
        : getSafeName(moves[b.move], t, getEntityName);
      return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
    });
  }
  return getMovepool(currentEditedForm, type).sort((a, b) =>
    getSafeName(moves[a.move], t, getEntityName).localeCompare(getSafeName(moves[b.move], t, getEntityName)),
  );
};

const editMove = (index: number, moveSet: StudioLearnableMove[], currentEditedPokemon: StudioCreature, move: string) => {
  moveSet[index].move = move as DbSymbol;
  return currentEditedPokemon;
};

const deleteMove = (
  index: number,
  moveSet: StudioLearnableMove[],
  pokemonIdentifier: PokemonIdentifierType,
  currentEditedPokemon: StudioCreature,
  type: MovepoolTableType,
) => {
  const currentEditedForm = currentEditedPokemon.forms.find((f) => f.form === pokemonIdentifier.form);
  if (!currentEditedForm) return;

  const moveSetEdited = cloneEntity(moveSet);
  const klass = getMoveKlass(type);
  moveSetEdited.splice(index, 1);
  currentEditedForm.moveSet = [...currentEditedForm.moveSet.filter((m) => m.klass !== klass), ...moveSetEdited];
  return currentEditedPokemon;
};

const getOccurrences = (form: StudioCreatureForm, type: MovepoolTableType) => {
  const occurences: MoveOccurrenceType[] = [];
  getMovepool(form, type).map((learnableMove) => {
    const occurrence = occurences.find((dbs) => dbs.dbSymbol === learnableMove.move);
    if (occurrence) occurrence.occurrence += 1;
    else occurences.push({ dbSymbol: learnableMove.move, occurrence: 1 });
  });
  return occurences;
};
export const RenderEditMove = ({ learnableMove, index, moves, types, movepoolType, moveOptions, error, onEdit, onDelete }: RenderEditMoveProps) => {
  const { t } = useTranslation();
  const [state] = useGlobalState();
  const getEntityName = useGetEntityNameText();

  const move = moves[learnableMove.move];

  const value =
    movepoolType === 'tech'
      ? moveOptions.find((o) => o.value === learnableMove.move) || {
          value: learnableMove.move,
          label: getSafeName(move, t, getEntityName),
        }
      : {
          value: learnableMove.move,
          label: getSafeName(move, t, getEntityName),
        };

  return (
    <RenderMoveContainer gap="8px">
      <SelectCustom
        options={moveOptions}
        value={value}
        error={error || !move}
        noOptionsText={t('no_move_found')}
        onChange={(selected) => onEdit(selected.value as DbSymbol, index)}
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
        <DeleteButtonOnlyIcon onClick={() => onDelete(index)} />
      </div>
    </RenderMoveContainer>
  );
};

export const MovepoolTable = ({ movepoolType, importation, disabledImport, disabledAdd }: MovepoolTableProps) => {
  const { projectDataValues: moves } = useProjectDataReadonly('moves', 'move');
  const { projectDataValues: types } = useProjectDataReadonly('types', 'type');
  const { projectDataValues: items } = useProjectDataReadonly('items', 'item');
  const {
    projectDataValues: pokemon,
    selectedDataIdentifier: pokemonIdentifier,
    setProjectDataValues: setPokemon,
    state,
  } = useProjectData('pokemon', 'pokemon');
  const dialogsRef = useDialogsRef<'multiple_add'>();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastAddedRef = useRef<HTMLDivElement>(null);
  const [highlightedMoves, setHighlightedMoves] = useState<Set<string>>(new Set());
  const [alreadyHighlightedMoves, setAlreadyHighlightedMoves] = useState<Set<string>>(new Set());
  const { t } = useTranslation();
  const getEntityName = useGetEntityNameText();
  const currentEditedPokemon = useMemo(() => cloneEntity(pokemon[pokemonIdentifier.specie]), [pokemon, pokemonIdentifier.specie]);
  const form = useMemo(
    () => currentEditedPokemon.forms.find((form) => form.form === pokemonIdentifier.form) || currentEditedPokemon.forms[0],
    [currentEditedPokemon.forms, pokemonIdentifier.form],
  );
  const [latestAdded, setLatestAdded] = useState<StudioLearnableMove[]>([]);
  const movepoolData = useMemo(() => {
    const allMoves = getMovepoolData(movepoolType, moves, items, form, t, getEntityName);
    const latestAddedMoves = new Set(latestAdded.map((m) => m.move));
    return allMoves.filter((move) => !latestAddedMoves.has(move.move));
  }, [movepoolType, moves, items, form, t, getEntityName, latestAdded]);
  const occurrences = getOccurrences(form, movepoolType);

  const moveOptions = useMemo(
    () =>
      movepoolType === 'tech'
        ? getMoveTechOptions(items, moves, t, getEntityName)
        : getSelectDataOptionsOrderedById(state.projectData, 'moves', getEntityName),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [movepoolType, state.projectData],
  );

  const moveNotSelectedOptions = useMemo(() => {
    return moveOptions.filter((option) => !movepoolData.some((m) => m.move === option.value) && !latestAdded.some((m) => m.move === option.value));
  }, [moveOptions, movepoolData, latestAdded, movepoolType]);

  const [selectedToAdd, setSelectedToAdd] = useState<SelectOption | null>(moveNotSelectedOptions[0]);

  const onAddSelectedMove = () => {
    if (!selectedToAdd) return;
    setLatestAdded([...latestAdded, { klass: getMoveKlass(movepoolType), move: selectedToAdd.value as DbSymbol }]);

    // Sélectionner la suivante dans la liste actuelle
    const currentIndex = moveNotSelectedOptions.findIndex((option) => option.value === selectedToAdd.value);

    const nextIndex = currentIndex + 1;
    if (nextIndex < moveNotSelectedOptions.length) {
      setSelectedToAdd(moveNotSelectedOptions[nextIndex]);
    } else {
      // Si c'était la dernière, sélectionner la première ou null
      setSelectedToAdd(moveNotSelectedOptions[0] || null);
    }
  };

  useEffect(() => {
    const listener = () => setLatestAdded([]);
    window.addEventListener('project-saved', listener);
    return () => window.removeEventListener('project-saved', listener);
  }, []);

  // Référence pour tracker le Pokémon et la forme actuels
  const previousPokemonRef = useRef<{ specie: string; form: number }>({
    specie: pokemonIdentifier.specie,
    form: pokemonIdentifier.form,
  });
  const previousMovepoolTypeRef = useRef<MovepoolTableType>(movepoolType);

  useEffect(() => {
    const hasChanged = previousPokemonRef.current.specie !== pokemonIdentifier.specie || previousPokemonRef.current.form !== pokemonIdentifier.form;
    const hasMovepoolTypeChanged = previousMovepoolTypeRef.current !== movepoolType;

    // Si le movepoolType change, vider latestAdded AVANT de faire quoi que ce soit
    if (hasMovepoolTypeChanged) {
      setLatestAdded([]);
      previousMovepoolTypeRef.current = movepoolType;
      return; // Important: sortir ici pour ne pas synchroniser
    }

    if (hasChanged && latestAdded.length > 0) {
      // Nettoyer latestAdded quand on change de Pokémon/forme
      setLatestAdded([]);
      // Mettre à jour la référence
      previousPokemonRef.current = {
        specie: pokemonIdentifier.specie,
        form: pokemonIdentifier.form,
      };
      return;
    }

    if (hasChanged) {
      previousPokemonRef.current = {
        specie: pokemonIdentifier.specie,
        form: pokemonIdentifier.form,
      };
    }

    // Ne mettre à jour le moveSet que si on est sur le même Pokémon && qu'aucun move n'ait été ajouté
    if (!hasChanged && latestAdded.length !== 0) {
      const index = currentEditedPokemon.forms.findIndex((form) => form.form === pokemonIdentifier.form);
      const clonedPokemon = cloneEntity(pokemon[pokemonIdentifier.specie]);
      const currentEditedForm = clonedPokemon.forms[index === -1 ? 0 : index];

      const otherMoves = currentEditedForm.moveSet.filter((m) => m.klass !== getMoveKlass(movepoolType));
      currentEditedForm.moveSet = [...otherMoves, ...movepoolData, ...latestAdded];

      setPokemon({ [pokemonIdentifier.specie]: clonedPokemon });

      // Mettre à jour la référence à la fin
      previousPokemonRef.current = {
        specie: pokemonIdentifier.specie,
        form: pokemonIdentifier.form,
      };
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestAdded, movepoolData.length, pokemonIdentifier.specie, pokemonIdentifier.form, movepoolType]);

  const handleDeleteMove = (indexToRemove: number) => {
    const updatedLatestAdded = latestAdded.filter((_, i) => i !== indexToRemove);
    // Mettre à jour le state local
    setLatestAdded(updatedLatestAdded);

    // Mettre à jour le pokemon dans le state global
    const index = currentEditedPokemon.forms.findIndex((form) => form.form === pokemonIdentifier.form);
    const clonedPokemon = cloneEntity(pokemon[pokemonIdentifier.specie]);
    const currentEditedForm = clonedPokemon.forms[index === -1 ? 0 : index];

    const otherMoves = currentEditedForm.moveSet.filter((m) => m.klass !== getMoveKlass(movepoolType));
    currentEditedForm.moveSet = [...otherMoves, ...movepoolData, ...updatedLatestAdded];
    setPokemon({ [pokemonIdentifier.specie]: clonedPokemon });
  };

  const handleEditMove = (selected: DbSymbol, indexToEdit: number) => {
    const updatedLatestAdded = latestAdded.map((m, i) => (i === indexToEdit ? { ...m, move: selected as DbSymbol } : m));
    setLatestAdded(updatedLatestAdded);
    const index = currentEditedPokemon.forms.findIndex((form) => form.form === pokemonIdentifier.form);
    const clonedPokemon = cloneEntity(pokemon[pokemonIdentifier.specie]);
    const currentEditedForm = clonedPokemon.forms[index === -1 ? 0 : index];
    const otherMoves = currentEditedForm.moveSet.filter((m) => m.klass !== getMoveKlass(movepoolType));
    currentEditedForm.moveSet = [...otherMoves, ...movepoolData, ...updatedLatestAdded];
    setPokemon({ [pokemonIdentifier.specie]: clonedPokemon });
  };

  useEffect(() => {
    if (latestAdded.length > 0) {
      requestAnimationFrame(() => {
        if (lastAddedRef.current && scrollContainerRef.current) {
          lastAddedRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          });
        }
        const newHighlights = new Set(latestAdded.map((m) => `${m.move}-${m.klass}`).filter((key) => !alreadyHighlightedMoves.has(key)));

        setHighlightedMoves(newHighlights);
        setAlreadyHighlightedMoves((prev) => new Set([...prev, ...newHighlights]));
        // Désactiver après 2 secondes
        setTimeout(() => {
          setHighlightedMoves(new Set());
        }, 2000);
      });
    }
  }, [latestAdded]);

  return (
    <DataMoveTable>
      {movepoolData.length === 0 && latestAdded.length === 0 ? (
        <NoMoveFound>{t('no_move_found')}</NoMoveFound>
      ) : (
        <>
          <DataMoveGrid gap="8px" className="header">
            <span>{t('move')}</span>
            <span>{t('type')}</span>
            <span>{t('category')}</span>
            <span>{t('pp')}</span>
            <span>{t('power')}</span>
            <span>{t('accuracy')}</span>
          </DataMoveGrid>
          <ScrollableContent ref={scrollContainerRef}>
            {movepoolData.map((learnableMove, index) => (
              <RenderEditMove
                key={`${learnableMove}-${index}`}
                learnableMove={learnableMove}
                index={index}
                moves={moves}
                types={types}
                movepoolType={movepoolType}
                moveOptions={moveOptions}
                error={(occurrences.find((o) => o.dbSymbol === learnableMove.move)?.occurrence || 1) > 1}
                onEdit={(move, i) => {
                  setPokemon({
                    [pokemonIdentifier.specie]: editMove(i, movepoolData, currentEditedPokemon, move),
                  });
                }}
                onDelete={(i) => {
                  setPokemon({
                    [pokemonIdentifier.specie]: deleteMove(i, movepoolData, pokemonIdentifier, currentEditedPokemon, movepoolType),
                  });
                }}
              />
            ))}
            {latestAdded.length !== 0 && (
              <LastAddedMovesContainer>
                <div className="last-added-header">
                  <span>{t('last_added_moves', { defaultValue: 'Last added' })}</span>
                </div>
                {latestAdded.map((pending, index) => {
                  const isError = [...movepoolData, ...latestAdded].filter((m) => m.move === pending.move).length > 1 || !moves[pending.move];
                  const isLastItem = index === latestAdded.length - 1;
                  const moveKey = `${pending.move}-${pending.klass}`;
                  const shouldHighlight = highlightedMoves.has(moveKey);

                  return (
                    <HighlightWrapper
                      key={`pending-${pending.move}-${index}`}
                      ref={isLastItem ? lastAddedRef : null}
                      shouldHighlight={shouldHighlight}
                    >
                      <RenderEditMove
                        key={`pending-${pending.move}-${index}`}
                        learnableMove={pending}
                        index={index}
                        moves={moves}
                        types={types}
                        movepoolType={movepoolType}
                        moveOptions={moveNotSelectedOptions}
                        error={isError}
                        onEdit={(move, i) => handleEditMove(move, i)}
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
          <SelectCustom
            options={moveNotSelectedOptions}
            onChange={(selected) => setSelectedToAdd(selected)}
            noOptionsText={t('no_move_found')}
            value={selectedToAdd || undefined}
          />
          <PrimaryButton onClick={onAddSelectedMove} data-tooltip={t('add_move')} disabled={!selectedToAdd || disabledAdd}>
            {t('add_move')}
          </PrimaryButton>
        </AddMoveContainer>
        <ButtonRightContainer>
          <SecondaryButtonWithPlusIconResponsive
            onClick={() => dialogsRef.current?.openDialog('multiple_add')}
            data-tooltip={t('add_move_multiple')}
            disabled={disabledAdd || false}
          >
            {t('add_move_multiple')}
          </SecondaryButtonWithPlusIconResponsive>
          {importation && (
            <DarkButtonImportResponsive data-tooltip={importation.label} onClick={importation.onClick} disabled={disabledImport || false}>
              {t('movepool_import')}
            </DarkButtonImportResponsive>
          )}
        </ButtonRightContainer>
      </ButtonContainer>
      <SelectEditorOverlay ref={dialogsRef} type={movepoolType} moves={moveNotSelectedOptions} setLastAddedMoves={setLatestAdded} />
    </DataMoveTable>
  );
};
