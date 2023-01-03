import React, { useMemo } from 'react';
import { useRefreshUI } from '@components/editor';
import { InputWithTopLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import { InputGroupCollapse } from '@components/inputs/InputContainerCollapse';
import { TFunction, useTranslation } from 'react-i18next';
import { SelectDataGeneric } from '@components/selects';
import { ProjectData } from '@src/GlobalStateProvider';
import { useProjectMoves } from '@utils/useProjectData';
import { useGetEntityNameText } from '@utils/ReadingProjectText';
import { createExpandPokemonSetup, StudioGroupEncounter } from '@modelEntities/groupEncounter';
import { DbSymbol } from '@modelEntities/dbSymbol';

const findOrCreateMoves = (battler: StudioGroupEncounter) => {
  const moves = battler.expandPokemonSetup.find((setup) => setup.type === 'moves');
  if (!moves) {
    const newMoves = createExpandPokemonSetup('moves');
    battler.expandPokemonSetup.push(newMoves);
    return newMoves;
  }
  return moves;
};

const getMoveOptions = (
  allMoves: ProjectData['moves'],
  t: TFunction<('pokemon_battler_list' | 'database_moves')[]>,
  getMoveName: ReturnType<typeof useGetEntityNameText>
) => [
  { value: '__remove__', label: t('pokemon_battler_list:none') },
  ...Object.values(allMoves)
    .sort((a, b) => a.id - b.id)
    .map((moveData) => ({ value: moveData.dbSymbol, label: getMoveName(moveData) })),
];

const getData = (
  move: string,
  allMoves: ProjectData['moves'],
  t: TFunction<('pokemon_battler_list' | 'database_moves')[]>,
  getMoveName: ReturnType<typeof useGetEntityNameText>
) => {
  const label =
    (allMoves[move] && getMoveName(allMoves[move])) || (move === '__remove__' ? t('pokemon_battler_list:none') : t('database_moves:move_deleted'));
  return { value: move, label };
};

type PokemonBattlerListMoveEditorProps = {
  battler: StudioGroupEncounter;
  collapseByDefault: boolean;
};

export const PokemonBattlerListMoveEditor = ({ battler, collapseByDefault }: PokemonBattlerListMoveEditorProps) => {
  const { t } = useTranslation(['pokemon_battler_list', 'database_moves']);
  const moves = findOrCreateMoves(battler);
  const { projectDataValues: movesData } = useProjectMoves();
  const getMoveName = useGetEntityNameText();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const moveOptions = useMemo(() => getMoveOptions(movesData, t, getMoveName), [movesData]);
  const refreshUI = useRefreshUI();

  return (
    <InputGroupCollapse title={t(`pokemon_battler_list:moves_title`)} gap="24px" collapseByDefault={collapseByDefault || undefined}>
      {moves.type === 'moves' && (
        <PaddedInputContainer size="s">
          {moves.value.map((move, index) => (
            <InputWithTopLabelContainer key={`${move}-${index}`}>
              <Label htmlFor={`move-${index}`}>{t('pokemon_battler_list:move', { id: index + 1 })}</Label>
              <SelectDataGeneric
                data={getData(move, movesData, t, getMoveName)}
                options={moveOptions}
                onChange={(selected) => refreshUI((moves.value[index] = selected.value as DbSymbol))}
                noOptionsText={t('database_moves:no_option')}
                error={!movesData[move] && move !== '__undef__' && move !== '__remove__'}
                noneValue
                overwriteNoneValue={t('pokemon_battler_list:by_default')}
              />
            </InputWithTopLabelContainer>
          ))}
        </PaddedInputContainer>
      )}
    </InputGroupCollapse>
  );
};
