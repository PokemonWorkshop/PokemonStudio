import { Editor, useRefreshUI } from '@components/editor';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';
import { SelectType } from '@components/selects';
import DexModel from '@modelEntities/dex/Dex.model';
import PokemonModel from '@modelEntities/pokemon/Pokemon.model';
import type { OpenTranslationEditorFunction } from '@utils/useTranslationEditor';
import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

type InformationsEditorProps = {
  currentPokemon: PokemonModel;
  currentFormIndex: number;
  dex: DexModel;
  openTranslationEditor: OpenTranslationEditorFunction;
};

export const InformationsEditor: FunctionComponent<InformationsEditorProps> = ({
  currentPokemon,
  currentFormIndex,
  dex,
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
        <InputWithLeftLabelContainer>
          <Label htmlFor="regional-id">{t('database_pokemon:regional_id')}</Label>
          <Input
            name="regional-id"
            type="number"
            min="0"
            max="9999"
            value={dex.getId(currentPokemon.dbSymbol, form.form)}
            onChange={(event) => {
              const value = parseInt(event.target.value);
              if (value < 0 || value > 9999) return event.preventDefault();
              refreshUI(dex.changeId(currentPokemon.dbSymbol, form.form, value));
            }}
          />
        </InputWithLeftLabelContainer>
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
