import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PokemonModel from '@modelEntities/pokemon/Pokemon.model';
import { Editor, useRefreshUI } from '@components/editor';
import { Input, InputContainer, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import styled from 'styled-components';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { TextInputError } from '@components/inputs/Input';
import { ToolTip, ToolTipContainer } from '@components/Tooltip';
import { checkDbSymbolExist, wrongDbSymbol } from '@utils/dbSymbolCheck';
import { SelectType } from '@components/selects';
import { useProjectPokemonDex } from '@utils/useProjectDoubleData';

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0 0 0;
  gap: 8px;
`;

type PokemonNewEditorProps = {
  onClose: () => void;
};

export const PokemonNewEditor = ({ onClose }: PokemonNewEditorProps) => {
  const {
    projectDataValues: pokemon,
    projectDataValues2: dex,
    setProjectDoubleDataValues: setPokemonDex,
    bindProjectDataValue: bindPokemon,
  } = useProjectPokemonDex();
  const { t } = useTranslation(['database_pokemon', 'database_moves']);
  const refreshUI = useRefreshUI();
  const [newPokemon] = useState(bindPokemon(PokemonModel.createPokemon(pokemon)).newData1);
  const [pokemonText] = useState({ name: '', descr: '' });

  const onClickNew = () => {
    const editedDex = dex.national.clone();
    editedDex.addCreature(newPokemon.dbSymbol, 0);
    newPokemon.setName(pokemonText.name);
    newPokemon.setDescr(pokemonText.descr);
    newPokemon.forms[0].babyDbSymbol = newPokemon.dbSymbol;
    setPokemonDex({ [newPokemon.dbSymbol]: newPokemon }, { [editedDex.dbSymbol]: editedDex }, { pokemon: { specie: newPokemon.dbSymbol, form: 0 } });
    onClose();
  };

  const checkDisabled = () => {
    return (
      pokemonText.name.length === 0 ||
      newPokemon.dbSymbol.length === 0 ||
      wrongDbSymbol(newPokemon.dbSymbol) ||
      checkDbSymbolExist(pokemon, newPokemon.dbSymbol)
    );
  };

  return (
    <Editor type="creation" title={t('database_pokemon:new')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="name" required>
            {t('database_pokemon:name')}
          </Label>
          <Input
            type="text"
            name="name"
            value={pokemonText.name}
            onChange={(event) => refreshUI((pokemonText.name = event.target.value))}
            placeholder={t('database_pokemon:example_name')}
          />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="descr">{t('database_pokemon:description')}</Label>
          <MultiLineInput
            id="descr"
            value={pokemonText.descr}
            onChange={(event) => refreshUI((pokemonText.descr = event.target.value))}
            placeholder={t('database_pokemon:example_description')}
          />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="type1">{t('database_pokemon:type1')}</Label>
          <SelectType
            dbSymbol={newPokemon.forms[0].type1}
            onChange={(event) => refreshUI((newPokemon.forms[0].type1 = event.value))}
            rejected={[newPokemon.forms[0].type2]}
            noLabel
          />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="type2">{t('database_pokemon:type2')}</Label>
          <SelectType
            dbSymbol={newPokemon.forms[0].type2}
            onChange={(event) => refreshUI((newPokemon.forms[0].type2 = event.value))}
            rejected={[newPokemon.forms[0].type1]}
            noneValue
            noLabel
          />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="dbSymbol" required>
            {t('database_moves:symbol')}
          </Label>
          <Input
            type="text"
            name="dbSymbol"
            value={newPokemon.dbSymbol}
            onChange={(event) => refreshUI((newPokemon.dbSymbol = event.target.value))}
            error={wrongDbSymbol(newPokemon.dbSymbol) || checkDbSymbolExist(pokemon, newPokemon.dbSymbol)}
            placeholder={t('database_pokemon:example_db_symbol')}
          />
          {newPokemon.dbSymbol.length !== 0 && wrongDbSymbol(newPokemon.dbSymbol) && (
            <TextInputError>{t('database_moves:incorrect_format')}</TextInputError>
          )}
          {newPokemon.dbSymbol.length !== 0 && checkDbSymbolExist(pokemon, newPokemon.dbSymbol) && (
            <TextInputError>{t('database_moves:db_symbol_already_used')}</TextInputError>
          )}
        </InputWithTopLabelContainer>
        <ButtonContainer>
          <ToolTipContainer>
            {checkDisabled() && <ToolTip bottom="100%">{t('database_moves:fields_asterisk_required')}</ToolTip>}
            <PrimaryButton onClick={onClickNew} disabled={checkDisabled()}>
              {t('database_pokemon:create_pokemon')}
            </PrimaryButton>
          </ToolTipContainer>
          <DarkButton onClick={onClose}>{t('database_moves:cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
};
