import React, { forwardRef } from 'react';
import { Editor } from '@components/editor';
import { useTranslation } from 'react-i18next';
import { MOVE_VALIDATOR } from '@modelEntities/move';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useMovePage } from '@hooks/usePage';
import { useUpdateMove } from './useUpdateMove';
import { useZodForm } from '@hooks/useZodForm';
import { SecondaryNoBackground } from '@components/buttons';
import PlusIcon from '@assets/icons/global/plus-icon2.svg';
import styled from 'styled-components';
import { InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectMove } from '@components/selects';

const ComboNewInfo = styled.div`
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text400};
  user-select: none;
`;

const COMBO_EDITOR_SCHEMA = MOVE_VALIDATOR.pick({
  comboMoves: true,
});

export const MoveComboNewEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation();
  const { move, moveName } = useMovePage();
  const updateMove = useUpdateMove(move);
  const { canClose: canZodClose, getFormData } = useZodForm(COMBO_EDITOR_SCHEMA, move);

  const canClose = () => {
    if (!canZodClose()) return false;

    const formData = getFormData();
    if (!formData.success) return false;

    return true;
  };

  const onClose = () => {
    const result = canClose() && getFormData();

    if (result && result.success) {
      updateMove(result.data);
    }
  };

  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <Editor type="edit" title={t('contest_combo_moves')}>
      <ComboNewInfo>{t('combo_new_info', { move: moveName })}</ComboNewInfo>
      <InputWithTopLabelContainer>
        <Label htmlFor="quest">{t('import_combo_from')}</Label>
        <SelectMove dbSymbol={selectedMove} onChange={(dbSymbol) => setSelectedMove(dbSymbol)} noLabel />
      </InputWithTopLabelContainer>
      <SecondaryNoBackground onClick={() => {}}>
        <PlusIcon />
        <span>{t('add_another_move')}</span>
      </SecondaryNoBackground>
    </Editor>
  );
});
MoveComboNewEditor.displayName = 'MoveComboNewEditor';
