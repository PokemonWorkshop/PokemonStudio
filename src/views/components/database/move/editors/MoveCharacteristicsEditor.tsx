import React from 'react';
import { Editor, useRefreshUI } from '@components/editor';
import MoveModel from '@modelEntities/move/Move.model';
import { useTranslation } from 'react-i18next';
import { InputContainer, InputWithLeftLabelContainer, Label, Toggle } from '@components/inputs';
import styled from 'styled-components';

type MoveCharacteristicsEditorProps = {
  move: MoveModel;
};

const CharactericticsInfo = styled.div`
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text400};
  user-select: none;
`;

export const MoveCharacteristicsEditor = ({ move }: MoveCharacteristicsEditorProps) => {
  const { t } = useTranslation(['database_moves']);
  const refreshUI = useRefreshUI();

  return (
    <Editor type="edit" title={t('database_moves:characteristics')}>
      <InputContainer size="s">
        <CharactericticsInfo>{t('database_moves:characteristics_info')}</CharactericticsInfo>
        <InputWithLeftLabelContainer>
          <Label htmlFor="contact">{t('database_moves:description_contact')}</Label>
          <Toggle name="contact" checked={move.isDirect} onChange={(event) => refreshUI((move.isDirect = event.target.checked))} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="distance">{t('database_moves:description_distance')}</Label>
          <Toggle name="distance" checked={move.isDistance} onChange={(event) => refreshUI((move.isDistance = event.target.checked))} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="blocable">{t('database_moves:description_blocable')}</Label>
          <Toggle name="blocable" checked={move.isBlocable} onChange={(event) => refreshUI((move.isBlocable = event.target.checked))} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="authentic">{t('database_moves:description_authentic')}</Label>
          <Toggle name="authentic" checked={move.isAuthentic} onChange={(event) => refreshUI((move.isAuthentic = event.target.checked))} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="king_rock">{t('database_moves:description_king_rock')}</Label>
          <Toggle
            name="king_rock"
            checked={move.isKingRockUtility}
            onChange={(event) => refreshUI((move.isKingRockUtility = event.target.checked))}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="magic_coat">{t('database_moves:description_magic_coat')}</Label>
          <Toggle
            name="magic_coat"
            checked={move.isMagicCoatAffected}
            onChange={(event) => refreshUI((move.isMagicCoatAffected = event.target.checked))}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="mirror_move">{t('database_moves:description_mirror_move')}</Label>
          <Toggle name="mirror_move" checked={move.isMirrorMove} onChange={(event) => refreshUI((move.isMirrorMove = event.target.checked))} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="snatchable">{t('database_moves:description_snatch')}</Label>
          <Toggle name="snatchable" checked={move.isSnatchable} onChange={(event) => refreshUI((move.isSnatchable = event.target.checked))} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="mental">{t('database_moves:description_mental')}</Label>
          <Toggle name="mental" checked={move.isMental} onChange={(event) => refreshUI((move.isMental = event.target.checked))} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="charge">{t('database_moves:description_charge')}</Label>
          <Toggle name="charge" checked={move.isCharge} onChange={(event) => refreshUI((move.isCharge = event.target.checked))} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="recharge">{t('database_moves:description_recharge')}</Label>
          <Toggle name="recharge" checked={move.isRecharge} onChange={(event) => refreshUI((move.isRecharge = event.target.checked))} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="sound">{t('database_moves:description_sound')}</Label>
          <Toggle name="sound" checked={move.isSoundAttack} onChange={(event) => refreshUI((move.isSoundAttack = event.target.checked))} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="bite">{t('database_moves:description_bite')}</Label>
          <Toggle name="bite" checked={move.isBite} onChange={(event) => refreshUI((move.isBite = event.target.checked))} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="ballistics">{t('database_moves:description_ballistics')}</Label>
          <Toggle name="ballistics" checked={move.isBallistics} onChange={(event) => refreshUI((move.isBallistics = event.target.checked))} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="pulse">{t('database_moves:description_pulse')}</Label>
          <Toggle name="pulse" checked={move.isPulse} onChange={(event) => refreshUI((move.isPulse = event.target.checked))} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="punch">{t('database_moves:description_punch')}</Label>
          <Toggle name="punch" checked={move.isPunch} onChange={(event) => refreshUI((move.isPunch = event.target.checked))} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="powder">{t('database_moves:description_powder')}</Label>
          <Toggle name="powder" checked={move.isPowder} onChange={(event) => refreshUI((move.isPowder = event.target.checked))} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="dance">{t('database_moves:description_dance')}</Label>
          <Toggle name="dance" checked={move.isDance} onChange={(event) => refreshUI((move.isDance = event.target.checked))} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="unfreeze">{t('database_moves:description_unfreeze')}</Label>
          <Toggle name="unfreeze" checked={move.isUnfreeze} onChange={(event) => refreshUI((move.isUnfreeze = event.target.checked))} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="heal">{t('database_moves:description_heal')}</Label>
          <Toggle name="heal" checked={move.isHeal} onChange={(event) => refreshUI((move.isHeal = event.target.checked))} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="gravity">{t('database_moves:description_gravity')}</Label>
          <Toggle name="gravity" checked={move.isGravity} onChange={(event) => refreshUI((move.isGravity = event.target.checked))} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="non_sky_battle">{t('database_moves:description_non_sky_battle')}</Label>
          <Toggle name="non_sky_battle" checked={move.isNonSkyBattle} onChange={(event) => refreshUI((move.isNonSkyBattle = event.target.checked))} />
        </InputWithLeftLabelContainer>
      </InputContainer>
    </Editor>
  );
};
