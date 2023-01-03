import { Editor, useRefreshUI } from '@components/editor';
import { Input, InputContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { EmbeddedUnitInput } from '@components/inputs/EmbeddedUnitInput';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';
import { CREATURE_SPECIE_TEXT_ID, StudioCreature } from '@modelEntities/creature';
import { useGetProjectText, useSetProjectText } from '@utils/ReadingProjectText';
import type { OpenTranslationEditorFunction } from '@utils/useTranslationEditor';
import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

type PokedexEditorProps = {
  currentPokemon: StudioCreature;
  currentFormIndex: number;
  openTranslationEditor: OpenTranslationEditorFunction;
};

export const PokedexEditor: FunctionComponent<PokedexEditorProps> = ({
  currentPokemon,
  currentFormIndex,
  openTranslationEditor,
}: PokedexEditorProps) => {
  const { t } = useTranslation('database_pokemon');
  const refreshUI = useRefreshUI();
  const setText = useSetProjectText();
  const getText = useGetProjectText();
  const form = currentPokemon.forms[currentFormIndex];

  return (
    <Editor type="edit" title={t('pokedex')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="height">{t('height')}</Label>
          <EmbeddedUnitInput
            step="0.01"
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
          <TranslateInputContainer onTranslateClick={() => openTranslationEditor('translation_species')}>
            <Input
              name="species"
              type="text"
              value={getText(CREATURE_SPECIE_TEXT_ID, currentPokemon.id)}
              onChange={(event) => refreshUI(setText(CREATURE_SPECIE_TEXT_ID, currentPokemon.id, event.target.value))}
            />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
      </InputContainer>
    </Editor>
  );
};
