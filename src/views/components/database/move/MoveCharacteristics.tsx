import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { DataBlockWithTitle } from '../dataBlocks';
import { StudioMove } from '@modelEntities/move';
import { MoveDialogsRef } from './editors/MoveEditorOverlay';
import { Tag } from '@components/Tag';

const MoveCharacteristicsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const NoCharacteristicContainer = styled.span`
  ${({ theme }) => theme.fonts.normalRegular}
  color: ${({ theme }) => theme.colors.text500};
`;

const atLeastOneCharacteristic = (move: StudioMove) => {
  return (
    move.isDirect ||
    move.isDistance ||
    move.isBlocable ||
    move.isAuthentic ||
    move.isKingRockUtility ||
    move.isMagicCoatAffected ||
    move.isMirrorMove ||
    move.isSnatchable ||
    move.isMental ||
    move.isCharge ||
    move.isRecharge ||
    move.isSoundAttack ||
    move.isBite ||
    move.isBallistics ||
    move.isPulse ||
    move.isPunch ||
    move.isPowder ||
    move.isDance ||
    move.isUnfreeze ||
    move.isHeal ||
    move.isGravity ||
    move.isNonSkyBattle
  );
};

type MoveCharacteristicsProps = {
  move: StudioMove;
  dialogsRef: MoveDialogsRef;
};

export const MoveCharacteristics = ({ move, dialogsRef }: MoveCharacteristicsProps) => {
  const { t } = useTranslation('database_moves');

  return (
    <DataBlockWithTitle size="full" title={t('characteristics')} onClick={() => dialogsRef?.current?.openDialog('characteristics')}>
      {atLeastOneCharacteristic(move) ? (
        <MoveCharacteristicsContainer>
          {move.isDirect && <Tag>{t('contact')}</Tag>}
          {move.isDistance && <Tag>{t('distance')}</Tag>}
          {move.isBlocable && <Tag>{t('blocable')}</Tag>}
          {move.isAuthentic && <Tag>{t('authentic')}</Tag>}
          {move.isKingRockUtility && <Tag>{t('king_rock')}</Tag>}
          {move.isMagicCoatAffected && <Tag>{t('magic_coat')}</Tag>}
          {move.isMirrorMove && <Tag>{t('mirror_move')}</Tag>}
          {move.isSnatchable && <Tag>{t('snatch')}</Tag>}
          {move.isMental && <Tag>{t('mental')}</Tag>}
          {move.isCharge && <Tag>{t('charge')}</Tag>}
          {move.isRecharge && <Tag>{t('recharge')}</Tag>}
          {move.isSoundAttack && <Tag>{t('sound')}</Tag>}
          {move.isBite && <Tag>{t('bite')}</Tag>}
          {move.isBallistics && <Tag>{t('ballistics')}</Tag>}
          {move.isPulse && <Tag>{t('pulse')}</Tag>}
          {move.isPunch && <Tag>{t('punch')}</Tag>}
          {move.isPowder && <Tag>{t('powder')}</Tag>}
          {move.isDance && <Tag>{t('dance')}</Tag>}
          {move.isUnfreeze && <Tag>{t('unfreeze')}</Tag>}
          {move.isHeal && <Tag>{t('heal')}</Tag>}
          {move.isGravity && <Tag>{t('gravity')}</Tag>}
          {move.isNonSkyBattle && <Tag>{t('non_sky_battle')}</Tag>}
        </MoveCharacteristicsContainer>
      ) : (
        <NoCharacteristicContainer>{t('no_characteristic')}</NoCharacteristicContainer>
      )}
    </DataBlockWithTitle>
  );
};
