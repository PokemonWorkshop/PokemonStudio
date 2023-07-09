import React, { forwardRef, useRef } from 'react';
import { Editor } from '@components/editor';
import { useTranslation } from 'react-i18next';
import { InputContainer, InputWithLeftLabelContainer, Label, Toggle } from '@components/inputs';
import styled from 'styled-components';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useMovePage } from '@utils/usePage';
import { useUpdateMove } from './useUpdateMove';

const CharactericticsInfoContainer = styled.div`
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text400};
  user-select: none;
`;

export const MoveCharacteristicsEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation('database_moves');
  const { move } = useMovePage();
  const updateMove = useUpdateMove(move);
  const contactRef = useRef<HTMLInputElement>(null);
  const distanceRef = useRef<HTMLInputElement>(null);
  const blocableRef = useRef<HTMLInputElement>(null);
  const authenticRef = useRef<HTMLInputElement>(null);
  const kingRockRef = useRef<HTMLInputElement>(null);
  const magicCoatRef = useRef<HTMLInputElement>(null);
  const mirrorMoveRef = useRef<HTMLInputElement>(null);
  const snatchableRef = useRef<HTMLInputElement>(null);
  const mentalRef = useRef<HTMLInputElement>(null);
  const chargeRef = useRef<HTMLInputElement>(null);
  const rechargeRef = useRef<HTMLInputElement>(null);
  const soundRef = useRef<HTMLInputElement>(null);
  const slicingRef = useRef<HTMLInputElement>(null);
  const biteRef = useRef<HTMLInputElement>(null);
  const ballisticsRef = useRef<HTMLInputElement>(null);
  const pulseRef = useRef<HTMLInputElement>(null);
  const punchRef = useRef<HTMLInputElement>(null);
  const powderRef = useRef<HTMLInputElement>(null);
  const danceRef = useRef<HTMLInputElement>(null);
  const unfreezeRef = useRef<HTMLInputElement>(null);
  const windRef = useRef<HTMLInputElement>(null);
  const healRef = useRef<HTMLInputElement>(null);
  const gravityRef = useRef<HTMLInputElement>(null);
  const nonSkyBattleRef = useRef<HTMLInputElement>(null);

  const canClose = () => {
    if (!contactRef.current) return false;
    if (!distanceRef.current) return false;
    if (!blocableRef.current) return false;
    if (!authenticRef.current) return false;
    if (!kingRockRef.current) return false;
    if (!magicCoatRef.current) return false;
    if (!mirrorMoveRef.current) return false;
    if (!snatchableRef.current) return false;
    if (!mentalRef.current) return false;
    if (!chargeRef.current) return false;
    if (!rechargeRef.current) return false;
    if (!soundRef.current) return false;
    if (!slicingRef.current) return false;
    if (!biteRef.current) return false;
    if (!ballisticsRef.current) return false;
    if (!pulseRef.current) return false;
    if (!punchRef.current) return false;
    if (!powderRef.current) return false;
    if (!danceRef.current) return false;
    if (!unfreezeRef.current) return false;
    if (!windRef.current) return false;
    if (!healRef.current) return false;
    if (!gravityRef.current) return false;
    if (!nonSkyBattleRef.current) return false;

    return true;
  };

  const onClose = () => {
    if (
      !contactRef.current ||
      !distanceRef.current ||
      !blocableRef.current ||
      !authenticRef.current ||
      !kingRockRef.current ||
      !magicCoatRef.current ||
      !mirrorMoveRef.current ||
      !snatchableRef.current ||
      !mentalRef.current ||
      !chargeRef.current ||
      !rechargeRef.current ||
      !soundRef.current ||
      !slicingRef.current ||
      !biteRef.current ||
      !ballisticsRef.current ||
      !pulseRef.current ||
      !punchRef.current ||
      !powderRef.current ||
      !danceRef.current ||
      !unfreezeRef.current ||
      !windRef.current ||
      !healRef.current ||
      !gravityRef.current ||
      !nonSkyBattleRef.current ||
      !canClose()
    )
      return;

    updateMove({
      isDirect: contactRef.current.checked,
      isDistance: distanceRef.current.checked,
      isBlocable: blocableRef.current.checked,
      isAuthentic: authenticRef.current.checked,
      isKingRockUtility: kingRockRef.current.checked,
      isMagicCoatAffected: magicCoatRef.current.checked,
      isMirrorMove: mirrorMoveRef.current.checked,
      isSnatchable: snatchableRef.current.checked,
      isMental: mentalRef.current.checked,
      isCharge: chargeRef.current.checked,
      isRecharge: rechargeRef.current.checked,
      isSoundAttack: soundRef.current.checked,
      isSlicingAttack: slicingRef.current.checked,
      isBite: biteRef.current.checked,
      isBallistics: ballisticsRef.current.checked,
      isPulse: pulseRef.current.checked,
      isPunch: punchRef.current.checked,
      isPowder: powderRef.current.checked,
      isDance: danceRef.current.checked,
      isUnfreeze: unfreezeRef.current.checked,
      isWind: windRef.current.checked,
      isHeal: healRef.current.checked,
      isGravity: gravityRef.current.checked,
      isNonSkyBattle: nonSkyBattleRef.current.checked,
    });
  };

  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <Editor type="edit" title={t('characteristics')}>
      <InputContainer size="s">
        <CharactericticsInfoContainer>{t('characteristics_info')}</CharactericticsInfoContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="contact">{t('description_contact')}</Label>
          <Toggle name="contact" defaultChecked={move.isDirect} ref={contactRef} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="distance">{t('description_distance')}</Label>
          <Toggle name="distance" defaultChecked={move.isDistance} ref={distanceRef} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="blocable">{t('description_blocable')}</Label>
          <Toggle name="blocable" defaultChecked={move.isBlocable} ref={blocableRef} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="authentic">{t('description_authentic')}</Label>
          <Toggle name="authentic" defaultChecked={move.isAuthentic} ref={authenticRef} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="king_rock">{t('description_king_rock')}</Label>
          <Toggle name="king_rock" defaultChecked={move.isKingRockUtility} ref={kingRockRef} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="magic_coat">{t('description_magic_coat')}</Label>
          <Toggle name="magic_coat" defaultChecked={move.isMagicCoatAffected} ref={magicCoatRef} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="mirror_move">{t('description_mirror_move')}</Label>
          <Toggle name="mirror_move" defaultChecked={move.isMirrorMove} ref={mirrorMoveRef} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="snatchable">{t('description_snatch')}</Label>
          <Toggle name="snatchable" defaultChecked={move.isSnatchable} ref={snatchableRef} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="mental">{t('description_mental')}</Label>
          <Toggle name="mental" defaultChecked={move.isMental} ref={mentalRef} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="charge">{t('description_charge')}</Label>
          <Toggle name="charge" defaultChecked={move.isCharge} ref={chargeRef} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="recharge">{t('description_recharge')}</Label>
          <Toggle name="recharge" defaultChecked={move.isRecharge} ref={rechargeRef} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="sound">{t('description_sound')}</Label>
          <Toggle name="sound" defaultChecked={move.isSoundAttack} ref={soundRef} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="slicing">{t('description_slicing')}</Label>
          <Toggle name="slicing" defaultChecked={move.isSlicingAttack} ref={slicingRef} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="bite">{t('description_bite')}</Label>
          <Toggle name="bite" defaultChecked={move.isBite} ref={biteRef} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="ballistics">{t('description_ballistics')}</Label>
          <Toggle name="ballistics" defaultChecked={move.isBallistics} ref={ballisticsRef} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="pulse">{t('description_pulse')}</Label>
          <Toggle name="pulse" defaultChecked={move.isPulse} ref={pulseRef} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="punch">{t('description_punch')}</Label>
          <Toggle name="punch" defaultChecked={move.isPunch} ref={punchRef} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="powder">{t('description_powder')}</Label>
          <Toggle name="powder" defaultChecked={move.isPowder} ref={powderRef} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="wind">{t('description_wind')}</Label>
          <Toggle name="wind" defaultChecked={move.isWind} ref={windRef} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="dance">{t('description_dance')}</Label>
          <Toggle name="dance" defaultChecked={move.isDance} ref={danceRef} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="unfreeze">{t('description_unfreeze')}</Label>
          <Toggle name="unfreeze" defaultChecked={move.isUnfreeze} ref={unfreezeRef} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="heal">{t('description_heal')}</Label>
          <Toggle name="heal" defaultChecked={move.isHeal} ref={healRef} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="gravity">{t('description_gravity')}</Label>
          <Toggle name="gravity" defaultChecked={move.isGravity} ref={gravityRef} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="non_sky_battle">{t('description_non_sky_battle')}</Label>
          <Toggle name="non_sky_battle" defaultChecked={move.isNonSkyBattle} ref={nonSkyBattleRef} />
        </InputWithLeftLabelContainer>
      </InputContainer>
    </Editor>
  );
});
MoveCharacteristicsEditor.displayName = 'MoveCharacteristicsEditor';
