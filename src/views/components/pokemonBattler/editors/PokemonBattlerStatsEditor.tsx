import React, { useMemo, useRef } from 'react';
import { InputWithLeftLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import { InputGroupCollapse } from '@components/inputs/InputContainerCollapse';
import { useTranslation } from 'react-i18next';
import { RecordExpandPokemonSetup } from './usePokemonBattler';
import { StudioIvEv } from '@modelEntities/groupEncounter';
import { InputNumberStats } from './InputNumber';

type StatsType = 'ivs' | 'evs';

type PokemonBattlerStatsEditorProps = {
  type: StatsType;
  expandPokemonSetup: RecordExpandPokemonSetup;
  updateExpandPokemonSetup: (updates: Partial<RecordExpandPokemonSetup>) => void;
  collapseByDefault: boolean;
};

export const PokemonBattlerStatsEditor = ({
  type,
  expandPokemonSetup,
  updateExpandPokemonSetup,
  collapseByDefault,
}: PokemonBattlerStatsEditorProps) => {
  const { t } = useTranslation(['database_pokemon', 'pokemon_battler_list']);
  const stats = useMemo(() => (type === 'evs' ? expandPokemonSetup.evs : expandPokemonSetup.ivs) as StudioIvEv, [type, expandPokemonSetup]);
  const statsRef = useRef<(HTMLInputElement | null | undefined)[]>([]);

  return (
    <InputGroupCollapse title={t(`pokemon_battler_list:${type}_title`)} gap="24px" collapseByDefault={collapseByDefault || undefined}>
      <PaddedInputContainer size="xs">
        <InputWithLeftLabelContainer>
          <Label htmlFor="hp">{t('database_pokemon:hp')}</Label>
          <InputNumberStats
            name="hp"
            defaultValue={stats.hp}
            onChange={(value) => updateExpandPokemonSetup({ [type]: { ...stats, hp: value } })}
            ref={(ref) => (statsRef.current[0] = ref)}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="attack">{t('database_pokemon:attack')}</Label>
          <InputNumberStats
            name="attack"
            defaultValue={stats.atk}
            onChange={(value) => updateExpandPokemonSetup({ [type]: { ...stats, atk: value } })}
            ref={(ref) => (statsRef.current[1] = ref)}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="defense">{t('database_pokemon:defense')}</Label>
          <InputNumberStats
            name="defense"
            defaultValue={stats.dfe}
            onChange={(value) => updateExpandPokemonSetup({ [type]: { ...stats, dfe: value } })}
            ref={(ref) => (statsRef.current[2] = ref)}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="special_attack">{t('database_pokemon:special_attack')}</Label>
          <InputNumberStats
            name="special_attack"
            defaultValue={stats.ats}
            onChange={(value) => updateExpandPokemonSetup({ [type]: { ...stats, ats: value } })}
            ref={(ref) => (statsRef.current[3] = ref)}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="special-defense">{t('database_pokemon:special_defense')}</Label>
          <InputNumberStats
            name="special-defense"
            defaultValue={stats.dfs}
            onChange={(value) => updateExpandPokemonSetup({ [type]: { ...stats, dfs: value } })}
            ref={(ref) => (statsRef.current[4] = ref)}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="speed">{t('database_pokemon:speed')}</Label>
          <InputNumberStats
            name="speed"
            defaultValue={stats.spd}
            onChange={(value) => updateExpandPokemonSetup({ [type]: { ...stats, spd: value } })}
            ref={(ref) => (statsRef.current[5] = ref)}
          />
        </InputWithLeftLabelContainer>
      </PaddedInputContainer>
    </InputGroupCollapse>
  );
};
