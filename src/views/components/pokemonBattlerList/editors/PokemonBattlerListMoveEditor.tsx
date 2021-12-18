import React from 'react';
import { useRefreshUI } from '@components/editor';
import { InputWithTopLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import { InputGroupCollapse } from '@components/inputs/InputContainerCollapse';
import Encounter, { createExpandPokemonSetup } from '@modelEntities/Encounter';
import { useTranslation } from 'react-i18next';
import { SelectMove } from '@components/selects';

const findOrCreateMoves = (battler: Encounter) => {
  const moves = battler.expandPokemonSetup.find((setup) => setup.type === 'moves');
  if (!moves) {
    const newMoves = createExpandPokemonSetup('moves');
    battler.expandPokemonSetup.push(newMoves);
    return newMoves;
  }
  return moves;
};

type PokemonBattlerListMoveEditorProps = {
  battler: Encounter;
  collapseByDefault: boolean;
};

export const PokemonBattlerListMoveEditor = ({ battler, collapseByDefault }: PokemonBattlerListMoveEditorProps) => {
  const { t } = useTranslation('pokemon_battler_list');
  const moves = findOrCreateMoves(battler);
  const refreshUI = useRefreshUI();

  return (
    <InputGroupCollapse title={t(`moves_title`)} gap="24px" collapseByDefault={collapseByDefault || undefined}>
      {moves.type === 'moves' && (
        <PaddedInputContainer size="s">
          {moves.value.map((move, index) => (
            <InputWithTopLabelContainer key={`${move}-${index}`}>
              <Label htmlFor={`move-${index}`}>{t('move', { id: index + 1 })}</Label>
              <SelectMove
                dbSymbol={move}
                onChange={(selected) => refreshUI((moves.value[index] = selected.value))}
                noLabel
                noneValue
                overwriteNoneValue={t('by_default')}
                noneValueIsError={false}
              />
            </InputWithTopLabelContainer>
          ))}
        </PaddedInputContainer>
      )}
    </InputGroupCollapse>
  );
};
