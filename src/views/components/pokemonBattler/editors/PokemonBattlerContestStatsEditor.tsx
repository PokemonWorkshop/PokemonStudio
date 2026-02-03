import React, { useMemo, useRef } from 'react';
import { InputWithLeftLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import { InputGroupCollapse } from '@components/inputs/InputContainerCollapse';
import { useTranslation } from 'react-i18next';
import { RecordExpandPokemonSetup } from './usePokemonBattler';
import { StudioContestStats } from '@modelEntities/groupEncounter';
import { InputNumber } from './InputNumber';

type PokemonBattlerContestStatsEditorProps = {
  expandPokemonSetup: RecordExpandPokemonSetup;
  updateExpandPokemonSetup: (updates: Partial<RecordExpandPokemonSetup>) => void;
};

export const PokemonBattlerContestStatsEditor = ({ expandPokemonSetup, updateExpandPokemonSetup }: PokemonBattlerContestStatsEditorProps) => {
  const { t } = useTranslation();
  const conditions = useMemo(() => expandPokemonSetup.conditions as StudioContestStats, [expandPokemonSetup]);
  const conditionsRef = useRef<(HTMLInputElement | null | undefined)[]>([]);

  return (
    <InputGroupCollapse title={t(`contest_conditions_title`)} gap="24px">
      <PaddedInputContainer size="xs">
        <InputWithLeftLabelContainer>
          <Label htmlFor="cool">{t('cool')}</Label>
          <InputNumber
            name="cool"
            min={0}
            max={255}
            defaultValue={conditions.coolness}
            onChange={(value) => updateExpandPokemonSetup({ ['conditions']: { ...conditions, coolness: value } })}
            ref={(ref) => (conditionsRef.current[0] = ref)}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="beautiful">{t('beautiful')}</Label>
          <InputNumber
            name="beautiful"
            min={0}
            max={255}
            defaultValue={conditions.beauty}
            onChange={(value) => updateExpandPokemonSetup({ ['conditions']: { ...conditions, beauty: value } })}
            ref={(ref) => (conditionsRef.current[1] = ref)}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="cute">{t('cute')}</Label>
          <InputNumber
            name="cute"
            min={0}
            max={255}
            defaultValue={conditions.cuteness}
            onChange={(value) => updateExpandPokemonSetup({ ['conditions']: { ...conditions, cuteness: value } })}
            ref={(ref) => (conditionsRef.current[2] = ref)}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="clever">{t('clever')}</Label>
          <InputNumber
            name="clever"
            min={0}
            max={255}
            defaultValue={conditions.cleverness}
            onChange={(value) => updateExpandPokemonSetup({ ['conditions']: { ...conditions, cleverness: value } })}
            ref={(ref) => (conditionsRef.current[3] = ref)}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="tough">{t('tough')}</Label>
          <InputNumber
            name="tough"
            min={0}
            max={255}
            defaultValue={conditions.toughness}
            onChange={(value) => updateExpandPokemonSetup({ ['conditions']: { ...conditions, toughness: value } })}
            ref={(ref) => (conditionsRef.current[4] = ref)}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="sheen">{t('sheen')}</Label>
          <InputNumber
            name="sheen"
            min={0}
            max={255}
            defaultValue={conditions.sheen}
            onChange={(value) => updateExpandPokemonSetup({ ['conditions']: { ...conditions, sheen: value } })}
            ref={(ref) => (conditionsRef.current[5] = ref)}
          />
        </InputWithLeftLabelContainer>
      </PaddedInputContainer>
    </InputGroupCollapse>
  );
};
