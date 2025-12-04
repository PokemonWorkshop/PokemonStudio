import React, { forwardRef, useState } from 'react';
import { Editor } from '@components/editor';
import { useTranslation } from 'react-i18next';
import { StudioMove } from '@modelEntities/move';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useMovePage } from '@hooks/usePage';
import { useUpdateMove } from './useUpdateMove';
import { DarkButton, PrimaryButton, SecondaryNoBackground } from '@components/buttons';
import PlusIcon from '@assets/icons/global/plus-icon2.svg';
import styled from 'styled-components';
import { InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectMove } from '@components/selects';
import { useProjectMoves } from '@src/hooks/useProjectData';
import { DbSymbol } from '@modelEntities/dbSymbol';

const ComboNewInfo = styled.div`
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text400};
  user-select: none;
`;

const ComboMovesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-top: 32px;
  padding-bottom: 24px;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 32px 0 0 0;
  gap: 8px;
`;

type MoveComboNewEditorProps = {
  closeDialog: () => void;
};

const getFirstDbSymbol = (moves: Record<string, StudioMove>, move: StudioMove, moveSymbols: DbSymbol[] = []) => {
  return Object.entries(moves)
    .map(([value, moveData]) => ({ value, index: moveData.id }))
    .filter((d) => d.value !== move.dbSymbol && !moveSymbols.includes(d.value as DbSymbol) && !move.comboMoves.includes(d.value as DbSymbol))
    .sort((a, b) => a.index - b.index)[0].value as DbSymbol;
};

export const MoveComboNewEditor = forwardRef<EditorHandlingClose, MoveComboNewEditorProps>(({ closeDialog }, ref) => {
  const { t } = useTranslation();
  const { move, moveName } = useMovePage();
  const updateMove = useUpdateMove(move);
  const { projectDataValues: moves } = useProjectMoves();
  const [moveSymbols, setMoveSymbols] = useState<DbSymbol[]>([getFirstDbSymbol(moves, move)]);

  const onClickNew = () => {
    updateMove({ comboMoves: [...new Set([...moveSymbols, ...move.comboMoves])].filter((m) => m !== '__undef__') });
    closeDialog();
  };

  const addMoveSelect = () => {
    setMoveSymbols([...moveSymbols, getFirstDbSymbol(moves, move, moveSymbols)]);
  };

  const addMove = (newSymbol: DbSymbol, index: number) => {
    const nextMoveSymbols = moveSymbols
      .map((oldSymbol, i) => {
        if (i === index) {
          return newSymbol;
        } else {
          return oldSymbol;
        }
      })
      .filter((symbol) => symbol !== '__undef__');

    setMoveSymbols(nextMoveSymbols);
  };

  useEditorHandlingClose(ref);

  return (
    <Editor type="edit" title={t('contest_combo_moves')}>
      <ComboNewInfo>{t('combo_new_info', { move: moveName })}</ComboNewInfo>
      <ComboMovesContainer>
        {moveSymbols.map((dbSymbol, index) => (
          <InputWithTopLabelContainer key={index}>
            <Label htmlFor="combo-move">{t('move_with_number', { id: index + 1 })}</Label>
            {index === 0 ? (
              <SelectMove dbSymbol={dbSymbol} onChange={(dbSymbol) => addMove(dbSymbol as DbSymbol, index)} noLabel />
            ) : (
              <SelectMove dbSymbol={dbSymbol} onChange={(dbSymbol) => addMove(dbSymbol as DbSymbol, index)} noLabel undefValueOption={t('none')} />
            )}
          </InputWithTopLabelContainer>
        ))}
      </ComboMovesContainer>
      <SecondaryNoBackground onClick={() => addMoveSelect()}>
        <PlusIcon />
        <span>{t('add_another_move')}</span>
      </SecondaryNoBackground>
      <ButtonContainer>
        <PrimaryButton onClick={onClickNew}>{moveSymbols.length > 1 ? t('add_multiple_moves') : t('add_one_move')}</PrimaryButton>
        <DarkButton onClick={closeDialog}>{t('cancel')}</DarkButton>
      </ButtonContainer>
    </Editor>
  );
});
MoveComboNewEditor.displayName = 'MoveComboNewEditor';
