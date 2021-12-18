import { Editor, useRefreshUI } from '@components/editor';
import { Input, InputContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { EmbeddedUnitInput } from '@components/inputs/EmbeddedUnitInput';
import PokemonModel from '@modelEntities/pokemon/Pokemon.model';
import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

type PokedexEditorProps = {
  currentPokemon: PokemonModel;
  currentFormIndex: number;
};

export const PokedexEditor: FunctionComponent<PokedexEditorProps> = ({ currentPokemon, currentFormIndex }: PokedexEditorProps) => {
  const { t } = useTranslation('database_pokemon');
  const refreshUI = useRefreshUI();
  const form = currentPokemon.forms[currentFormIndex];

  return (
    <Editor type="edit" title={t('pokedex')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="height">{t('height')}</Label>
          <EmbeddedUnitInput
            lang="en"
            unit="m"
            name="height"
            type="number"
            value={form.height ?? 0.0}
            onChange={(event) => refreshUI((form.height = isNaN(parseFloat(event.target.value)) ? 0 : parseFloat(event.target.value)))}
          />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="weight">{t('weight')}</Label>
          <EmbeddedUnitInput
            unit="kg"
            step="0.01"
            lang="en"
            name="weight"
            type="number"
            value={form.weight ?? 0.0}
            onChange={(event) => refreshUI((form.weight = isNaN(parseFloat(event.target.value)) ? 0 : parseFloat(event.target.value)))}
          />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="species">{t('species')}</Label>
          <Input
            name="species"
            type="text"
            value={currentPokemon.species()}
            onChange={(event) => refreshUI(currentPokemon.setSpecies(event.target.value))}
          />
        </InputWithTopLabelContainer>
      </InputContainer>
    </Editor>
  );
};
