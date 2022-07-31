import { Editor, useRefreshUI } from '@components/editor';
import { Input, InputContainer, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';
import { SelectType } from '@components/selects';
import PokemonModel from '@modelEntities/pokemon/Pokemon.model';
import type { OpenTranslationEditorFunction } from '@utils/useTranslationEditor';
import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

type InformationsEditorProps = {
  currentPokemon: PokemonModel;
  currentFormIndex: number;
  openTranslationEditor: OpenTranslationEditorFunction;
};

export const InformationsEditor: FunctionComponent<InformationsEditorProps> = ({
  currentPokemon,
  currentFormIndex,
  openTranslationEditor,
}: InformationsEditorProps) => {
  const { t } = useTranslation(['database_pokemon', 'database_types']);
  const refreshUI = useRefreshUI();
  const form = currentPokemon.forms[currentFormIndex];

  return (
    <Editor type="edit" title={t('database_pokemon:information')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="name" required>
            {t('database_pokemon:name')}
          </Label>
          <TranslateInputContainer onTranslateClick={() => openTranslationEditor('translation_name')}>
            <Input
              type="text"
              name="name"
              value={currentPokemon.name()}
              onChange={(event) => refreshUI(currentPokemon.setName(event.target.value))}
              placeholder={t('database_pokemon:example_name')}
            />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="description">{t('database_pokemon:description')}</Label>
          <TranslateInputContainer onTranslateClick={() => openTranslationEditor('translation_description')}>
            <MultiLineInput
              name="description"
              value={currentPokemon.descr()}
              onChange={(event) => refreshUI(currentPokemon.setDescr(event.target.value))}
            />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="type1">{t('database_pokemon:type1')}</Label>
          <SelectType dbSymbol={form.type1} onChange={(event) => refreshUI((form.type1 = event.value))} noLabel rejected={[form.type2]} />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="type2">{t('database_pokemon:type2')}</Label>
          <SelectType dbSymbol={form.type2} onChange={(event) => refreshUI((form.type2 = event.value))} noLabel rejected={[form.type1]} noneValue />
        </InputWithTopLabelContainer>
      </InputContainer>
    </Editor>
  );
};
