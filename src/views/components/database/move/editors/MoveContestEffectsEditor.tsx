import React, { forwardRef, useState } from 'react';
import { Editor } from '@components/editor';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useMovePage } from '@hooks/usePage';
import { useUpdateMove } from './useUpdateMove';
import { InputWithLeftLabelContainer, Label, Toggle } from '@components/inputs';
import { StudioMoveContestEffectTag } from '@modelEntities/move';

const ContestEffectsInfoContainer = styled.div`
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text400};
  user-select: none;
`;

const ContestEffectsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const MoveContestEffectsEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation();
  const { move } = useMovePage();
  const updateMove = useUpdateMove(move);
  const [effectTags, setEffectTags] = useState<StudioMoveContestEffectTag[]>(move.effectTags);

  const hasContestEffect = (tag: StudioMoveContestEffectTag) => {
    return effectTags.includes(tag);
  };

  const setContestEffect = (tag: StudioMoveContestEffectTag, value: boolean) => {
    const newTags = value ? [...effectTags, tag] : effectTags.filter((t) => t !== tag);
    setEffectTags(newTags);
  };

  const onClose = () => {
    updateMove({ effectTags: effectTags });
  };

  useEditorHandlingClose(ref, onClose);

  return (
    <Editor type="edit" title={t('characteristics')}>
      <ContestEffectsContainer>
        <ContestEffectsInfoContainer>{t('contest_effects_info')}</ContestEffectsInfoContainer>
        <ContestEffectsInfoContainer>{t('tooltip_info')}</ContestEffectsInfoContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="cant_act_anymore">{t('cant_act_anymore')}</Label>
          <Toggle
            name="cant_act_anymore"
            checked={hasContestEffect('cant_act_anymore')}
            onChange={(event) => setContestEffect('cant_act_anymore', event.target.checked)}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="skip_next_turn">{t('skip_next_turn')}</Label>
          <Toggle
            name="skip_next_turn"
            checked={hasContestEffect('skip_next_turn')}
            onChange={(event) => setContestEffect('skip_next_turn', event.target.checked)}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="jam_previous">{t('jam_previous')}</Label>
          <Toggle
            name="jam_previous"
            checked={hasContestEffect('jam_previous')}
            onChange={(event) => setContestEffect('jam_previous', event.target.checked)}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="jam_all">{t('jam_all')}</Label>
          <Toggle name="jam_all" checked={hasContestEffect('jam_all')} onChange={(event) => setContestEffect('jam_all', event.target.checked)} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="jam_same_condition">{t('jam_same_condition')}</Label>
          <Toggle
            name="jam_same_condition"
            checked={hasContestEffect('jam_same_condition')}
            onChange={(event) => setContestEffect('jam_same_condition', event.target.checked)}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="jam_highest_score">{t('jam_highest_score')}</Label>
          <Toggle
            name="jam_highest_score"
            checked={hasContestEffect('jam_highest_score')}
            onChange={(event) => setContestEffect('jam_highest_score', event.target.checked)}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="more_nervous">{t('more_nervous')}</Label>
          <Toggle
            name="more_nervous"
            checked={hasContestEffect('more_nervous')}
            onChange={(event) => setContestEffect('more_nervous', event.target.checked)}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="try_make_nervous">{t('try_make_nervous')}</Label>
          <Toggle
            name="try_make_nervous"
            checked={hasContestEffect('try_make_nervous')}
            onChange={(event) => setContestEffect('try_make_nervous', event.target.checked)}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="compare_previous_appeal">{t('compare_previous_appeal')}</Label>
          <Toggle
            name="compare_previous_appeal"
            checked={hasContestEffect('compare_previous_appeal')}
            onChange={(event) => setContestEffect('compare_previous_appeal', event.target.checked)}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="repeatable">{t('repeatable')}</Label>
          <Toggle
            name="repeatable"
            checked={hasContestEffect('repeatable')}
            onChange={(event) => setContestEffect('repeatable', event.target.checked)}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="raise_condition">{t('raise_condition')}</Label>
          <Toggle
            name="raise_condition"
            checked={hasContestEffect('raise_condition')}
            onChange={(event) => setContestEffect('raise_condition', event.target.checked)}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="lower_others_condition">{t('lower_others_condition')}</Label>
          <Toggle
            name="lower_others_condition"
            checked={hasContestEffect('lower_others_condition')}
            onChange={(event) => setContestEffect('lower_others_condition', event.target.checked)}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="cancel_others_combo">{t('cancel_others_combo')}</Label>
          <Toggle
            name="cancel_others_combo"
            checked={hasContestEffect('cancel_others_combo')}
            onChange={(event) => setContestEffect('cancel_others_combo', event.target.checked)}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="play_first_next_turn">{t('play_first_next_turn')}</Label>
          <Toggle
            name="play_first_next_turn"
            checked={hasContestEffect('play_first_next_turn')}
            onChange={(event) => setContestEffect('play_first_next_turn', event.target.checked)}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="play_last_next_turn">{t('play_last_next_turn')}</Label>
          <Toggle
            name="play_last_next_turn"
            checked={hasContestEffect('play_last_next_turn')}
            onChange={(event) => setContestEffect('play_last_next_turn', event.target.checked)}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="randomize_next_turn_order">{t('randomize_next_turn_order')}</Label>
          <Toggle
            name="randomize_next_turn_order"
            checked={hasContestEffect('randomize_next_turn_order')}
            onChange={(event) => setContestEffect('randomize_next_turn_order', event.target.checked)}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="very_exciting_first">{t('very_exciting_first')}</Label>
          <Toggle
            name="very_exciting_first"
            checked={hasContestEffect('very_exciting_first')}
            onChange={(event) => setContestEffect('very_exciting_first', event.target.checked)}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="very_exciting_last">{t('very_exciting_last')}</Label>
          <Toggle
            name="very_exciting_last"
            checked={hasContestEffect('very_exciting_last')}
            onChange={(event) => setContestEffect('very_exciting_last', event.target.checked)}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="lock_excitement">{t('lock_excitement')}</Label>
          <Toggle
            name="lock_excitement"
            checked={hasContestEffect('lock_excitement')}
            onChange={(event) => setContestEffect('lock_excitement', event.target.checked)}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="always_exciting">{t('always_exciting')}</Label>
          <Toggle
            name="always_exciting"
            checked={hasContestEffect('always_exciting')}
            onChange={(event) => setContestEffect('always_exciting', event.target.checked)}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="can_reset_excitement">{t('can_reset_excitement')}</Label>
          <Toggle
            name="can_reset_excitement"
            checked={hasContestEffect('can_reset_excitement')}
            onChange={(event) => setContestEffect('can_reset_excitement', event.target.checked)}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="prevent_jam_one_time">{t('prevent_jam_one_time')}</Label>
          <Toggle
            name="prevent_jam_one_time"
            checked={hasContestEffect('prevent_jam_one_time')}
            onChange={(event) => setContestEffect('prevent_jam_one_time', event.target.checked)}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="prevent_jam_one_turn">{t('prevent_jam_one_turn')}</Label>
          <Toggle
            name="prevent_jam_one_turn"
            checked={hasContestEffect('prevent_jam_one_turn')}
            onChange={(event) => setContestEffect('prevent_jam_one_turn', event.target.checked)}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="bonus_half_previous_appeals">{t('bonus_half_previous_appeals')}</Label>
          <Toggle
            name="bonus_half_previous_appeals"
            checked={hasContestEffect('bonus_half_previous_appeals')}
            onChange={(event) => setContestEffect('bonus_half_previous_appeals', event.target.checked)}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="copy_previous_appeal">{t('copy_previous_appeal')}</Label>
          <Toggle
            name="copy_previous_appeal"
            checked={hasContestEffect('copy_previous_appeal')}
            onChange={(event) => setContestEffect('copy_previous_appeal', event.target.checked)}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="bonus_excitement">{t('bonus_excitement')}</Label>
          <Toggle
            name="bonus_excitement"
            checked={hasContestEffect('bonus_excitement')}
            onChange={(event) => setContestEffect('bonus_excitement', event.target.checked)}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="random_appeal">{t('random_appeal')}</Label>
          <Toggle
            name="random_appeal"
            checked={hasContestEffect('random_appeal')}
            onChange={(event) => setContestEffect('random_appeal', event.target.checked)}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="bonus_later">{t('bonus_later')}</Label>
          <Toggle
            name="bonus_later"
            checked={hasContestEffect('bonus_later')}
            onChange={(event) => setContestEffect('bonus_later', event.target.checked)}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="bonus_earlier">{t('bonus_earlier')}</Label>
          <Toggle
            name="bonus_earlier"
            checked={hasContestEffect('bonus_earlier')}
            onChange={(event) => setContestEffect('bonus_earlier', event.target.checked)}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="bonus_first">{t('bonus_first')}</Label>
          <Toggle
            name="bonus_first"
            checked={hasContestEffect('bonus_first')}
            onChange={(event) => setContestEffect('bonus_first', event.target.checked)}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="bonus_last">{t('bonus_last')}</Label>
          <Toggle
            name="bonus_last"
            checked={hasContestEffect('bonus_last')}
            onChange={(event) => setContestEffect('bonus_last', event.target.checked)}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="bonus_same_condition_previous">{t('bonus_same_condition_previous')}</Label>
          <Toggle
            name="bonus_same_condition_previous"
            checked={hasContestEffect('bonus_same_condition_previous')}
            onChange={(event) => setContestEffect('bonus_same_condition_previous', event.target.checked)}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="bonus_raised_condition">{t('bonus_raised_condition')}</Label>
          <Toggle
            name="bonus_raised_condition"
            checked={hasContestEffect('bonus_raised_condition')}
            onChange={(event) => setContestEffect('bonus_raised_condition', event.target.checked)}
          />
        </InputWithLeftLabelContainer>
      </ContestEffectsContainer>
    </Editor>
  );
});
MoveContestEffectsEditor.displayName = 'MoveContestEffectsEditor';
