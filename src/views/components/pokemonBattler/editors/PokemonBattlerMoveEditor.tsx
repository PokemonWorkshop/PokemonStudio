import React from 'react';
import { RecordExpandPokemonSetup } from './usePokemonBattler';
import { useTranslation } from 'react-i18next';
import { InputGroupCollapse } from '@components/inputs/InputContainerCollapse';
import { InputWithTopLabelContainer, Label } from '@components/inputs';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { SelectMoveBattler } from '@components/selects';
import { cloneEntity } from '@utils/cloneEntity';

type PokemonBattlerMoveEditorProps = {
  expandPokemonSetup: RecordExpandPokemonSetup;
  updateExpandPokemonSetup: (updates: Partial<RecordExpandPokemonSetup>) => void;
  collapseByDefault: boolean;
};

export const PokemonBattlerMoveEditor = ({ expandPokemonSetup, updateExpandPokemonSetup, collapseByDefault }: PokemonBattlerMoveEditorProps) => {
  const { t } = useTranslation(['pokemon_battler_list', 'database_moves']);
  const moves = expandPokemonSetup.moves as DbSymbol[];

  return (
    <InputGroupCollapse title={t(`pokemon_battler_list:moves_title`)} gap="16px" collapseByDefault={collapseByDefault || undefined}>
      {moves.map((move, index) => (
        <InputWithTopLabelContainer key={`${move}-${index}`}>
          <Label htmlFor={`move-${index}`}>{t('pokemon_battler_list:move', { id: index + 1 })}</Label>
          <SelectMoveBattler
            dbSymbol={move}
            onChange={(dbSymbol) => {
              const updatedMoves = cloneEntity(moves);
              updatedMoves[index] = dbSymbol as DbSymbol;
              updateExpandPokemonSetup({ moves: updatedMoves });
            }}
            noLabel
          />
        </InputWithTopLabelContainer>
      ))}
    </InputGroupCollapse>
  );
};
