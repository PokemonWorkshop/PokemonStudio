import React from 'react';
import { useRefreshUI } from '@components/editor';
import { Input, InputWithLeftLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import { InputGroupCollapse } from '@components/inputs/InputContainerCollapse';
import { useTranslation } from 'react-i18next';
import { cleanNaNValue } from '@utils/cleanNaNValue';
import { StudioGroupEncounter } from '@modelEntities/groupEncounter';

type InputNumberProps = {
  name: string;
  value: number;
  setValue: (value: number) => void;
};

const InputNumber = ({ name, value, setValue }: InputNumberProps) => {
  return (
    <Input
      type="number"
      name={name}
      min="0"
      max="9999"
      value={isNaN(value) ? '' : value}
      onChange={(event) => {
        const newValue = event.target.value === '' ? Number.NaN : parseInt(event.target.value);
        if (newValue < 0 || newValue > 9999) return event.preventDefault();
        setValue(newValue);
      }}
      onBlur={() => setValue(cleanNaNValue(value, 0))}
    />
  );
};

type IEVsType = 'ivs' | 'evs';

type PokemonBattlerListIEVsEditorProps = {
  type: IEVsType;
  battler: StudioGroupEncounter;
  collapseByDefault: boolean;
};

export const PokemonBattlerListIEVsEditor = ({ type, battler, collapseByDefault }: PokemonBattlerListIEVsEditorProps) => {
  const { t } = useTranslation(['database_pokemon', 'pokemon_battler_list']);
  const ievs = battler.expandPokemonSetup.find((setup) => setup.type === type);
  const refreshUI = useRefreshUI();

  return (
    <InputGroupCollapse title={t(`pokemon_battler_list:${type}_title`)} gap="24px" collapseByDefault={collapseByDefault || undefined}>
      {ievs && (ievs.type === 'evs' || ievs.type === 'ivs') && (
        <PaddedInputContainer size="xs">
          <InputWithLeftLabelContainer>
            <Label htmlFor="hp">{t('database_pokemon:hp')}</Label>
            <InputNumber name="hp" value={ievs.value.hp} setValue={(value: number) => refreshUI((ievs.value.hp = value))} />
          </InputWithLeftLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="attack">{t('database_pokemon:attack')}</Label>
            <InputNumber name="attack" value={ievs.value.atk} setValue={(value: number) => refreshUI((ievs.value.atk = value))} />
          </InputWithLeftLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="defense">{t('database_pokemon:defense')}</Label>
            <InputNumber name="defense" value={ievs.value.dfe} setValue={(value: number) => refreshUI((ievs.value.dfe = value))} />
          </InputWithLeftLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="special_attack">{t('database_pokemon:special_attack')}</Label>
            <InputNumber name="special_attack" value={ievs.value.ats} setValue={(value: number) => refreshUI((ievs.value.ats = value))} />
          </InputWithLeftLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="special-defense">{t('database_pokemon:special_defense')}</Label>
            <InputNumber name="special-defense" value={ievs.value.dfs} setValue={(value: number) => refreshUI((ievs.value.dfs = value))} />
          </InputWithLeftLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="speed">{t('database_pokemon:speed')}</Label>
            <InputNumber name="speed" value={ievs.value.spd} setValue={(value: number) => refreshUI((ievs.value.spd = value))} />
          </InputWithLeftLabelContainer>
        </PaddedInputContainer>
      )}
    </InputGroupCollapse>
  );
};
