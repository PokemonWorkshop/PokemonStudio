import React, { useMemo } from 'react';
import { Editor, useRefreshUI } from '@components/editor';

import { useTranslation } from 'react-i18next';
import { InputContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import DexModel, { DexCreature } from '@modelEntities/dex/Dex.model';
import { SelectPokemon, SelectPokemonForm } from '@components/selects';

const getPokemonUnavailable = (dex: DexModel, creature: DexCreature): string[] => {
  const dbSymbols = dex.creatures.map((c) => c.dbSymbol);
  const index = dbSymbols.findIndex((dbSymbol) => creature.dbSymbol === dbSymbol);
  dbSymbols.splice(index, 1);
  return dbSymbols;
};

type DexPokemonListEditEditorProps = {
  dex: DexModel;
  creature: DexCreature;
};

export const DexPokemonListEditEditor = ({ dex, creature }: DexPokemonListEditEditorProps) => {
  const pokemonUnavailable = useMemo(() => getPokemonUnavailable(dex, creature), [dex, creature]);
  const { t } = useTranslation(['database_pokemon']);
  const refreshUI = useRefreshUI();

  return (
    <Editor type="edit" title={t('database_pokemon:pokemon')}>
      <InputContainer size="l">
        <InputContainer size="m">
          <InputWithTopLabelContainer>
            <Label htmlFor="name">{t('database_pokemon:pokemon')}</Label>
            <SelectPokemon
              dbSymbol={creature.dbSymbol}
              onChange={(selected) => refreshUI((creature.dbSymbol = selected.value))}
              noLabel
              rejected={pokemonUnavailable}
            />
          </InputWithTopLabelContainer>
          {creature.dbSymbol !== '__undef__' && (
            <InputWithTopLabelContainer>
              <Label htmlFor="form">{t('database_pokemon:form')}</Label>
              <SelectPokemonForm
                dbSymbol={creature.dbSymbol}
                form={creature.form}
                onChange={(selected) => refreshUI((creature.form = Number(selected.value)))}
                noLabel
              />
            </InputWithTopLabelContainer>
          )}
        </InputContainer>
      </InputContainer>
    </Editor>
  );
};
