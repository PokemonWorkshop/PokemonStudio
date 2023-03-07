import { Editor, useRefreshUI } from '@components/editor';
import { InputContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectAbility } from '@components/selects';
import { StudioCreature } from '@modelEntities/creature';
import { DbSymbol } from '@modelEntities/dbSymbol';
import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

type TalentEditorProps = {
  currentPokemon: StudioCreature;
  currentFormIndex: number;
};

export const TalentsEditor: FunctionComponent<TalentEditorProps> = ({ currentPokemon, currentFormIndex }: TalentEditorProps) => {
  const { t } = useTranslation(['database_pokemon', 'database_types']);
  const refreshUI = useRefreshUI();
  const form = currentPokemon.forms[currentFormIndex];

  return (
    <Editor type="edit" title={t('database_pokemon:abilities')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="ability_1">{t('database_pokemon:ability_1')}</Label>
          <SelectAbility dbSymbol={form.abilities[0]} onChange={(newDbSymbol) => refreshUI((form.abilities[0] = newDbSymbol as DbSymbol))} noLabel />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="ability_2">{t('database_pokemon:ability_2')}</Label>
          <SelectAbility dbSymbol={form.abilities[1]} onChange={(newDbSymbol) => refreshUI((form.abilities[1] = newDbSymbol as DbSymbol))} noLabel />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="hidden_ability">{t('database_pokemon:hidden_ability')}</Label>
          <SelectAbility dbSymbol={form.abilities[2]} onChange={(newDbSymbol) => refreshUI((form.abilities[2] = newDbSymbol as DbSymbol))} noLabel />
        </InputWithTopLabelContainer>
      </InputContainer>
    </Editor>
  );
};
