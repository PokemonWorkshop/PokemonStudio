import React, { forwardRef, useMemo, useState } from 'react';
import { Editor } from '@components/editor';

import { useTranslation } from 'react-i18next';
import { InputContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { StudioDex, StudioDexCreature } from '@modelEntities/dex';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { useSelectOptions } from '@hooks/useSelectOptions';
import { StudioDropDown } from '@components/StudioDropDown';
import { SelectPokemonForm } from '@components/selects/SelectPokemonForm';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useDexPage } from '@hooks/usePage';
import { cloneEntity } from '@utils/cloneEntity';
import { useUpdateDex } from './useUpdateDex';

const getPokemonUnavailable = (dex: StudioDex, creature: StudioDexCreature): string[] => {
  const dbSymbols = dex.creatures.map((c) => c.dbSymbol);
  const index = dbSymbols.findIndex((dbSymbol) => creature.dbSymbol === dbSymbol);
  dbSymbols.splice(index, 1);
  return dbSymbols;
};

type DexPokemonListEditEditorProps = {
  creatureIndex: number;
};

export const DexPokemonListEditEditor = forwardRef<EditorHandlingClose, DexPokemonListEditEditorProps>(({ creatureIndex }, ref) => {
  const { t } = useTranslation(['database_pokemon']);
  const { dex } = useDexPage();
  const updateDex = useUpdateDex(dex);
  const memoDex = useMemo(() => cloneEntity(dex), [dex]);
  const creature = memoDex.creatures[creatureIndex];
  const [dbSymbol, setDbSymbol] = useState(creature.dbSymbol);
  const [form, setForm] = useState(creature.form);

  const pokemonList = useSelectOptions('creatures');
  const pokemonAvailable = useMemo(() => {
    const unavailable = getPokemonUnavailable(memoDex, creature);
    return pokemonList.filter(({ value }) => !unavailable.includes(value));
  }, [memoDex, creature, pokemonList]);

  const onClose = () => {
    creature.dbSymbol = dbSymbol;
    creature.form = form;
    updateDex(memoDex);
  };

  useEditorHandlingClose(ref, onClose);

  return (
    <Editor type="edit" title={t('database_pokemon:pokemon')}>
      <InputContainer size="l">
        <InputContainer size="m">
          <InputWithTopLabelContainer>
            <Label htmlFor="name">{t('database_pokemon:pokemon')}</Label>
            <StudioDropDown
              options={pokemonAvailable}
              value={dbSymbol}
              onChange={(value) => {
                setDbSymbol(value as DbSymbol);
              }}
            />
          </InputWithTopLabelContainer>
          {creature.dbSymbol !== '__undef__' && (
            <InputWithTopLabelContainer>
              <Label htmlFor="form">{t('database_pokemon:form')}</Label>
              <SelectPokemonForm
                dbSymbol={dbSymbol}
                form={form}
                onChange={(value) => {
                  setForm(Number(value));
                }}
                noLabel
              />
            </InputWithTopLabelContainer>
          )}
        </InputContainer>
      </InputContainer>
    </Editor>
  );
});
DexPokemonListEditEditor.displayName = 'DexPokemonListEditEditor';
