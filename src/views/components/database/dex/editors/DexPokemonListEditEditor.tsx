import React, { useMemo } from 'react';
import { Editor, useRefreshUI } from '@components/editor';

import { useTranslation } from 'react-i18next';
import { InputContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { StudioDex, StudioDexCreature } from '@modelEntities/dex';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { useSelectOptions } from '@utils/useSelectOptions';
import { StudioDropDown } from '@components/StudioDropDown';
import { SelectPokemonForm } from '@components/selects/SelectPokemonForm';

const getPokemonUnavailable = (dex: StudioDex, creature: StudioDexCreature): string[] => {
  const dbSymbols = dex.creatures.map((c) => c.dbSymbol);
  const index = dbSymbols.findIndex((dbSymbol) => creature.dbSymbol === dbSymbol);
  dbSymbols.splice(index, 1);
  return dbSymbols;
};

type DexPokemonListEditEditorProps = {
  dex: StudioDex;
  creature: StudioDexCreature;
};

export const DexPokemonListEditEditor = ({ dex, creature }: DexPokemonListEditEditorProps) => {
  const pokemonList = useSelectOptions('creatures');
  const pokemonAvailable = useMemo(() => {
    const unavailable = getPokemonUnavailable(dex, creature);
    return pokemonList.filter(({ value }) => !unavailable.includes(value));
  }, [dex, creature]);
  const { t } = useTranslation(['database_pokemon']);
  const refreshUI = useRefreshUI();

  return (
    <Editor type="edit" title={t('database_pokemon:pokemon')}>
      <InputContainer size="l">
        <InputContainer size="m">
          <InputWithTopLabelContainer>
            <Label htmlFor="name">{t('database_pokemon:pokemon')}</Label>
            <StudioDropDown
              options={pokemonAvailable}
              value={creature.dbSymbol}
              onChange={(value) => refreshUI((creature.dbSymbol = value as DbSymbol))}
            />
          </InputWithTopLabelContainer>
          {creature.dbSymbol !== '__undef__' && (
            <InputWithTopLabelContainer>
              <Label htmlFor="form">{t('database_pokemon:form')}</Label>
              <SelectPokemonForm
                dbSymbol={creature.dbSymbol}
                form={creature.form}
                onChange={(value) => refreshUI((creature.form = Number(value)))}
                noLabel
              />
            </InputWithTopLabelContainer>
          )}
        </InputContainer>
      </InputContainer>
    </Editor>
  );
};
