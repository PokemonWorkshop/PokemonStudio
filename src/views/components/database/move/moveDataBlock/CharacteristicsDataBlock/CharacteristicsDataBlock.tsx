import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataBlockWithTitle } from '../../../dataBlocks';
import { CharacteristicsDataBlockStyle, NoCharacteristic } from './CharacteristicsDataBlockStyle';
import { CharacteristicElement } from './CharacteristicElement';
import { MoveDataProps } from '../../MoveDataPropsInterface';
import { StudioMove } from '@modelEntities/move';

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

export const CharacteristicsDataBlock = ({ move, onClick }: MoveDataProps) => {
  const { t } = useTranslation(['database_moves']);

  return (
    <DataBlockWithTitle size="full" title={t('database_moves:characteristics')} onClick={onClick}>
      {atLeastOneCharacteristic(move) ? (
        <CharacteristicsDataBlockStyle>
          <CharacteristicElement label={t('database_moves:contact')} visible={move.isDirect} />
          <CharacteristicElement label={t('database_moves:distance')} visible={move.isDistance} />
          <CharacteristicElement label={t('database_moves:blocable')} visible={move.isBlocable} />
          <CharacteristicElement label={t('database_moves:authentic')} visible={move.isAuthentic} />
          <CharacteristicElement label={t('database_moves:king_rock')} visible={move.isKingRockUtility} />
          <CharacteristicElement label={t('database_moves:magic_coat')} visible={move.isMagicCoatAffected} />
          <CharacteristicElement label={t('database_moves:mirror_move')} visible={move.isMirrorMove} />
          <CharacteristicElement label={t('database_moves:snatch')} visible={move.isSnatchable} />
          <CharacteristicElement label={t('database_moves:mental')} visible={move.isMental} />
          <CharacteristicElement label={t('database_moves:charge')} visible={move.isCharge} />
          <CharacteristicElement label={t('database_moves:recharge')} visible={move.isRecharge} />
          <CharacteristicElement label={t('database_moves:sound')} visible={move.isSoundAttack} />
          <CharacteristicElement label={t('database_moves:bite')} visible={move.isBite} />
          <CharacteristicElement label={t('database_moves:ballistics')} visible={move.isBallistics} />
          <CharacteristicElement label={t('database_moves:pulse')} visible={move.isPulse} />
          <CharacteristicElement label={t('database_moves:punch')} visible={move.isPunch} />
          <CharacteristicElement label={t('database_moves:powder')} visible={move.isPowder} />
          <CharacteristicElement label={t('database_moves:dance')} visible={move.isDance} />
          <CharacteristicElement label={t('database_moves:unfreeze')} visible={move.isUnfreeze} />
          <CharacteristicElement label={t('database_moves:heal')} visible={move.isHeal} />
          <CharacteristicElement label={t('database_moves:gravity')} visible={move.isGravity} />
          <CharacteristicElement label={t('database_moves:non_sky_battle')} visible={move.isNonSkyBattle} />
        </CharacteristicsDataBlockStyle>
      ) : (
        <NoCharacteristic>{t('database_moves:no_characteristic')}</NoCharacteristic>
      )}
    </DataBlockWithTitle>
  );
};
