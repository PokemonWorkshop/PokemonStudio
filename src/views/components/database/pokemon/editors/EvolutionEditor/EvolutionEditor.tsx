import { DeleteButton, SecondaryButtonWithPlusIcon, SecondaryNoBackground } from '@components/buttons';
import { useRefreshUI } from '@components/editor';
import { Editor, EditorWithPagination } from '@components/editor/Editor';
import {
  EditorChildWithSubEditorContainer,
  SubEditorContainer,
  SubEditorSeparator,
  SubEditorTopButtonContainer,
} from '@components/editor/EditorContainer';
import { Input, InputWithTopLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import { PaginationWithTitleProps } from '@components/PaginationWithTitle';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { SelectPokemon, SelectPokemonForm } from '@components/selects';

import PokemonModel from '@modelEntities/pokemon/Pokemon.model';
import { useProjectPokemon } from '@utils/useProjectData';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { EvolutionConditionEditor } from './EvolutionConditionEditor';

import { ReactComponent as PlusIcon } from '@assets/icons/global/plus-icon2.svg';
import { EvolutionCondition } from '@modelEntities/pokemon/PokemonForm';

const EvolutionEditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

type EvolutionEditorProps = {
  currentPokemon: PokemonModel;
  currentFormIndex: number;
  evolutionIndex: number;
  setEvolutionIndex: (index: number) => void;
  onAddEvolution: () => void;
};

export const EvolutionEditor = ({ currentPokemon, currentFormIndex, evolutionIndex, setEvolutionIndex, onAddEvolution }: EvolutionEditorProps) => {
  const { projectDataValues: pokemon } = useProjectPokemon();
  const { t } = useTranslation('database_pokemon');
  const [isAddingNewCondition, setIsAddingNewCondition] = useState(false);
  const refreshUI = useRefreshUI();
  const form = currentPokemon.forms[currentFormIndex];
  const evolutionCount = form.evolutions.length;
  const evolution = form.evolutions[evolutionIndex] || { form: 0, conditions: [] };
  const conditions = evolution.conditions;
  const isMega = conditions.some((condition) => condition.type === 'gemme');
  const evolutionDbSymbol = evolution.dbSymbol || (isMega && currentPokemon.dbSymbol);
  const showNoneAsNoPokemonIsSelected = !evolutionDbSymbol || evolutionDbSymbol === '__undef__' || undefined;
  if (isAddingNewCondition) conditions.push({ type: 'none', value: undefined });

  const onConditionChange = (newCondition: EvolutionCondition | undefined, index: number) => {
    if (newCondition && newCondition.type === 'none') {
      setIsAddingNewCondition(true);
      return;
    }
    const newConditions = conditions
      .map((condition, i) => (index === i ? newCondition : condition))
      .filter((condition) => condition !== undefined) as EvolutionCondition[];

    if (newConditions.some((condition) => condition.type === 'gemme')) {
      refreshUI((form.evolutions[evolutionIndex] = { form: evolution.form, conditions: newConditions }));
    } else {
      refreshUI((form.evolutions[evolutionIndex] = { ...evolution, conditions: newConditions }));
    }
    setIsAddingNewCondition(false);
  };

  const onChangeIndex = (arrow: 'left' | 'right') => {
    setIsAddingNewCondition(false);
    if (arrow === 'left') {
      if (evolutionIndex <= 0) {
        setEvolutionIndex(evolutionCount - 1);
      } else {
        setEvolutionIndex(evolutionIndex - 1);
      }
    } else {
      if (evolutionIndex >= evolutionCount - 1) {
        setEvolutionIndex(0);
      } else {
        setEvolutionIndex(evolutionIndex + 1);
      }
    }
  };

  const onDelete = () => {
    setIsAddingNewCondition(false);
    if (evolutionCount > 1 && evolutionIndex == evolutionCount - 1) {
      setEvolutionIndex(evolutionIndex - 1);
    }
    refreshUI((form.evolutions = form.evolutions.filter((_, index) => index !== evolutionIndex)));
  };

  const onChooseEvolution = ({ value }: SelectOption) => {
    refreshUI((form.evolutions[evolutionIndex] = { ...evolution, dbSymbol: value }));
  };

  const onChooseForm = ({ value }: SelectOption) => {
    if (evolutionDbSymbol) {
      const formId = Number(value);
      if (!pokemon[evolutionDbSymbol] || !pokemon[evolutionDbSymbol].forms.find((f) => f.form === formId)) return;
      refreshUI((form.evolutions[evolutionIndex] = { ...evolution, form: formId }));
    }
  };

  const paginationProps: PaginationWithTitleProps = {
    title: `#${evolutionIndex + 1} - ${pokemon[evolutionDbSymbol || currentPokemon.dbSymbol]?.name()}`,
    onChangeIndex,
  };

  return (
    <EditorWithPagination type="edit" title={t('evolution')} paginationProps={evolutionCount > 1 ? paginationProps : undefined}>
      <EditorChildWithSubEditorContainer>
        <EvolutionEditorContainer>
          <PaddedInputContainer size="s">
            <InputWithTopLabelContainer>
              <Label>{t('evolves_into')}</Label>
              {isMega ? (
                <Input type="text" value={`Mega-${pokemon[currentPokemon.dbSymbol]?.name() || '???'}`} disabled />
              ) : (
                <SelectPokemon
                  dbSymbol={evolutionDbSymbol || '__undef__'}
                  onChange={onChooseEvolution}
                  noLabel
                  noneValue={showNoneAsNoPokemonIsSelected}
                />
              )}
            </InputWithTopLabelContainer>
            {evolutionDbSymbol && evolutionDbSymbol !== '__undef__' && !showNoneAsNoPokemonIsSelected && pokemon[evolutionDbSymbol].forms.length > 1 && (
              <InputWithTopLabelContainer>
                <Label>{t('form')}</Label>
                <SelectPokemonForm dbSymbol={evolutionDbSymbol} form={evolution.form} onChange={onChooseForm} noLabel />
              </InputWithTopLabelContainer>
            )}
          </PaddedInputContainer>
          {!showNoneAsNoPokemonIsSelected &&
            conditions.map((condition, index) => (
              <EvolutionConditionEditor
                condition={condition}
                allConditions={conditions}
                index={index}
                onChange={onConditionChange}
                key={`evolution-condition-${condition.type}`}
              />
            ))}
          {conditions.length === 0 && !isAddingNewCondition && !showNoneAsNoPokemonIsSelected && (
            <SecondaryNoBackground onClick={() => onConditionChange({ type: 'none', value: undefined }, conditions.length)}>
              <PlusIcon />
              <span>{t('evolutionAddCondition')}</span>
            </SecondaryNoBackground>
          )}
        </EvolutionEditorContainer>
        {(evolutionDbSymbol || evolutionCount > 1) && (
          <SubEditorContainer>
            <SubEditorTopButtonContainer>
              <DeleteButton onClick={onDelete}>{t('removeEvolution')}</DeleteButton>
            </SubEditorTopButtonContainer>
            <SubEditorSeparator parentEditorHasScrollBar />
            <Editor type="creation" title={t('additionalEvolution')}>
              <SecondaryButtonWithPlusIcon onClick={onAddEvolution}>{t('addNewEvolution')}</SecondaryButtonWithPlusIcon>
            </Editor>
          </SubEditorContainer>
        )}
      </EditorChildWithSubEditorContainer>
    </EditorWithPagination>
  );
};
