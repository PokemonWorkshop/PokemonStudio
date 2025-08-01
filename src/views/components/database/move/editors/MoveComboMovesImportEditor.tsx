import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { Editor } from '@components/editor';
import { useTranslation } from 'react-i18next';
import { InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, Toggle } from '@components/inputs';
import styled from 'styled-components';
import { SelectMove } from '@components/selects';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { cloneEntity } from '@utils/cloneEntity';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useMovePage } from '@src/hooks/usePage';
import { useUpdateMove } from './useUpdateMove';
import { useProjectMoves } from '@src/hooks/useProjectData';

const ComboImportInfo = styled.div`
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text400};
  user-select: none;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0 0 0;
  gap: 8px;
`;

type MoveComboMovesImportEditorProps = {
  closeDialog: () => void;
};

export const MoveComboMovesImportEditor = forwardRef<EditorHandlingClose, MoveComboMovesImportEditorProps>(({ closeDialog }, ref) => {
  const { t } = useTranslation();
  const { move } = useMovePage();
  const { projectDataValues: moves } = useProjectMoves();
  const updateMove = useUpdateMove(move);
  const firstDbSymbol = useMemo(
    () =>
      Object.entries(moves)
        .map(([value, moveData]) => ({ value, index: moveData.id }))
        .filter((d) => d.value !== move.dbSymbol)
        .sort((a, b) => a.index - b.index)[0].value,
    [moves, move]
  );
  const [selectedMove, setSelectedMove] = useState(firstDbSymbol);
  const overrideRef = useRef<HTMLInputElement>(null);

  useEditorHandlingClose(ref);

  const onClickImport = () => {
    if (!overrideRef.current) return;

    if (overrideRef.current.checked) updateMove({ comboMoves: cloneEntity(moves[selectedMove].comboMoves) });
    else {
      const newCombos = [...move.comboMoves, ...cloneEntity(moves[selectedMove].comboMoves).filter((combo) => !move.comboMoves.includes(combo))];
      updateMove({ comboMoves: newCombos });
    }
    closeDialog();
  };

  return (
    <Editor type="combo_moves" title={t('import')}>
      <InputContainer size="m">
        <ComboImportInfo>{t('combo_import_info')}</ComboImportInfo>
        <InputWithTopLabelContainer>
          <Label htmlFor="quest">{t('import_combo_from')}</Label>
          <SelectMove dbSymbol={selectedMove} onChange={(dbSymbol) => setSelectedMove(dbSymbol)} noLabel />
        </InputWithTopLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="override">{t('replace_combos')}</Label>
          <Toggle name="override" ref={overrideRef} />
        </InputWithLeftLabelContainer>
        <ButtonContainer>
          <PrimaryButton onClick={onClickImport}>{t('to_import')}</PrimaryButton>
          <DarkButton onClick={closeDialog}>{t('cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
});
MoveComboMovesImportEditor.displayName = 'MoveComboMovesImportEditor';
