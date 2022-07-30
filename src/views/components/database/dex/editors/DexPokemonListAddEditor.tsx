import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { Editor } from '@components/editor';

import { useTranslation } from 'react-i18next';
import { InputContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import DexModel, { DexCreature } from '@modelEntities/dex/Dex.model';
import { useProjectDex } from '@utils/useProjectData';
import { SelectPokemon, SelectPokemonForm } from '@components/selects';
import { ToolTip, ToolTipContainer } from '@components/Tooltip';
import { DarkButton, PrimaryButton } from '@components/buttons';

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const getPokemonUnavailable = (dex: DexModel): string[] => {
  return dex.creatures.map((creature) => creature.dbSymbol);
};

type DexPokemonListAddEditorProps = {
  dex: DexModel;
  onClose: () => void;
};

export const DexPokemonListAddEditor = ({ dex, onClose }: DexPokemonListAddEditorProps) => {
  const { setProjectDataValues: setDex } = useProjectDex();
  const [creature, setCreature] = useState<DexCreature>({ dbSymbol: '__undef__', form: 0 });
  const pokemonUnavailable = useMemo(() => getPokemonUnavailable(dex), [dex]);
  const { t } = useTranslation(['database_dex', 'database_pokemon', 'database_moves']);

  const onClickAdd = () => {
    dex.creatures.push(creature);
    setDex({ [dex.dbSymbol]: dex });
    onClose();
  };

  return (
    <Editor type="addition" title={t('database_pokemon:pokemon')}>
      <InputContainer size="l">
        <InputContainer size="m">
          <InputWithTopLabelContainer>
            <Label htmlFor="name" required>
              {t('database_pokemon:pokemon')}
            </Label>
            <SelectPokemon
              dbSymbol={creature.dbSymbol}
              onChange={(selected) => setCreature({ ...creature, dbSymbol: selected.value })}
              noLabel
              noneValue
              noneValueIsError
              rejected={pokemonUnavailable}
            />
          </InputWithTopLabelContainer>
          {creature.dbSymbol !== '__undef__' && (
            <InputWithTopLabelContainer>
              <Label htmlFor="form">{t('database_pokemon:form')}</Label>
              <SelectPokemonForm
                dbSymbol={creature.dbSymbol}
                form={creature.form}
                onChange={(selected) => setCreature({ ...creature, form: Number(selected.value) })}
                noLabel
              />
            </InputWithTopLabelContainer>
          )}
        </InputContainer>
        <ButtonContainer>
          <ToolTipContainer>
            {creature.dbSymbol === '__undef__' && <ToolTip bottom="100%">{t('database_moves:fields_asterisk_required')}</ToolTip>}
            <PrimaryButton onClick={onClickAdd} disabled={creature.dbSymbol === '__undef__'}>
              {t('database_dex:add_the_pokemon')}
            </PrimaryButton>
          </ToolTipContainer>
          <DarkButton onClick={onClose}>{t('database_dex:cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
};
