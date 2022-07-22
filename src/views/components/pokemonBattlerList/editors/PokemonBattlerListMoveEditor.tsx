import React, { useMemo } from 'react';
import { useRefreshUI } from '@components/editor';
import { InputWithTopLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import { InputGroupCollapse } from '@components/inputs/InputContainerCollapse';
import Encounter, { createExpandPokemonSetup } from '@modelEntities/Encounter';
import { TFunction, useTranslation } from 'react-i18next';
import { SelectDataGeneric } from '@components/selects';
import { ProjectData } from '@src/GlobalStateProvider';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { useProjectMoves } from '@utils/useProjectData';

const findOrCreateMoves = (battler: Encounter) => {
  const moves = battler.expandPokemonSetup.find((setup) => setup.type === 'moves');
  if (!moves) {
    const newMoves = createExpandPokemonSetup('moves');
    battler.expandPokemonSetup.push(newMoves);
    return newMoves;
  }
  return moves;
};

const getMoveOptions = (allMoves: ProjectData['moves'], t: TFunction<('pokemon_battler_list' | 'database_moves')[]>): SelectOption[] => {
  const moveOptions = Object.entries(allMoves)
    .map(([value, moveData]) => ({ value, label: moveData.name(), index: moveData.id }))
    .sort((a, b) => a.index - b.index)
    .map((data) => ({ value: data.value, label: data.label }));
  moveOptions.unshift({ value: '__remove__', label: t('pokemon_battler_list:none') });
  return moveOptions;
};

const getData = (move: string, allMoves: ProjectData['moves'], t: TFunction<('pokemon_battler_list' | 'database_moves')[]>): SelectOption => {
  const name = allMoves[move]?.name();
  return { value: move, label: name ? name : move === '__remove__' ? t('pokemon_battler_list:none') : t('database_moves:move_deleted') };
};

type PokemonBattlerListMoveEditorProps = {
  battler: Encounter;
  collapseByDefault: boolean;
};

export const PokemonBattlerListMoveEditor = ({ battler, collapseByDefault }: PokemonBattlerListMoveEditorProps) => {
  const { t } = useTranslation(['pokemon_battler_list', 'database_moves']);
  const moves = findOrCreateMoves(battler);
  const { projectDataValues: movesData } = useProjectMoves();
  const moveOptions = useMemo(() => getMoveOptions(movesData, t), [movesData, t]);
  const refreshUI = useRefreshUI();

  return (
    <InputGroupCollapse title={t(`pokemon_battler_list:moves_title`)} gap="24px" collapseByDefault={collapseByDefault || undefined}>
      {moves.type === 'moves' && (
        <PaddedInputContainer size="s">
          {moves.value.map((move, index) => (
            <InputWithTopLabelContainer key={`${move}-${index}`}>
              <Label htmlFor={`move-${index}`}>{t('pokemon_battler_list:move', { id: index + 1 })}</Label>
              <SelectDataGeneric
                data={getData(move, movesData, t)}
                options={moveOptions}
                onChange={(selected) => refreshUI((moves.value[index] = selected.value))}
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
