import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { DataBlockWithTitle } from '../dataBlocks';
import { StudioMove, StudioMoveContestEffectTag } from '@modelEntities/move';
import { MoveDialogsRef } from './editors/MoveEditorOverlay';
import { Tag } from '@components/Tag';

const MoveContestEffectsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const NoEffectsContainer = styled.span`
  ${({ theme }) => theme.fonts.normalRegular}
  color: ${({ theme }) => theme.colors.text500};
`;

type MoveContestEffectsProps = {
  move: StudioMove;
  dialogsRef: MoveDialogsRef;
};

export const MoveContestEffects = ({ move, dialogsRef }: MoveContestEffectsProps) => {
  const { t } = useTranslation();

  const hasContestEffect = (tag: StudioMoveContestEffectTag) => {
    return move.effectTags.includes(tag);
  };

  return (
    <DataBlockWithTitle size="half" title={t('contest_effects')} onClick={() => dialogsRef?.current?.openDialog('contest_effects')}>
      {move.effectTags.length > 0 ? (
        <MoveContestEffectsContainer>
          {hasContestEffect('cant_act_anymore') && <Tag>{t('cant_act_anymore')}</Tag>}
          {hasContestEffect('skip_next_turn') && <Tag>{t('skip_next_turn')}</Tag>}
          {hasContestEffect('jam_previous') && <Tag>{t('jam_previous')}</Tag>}
          {hasContestEffect('jam_all') && <Tag>{t('jam_all')}</Tag>}
          {hasContestEffect('jam_same_condition') && <Tag>{t('jam_same_condition')}</Tag>}
          {hasContestEffect('jam_highest_score') && <Tag>{t('jam_highest_score')}</Tag>}
          {hasContestEffect('more_nervous') && <Tag>{t('more_nervous')}</Tag>}
          {hasContestEffect('try_make_nervous') && <Tag>{t('try_make_nervous')}</Tag>}
          {hasContestEffect('compare_previous_appeal') && <Tag>{t('compare_previous_appeal')}</Tag>}
          {hasContestEffect('repeatable') && <Tag>{t('repeatable')}</Tag>}
          {hasContestEffect('raise_condition') && <Tag>{t('raise_condition')}</Tag>}
          {hasContestEffect('lower_others_condition') && <Tag>{t('lower_others_condition')}</Tag>}
          {hasContestEffect('cancel_others_combo') && <Tag>{t('cancel_others_combo')}</Tag>}
          {hasContestEffect('play_first_next_turn') && <Tag>{t('play_first_next_turn')}</Tag>}
          {hasContestEffect('play_last_next_turn') && <Tag>{t('play_last_next_turn')}</Tag>}
          {hasContestEffect('randomize_next_turn_order') && <Tag>{t('randomize_next_turn_order')}</Tag>}
          {hasContestEffect('very_exciting_first') && <Tag>{t('very_exciting_first')}</Tag>}
          {hasContestEffect('very_exciting_last') && <Tag>{t('very_exciting_last')}</Tag>}
          {hasContestEffect('lock_excitement') && <Tag>{t('lock_excitement')}</Tag>}
          {hasContestEffect('always_exciting') && <Tag>{t('always_exciting')}</Tag>}
          {hasContestEffect('can_reset_excitement') && <Tag>{t('can_reset_excitement')}</Tag>}
          {hasContestEffect('prevent_jam_one_time') && <Tag>{t('prevent_jam_one_time')}</Tag>}
          {hasContestEffect('prevent_jam_one_turn') && <Tag>{t('prevent_jam_one_turn')}</Tag>}
          {hasContestEffect('bonus_half_previous_appeals') && <Tag>{t('bonus_half_previous_appeals')}</Tag>}
          {hasContestEffect('copy_previous_appeal') && <Tag>{t('copy_previous_appeal')}</Tag>}
          {hasContestEffect('bonus_excitement') && <Tag>{t('bonus_excitement')}</Tag>}
          {hasContestEffect('random_appeal') && <Tag>{t('random_appeal')}</Tag>}
          {hasContestEffect('bonus_later') && <Tag>{t('bonus_later')}</Tag>}
          {hasContestEffect('bonus_earlier') && <Tag>{t('bonus_earlier')}</Tag>}
          {hasContestEffect('bonus_first') && <Tag>{t('bonus_first')}</Tag>}
          {hasContestEffect('bonus_last') && <Tag>{t('bonus_last')}</Tag>}
          {hasContestEffect('bonus_same_condition_previous') && <Tag>{t('bonus_same_condition_previous')}</Tag>}
          {hasContestEffect('bonus_raised_condition') && <Tag>{t('bonus_raised_condition')}</Tag>}
        </MoveContestEffectsContainer>
      ) : (
        <NoEffectsContainer>{t('no_contest_effects')}</NoEffectsContainer>
      )}
    </DataBlockWithTitle>
  );
};
