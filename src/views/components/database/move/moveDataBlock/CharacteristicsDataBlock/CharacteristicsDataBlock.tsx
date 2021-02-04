import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { MoveDataBlock } from '../MoveDataBlock';
import { CharacteristicsDataBlockFieldsetField } from './CharacteristicDataBlockFieldsetField';
import { CharacteristicsDataBlockProps } from './CharacteristicsDataBlockPropsInterface';

export const CharacteristicsDataBlock: FunctionComponent<CharacteristicsDataBlockProps> = (
  props: CharacteristicsDataBlockProps
) => {
  const { move } = props;
  const { t } = useTranslation('database_moves');

  function authentic() {
    if (move?.isAuthentic)
      return <CharacteristicsDataBlockFieldsetField name={t('authentic')} />;
    return undefined;
  }

  function ballistics() {
    if (move?.isBallistics)
      return <CharacteristicsDataBlockFieldsetField name={t('ballistics')} />;
    return undefined;
  }

  function bite() {
    if (move?.isBite)
      return <CharacteristicsDataBlockFieldsetField name={t('bite')} />;
    return undefined;
  }

  function blocable() {
    if (move?.isBlocable)
      return <CharacteristicsDataBlockFieldsetField name={t('blocable')} />;
    return undefined;
  }

  function charge() {
    if (move?.isCharge)
      return <CharacteristicsDataBlockFieldsetField name={t('charge')} />;
    return undefined;
  }

  function dance() {
    if (move?.isDance)
      return <CharacteristicsDataBlockFieldsetField name={t('dance')} />;
    return undefined;
  }

  function direct() {
    if (move?.isDirect)
      return <CharacteristicsDataBlockFieldsetField name={t('contact')} />;
    return undefined;
  }

  function distance() {
    if (move?.isDistance)
      return <CharacteristicsDataBlockFieldsetField name={t('distance')} />;
    return undefined;
  }

  function gravity() {
    if (move?.isGravity)
      return <CharacteristicsDataBlockFieldsetField name={t('gravity')} />;
    return undefined;
  }

  function heal() {
    if (move?.isHeal)
      return <CharacteristicsDataBlockFieldsetField name={t('heal')} />;
    return undefined;
  }

  function kingRock() {
    if (move?.isKingRockUtility)
      return <CharacteristicsDataBlockFieldsetField name={t('king_rock')} />;
    return undefined;
  }

  function magicCoat() {
    if (move?.isMagicCoatAffected)
      return <CharacteristicsDataBlockFieldsetField name={t('magic_coat')} />;
    return undefined;
  }

  function mental() {
    if (move?.isMental)
      return <CharacteristicsDataBlockFieldsetField name={t('mental')} />;
    return undefined;
  }

  function mirrorMove() {
    if (move?.isMirrorMove)
      return <CharacteristicsDataBlockFieldsetField name={t('mirror_move')} />;
    return undefined;
  }

  function nonSkyBattle() {
    if (move?.isNonSkyBattle)
      return (
        <CharacteristicsDataBlockFieldsetField name={t('non_sky_battle')} />
      );
    return undefined;
  }

  function pulse() {
    if (move?.isPulse)
      return <CharacteristicsDataBlockFieldsetField name={t('pulse')} />;
    return undefined;
  }

  function punch() {
    if (move?.isPunch)
      return <CharacteristicsDataBlockFieldsetField name={t('punch')} />;
    return undefined;
  }

  function snatch() {
    if (move?.isSnatchable)
      return <CharacteristicsDataBlockFieldsetField name={t('snatch')} />;
    return undefined;
  }

  function sound() {
    if (move?.isSoundAttack)
      return <CharacteristicsDataBlockFieldsetField name={t('sound')} />;
    return undefined;
  }

  function unfreeze() {
    if (move?.isUnfreeze)
      return <CharacteristicsDataBlockFieldsetField name={t('unfreeze')} />;
    return undefined;
  }

  return (
    <MoveDataBlock title={t('characteristics')} size="xl">
      <div>
        {authentic()}
        {ballistics()}
        {bite()}
        {blocable()}
        {charge()}
        {dance()}
        {direct()}
        {distance()}
        {gravity()}
        {heal()}
        {kingRock()}
        {magicCoat()}
        {mental()}
      </div>
      <div>
        {mirrorMove()}
        {nonSkyBattle()}
        {pulse()}
        {punch()}
        {snatch()}
        {sound()}
        {unfreeze()}
      </div>
    </MoveDataBlock>
  );
};
