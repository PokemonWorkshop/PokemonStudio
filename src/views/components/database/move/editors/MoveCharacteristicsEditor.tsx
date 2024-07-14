import React, { forwardRef } from 'react';
import { Editor } from '@components/editor';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useMovePage } from '@hooks/usePage';
import { useUpdateMove } from './useUpdateMove';
import { MOVE_VALIDATOR } from '@modelEntities/move';
import { useZodForm } from '@hooks/useZodForm';
import { useInputAttrsWithLabel } from '@hooks/useInputAttrs';
import { InputFormContainer } from '@components/inputs/InputContainer';

const CharactericticsInfoContainer = styled.div`
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text400};
  user-select: none;
`;

const CHARACTERISTICS_EDITOR_SCHEMA = MOVE_VALIDATOR.pick({
  isAuthentic: true,
  isBallistics: true,
  isBite: true,
  isBlocable: true,
  isCharge: true,
  isDance: true,
  isDirect: true,
  isDistance: true,
  isEffectChance: true,
  isGravity: true,
  isHeal: true,
  isKingRockUtility: true,
  isMagicCoatAffected: true,
  isMental: true,
  isMirrorMove: true,
  isNonSkyBattle: true,
  isPowder: true,
  isPulse: true,
  isPunch: true,
  isRecharge: true,
  isSnatchable: true,
  isSoundAttack: true,
  isSlicingAttack: true,
  isUnfreeze: true,
  isWind: true,
});

export const MoveCharacteristicsEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation('database_moves');
  const { move } = useMovePage();
  const updateMove = useUpdateMove(move);
  const { canClose, getFormData, defaults, formRef } = useZodForm(CHARACTERISTICS_EDITOR_SCHEMA, move);
  const { Toggle } = useInputAttrsWithLabel(CHARACTERISTICS_EDITOR_SCHEMA, defaults);

  const onClose = () => {
    const result = canClose() && getFormData();
    if (result && result.success) updateMove(result.data);
  };

  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <Editor type="edit" title={t('characteristics')}>
      <InputFormContainer ref={formRef} size="s">
        <CharactericticsInfoContainer>{t('characteristics_info')}</CharactericticsInfoContainer>
        <Toggle name="isDirect" label={t('description_contact')} />
        <Toggle name="isDistance" label={t('description_distance')} />
        <Toggle name="isBlocable" label={t('description_blocable')} />
        <Toggle name="isAuthentic" label={t('description_authentic')} />
        <Toggle name="isKingRockUtility" label={t('description_king_rock')} />
        <Toggle name="isMagicCoatAffected" label={t('description_magic_coat')} />
        <Toggle name="isMirrorMove" label={t('description_mirror_move')} />
        <Toggle name="isSnatchable" label={t('description_snatch')} />
        <Toggle name="isMental" label={t('description_mental')} />
        <Toggle name="isCharge" label={t('description_charge')} />
        <Toggle name="isRecharge" label={t('description_recharge')} />
        <Toggle name="isSoundAttack" label={t('description_sound')} />
        <Toggle name="isSlicingAttack" label={t('description_slicing')} />
        <Toggle name="isBite" label={t('description_bite')} />
        <Toggle name="isBallistics" label={t('description_ballistics')} />
        <Toggle name="isPulse" label={t('description_pulse')} />
        <Toggle name="isPunch" label={t('description_punch')} />
        <Toggle name="isPowder" label={t('description_powder')} />
        <Toggle name="isWind" label={t('description_wind')} />
        <Toggle name="isDance" label={t('description_dance')} />
        <Toggle name="isUnfreeze" label={t('description_unfreeze')} />
        <Toggle name="isHeal" label={t('description_heal')} />
        <Toggle name="isGravity" label={t('description_gravity')} />
        <Toggle name="isNonSkyBattle" label={t('description_non_sky_battle')} />
      </InputFormContainer>
    </Editor>
  );
});
MoveCharacteristicsEditor.displayName = 'MoveCharacteristicsEditor';
