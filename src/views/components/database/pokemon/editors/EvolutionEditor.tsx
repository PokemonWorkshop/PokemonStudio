import { SecondaryNoBackground, DeleteButton, SecondaryButtonWithPlusIcon } from '@components/buttons';
import { EditorWithPagination, Editor } from '@components/editor';
import {
  EditorChildWithSubEditorContainer,
  SubEditorContainer,
  SubEditorTopButtonContainer,
  SubEditorSeparator,
} from '@components/editor/EditorContainer';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { PaddedInputContainer, InputWithTopLabelContainer, Label, Input } from '@components/inputs';
import { PaginationWithTitleProps } from '@components/PaginationWithTitle';
import { useGetEntityNameText } from '@utils/ReadingProjectText';
import { useCreaturePage } from '@utils/usePage';
import { useProjectPokemon } from '@utils/useProjectData';
import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useEvolutionEditorState } from './EvolutionEditor/useEvolutionEditorState';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { ReactComponent as PlusIcon } from '@assets/icons/global/plus-icon2.svg';
import { EVOLUTION_CONDITION_KEYS, EvolutionConditionEditor } from './EvolutionEditor/EvolutionConditionEditor';
import { SelectPokemon } from '@components/selects/SelectPokemon';
import { SelectPokemonForm } from '@components/selects/SelectPokemonForm';

const EvolutionEditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

type Props = {
  evolutionIndex: number;
  setEvolutionIndex: (index: number) => void;
  closeDialog: () => void;
};

export const EvolutionEditor = forwardRef<EditorHandlingClose, Props>(({ evolutionIndex, setEvolutionIndex, closeDialog }, ref) => {
  const { t } = useTranslation('database_pokemon');
  const { t: tSelect } = useTranslation('select');
  const { creature, creatureName, form } = useCreaturePage();
  const { projectDataValues: creatures } = useProjectPokemon();
  const getCreatureName = useGetEntityNameText();
  const { state, inputRefs, dispatch, areConditionValid, commitChanges, addEvolution, removeEvolution } = useEvolutionEditorState({
    evolutionIndex,
    creature,
    form,
  });

  const inputValidityEnsured = () => {
    if (state.evolveTo === '__undef__' && !state.isMega && evolutionIndex !== 0) return false;
    if (areConditionValid()) return true;
    Object.values(inputRefs.current).forEach((input) => input && (!input.validity.valid || input.validity.valueMissing) && input.focus());
    return false;
  };

  useEditorHandlingClose(ref, commitChanges, inputValidityEnsured);

  const evolutionCount = form.evolutions.length;

  const onChangeIndex = (arrow: 'left' | 'right') => {
    if (!inputValidityEnsured()) return;

    if (arrow === 'left') {
      if (evolutionIndex > 0) setEvolutionIndex(evolutionIndex - 1);
    } else {
      if (evolutionIndex < evolutionCount - 1) setEvolutionIndex(evolutionIndex + 1);
    }
  };

  const onAddEvolution = () => {
    if (!inputValidityEnsured()) return;

    addEvolution();
    setEvolutionIndex(evolutionCount);
  };

  const onRemoveEvolution = () => {
    if (evolutionCount <= 1) {
      closeDialog(); // Must be done before remove evolution as it saves the current data
    }
    removeEvolution();
    if (evolutionIndex > 0) setEvolutionIndex(evolutionIndex - 1);
  };

  const currentEvolution = state.isMega ? creature : creatures[state.evolveTo];
  const paginationProps: PaginationWithTitleProps = {
    title: `#${evolutionIndex + 1} - ${currentEvolution ? getCreatureName(currentEvolution) : '???'}`,
    onChangeIndex,
  };

  return (
    <EditorWithPagination type="edit" title={t('evolution')} paginationProps={evolutionCount > 1 ? paginationProps : undefined}>
      <EditorChildWithSubEditorContainer>
        <EvolutionEditorContainer>
          <PaddedInputContainer size="s">
            <InputWithTopLabelContainer>
              <Label required>{t('evolves_into')}</Label>
              {state.isMega ? (
                <Input type="text" value={`Mega-${creatureName}`} disabled />
              ) : (
                <SelectPokemon
                  dbSymbol={state.evolveTo}
                  onChange={(value) => dispatch({ type: 'updateSpecie', value: value as DbSymbol })}
                  undefValueOption={state.evolveTo === '__undef__' ? tSelect('none') : undefined}
                  noLabel
                />
              )}
            </InputWithTopLabelContainer>
            {state.evolveTo !== '__undef__' && !state.isMega && creatures[state.evolveTo]?.forms.length > 1 && (
              <InputWithTopLabelContainer>
                <Label>{t('form')}</Label>
                <SelectPokemonForm
                  dbSymbol={state.isMega ? creature.dbSymbol : state.evolveTo}
                  form={state.evolveToForm}
                  onChange={(value) => dispatch({ type: 'updateForm', value: Number(value) })}
                  noLabel
                />
              </InputWithTopLabelContainer>
            )}
          </PaddedInputContainer>
          {state.conditionInUse.map((type, index) => (
            <EvolutionConditionEditor type={type} state={state} dispatch={dispatch} inputRefs={inputRefs} index={index} key={`cdn-editor-${type}`} />
          ))}
          {state.conditionInUse.length < EVOLUTION_CONDITION_KEYS.length &&
            state.conditionInUse.every((type) => type !== 'none') &&
            state.evolveTo !== '__undef__' && (
              <SecondaryNoBackground onClick={() => dispatch({ type: 'add', key: 'none' })}>
                <PlusIcon />
                <span>{t('evolutionAddCondition')}</span>
              </SecondaryNoBackground>
            )}
        </EvolutionEditorContainer>
        <SubEditorContainer>
          <SubEditorTopButtonContainer>
            <DeleteButton onClick={onRemoveEvolution}>{t('removeEvolution')}</DeleteButton>
          </SubEditorTopButtonContainer>
          <SubEditorSeparator parentEditorHasScrollBar />
          <Editor type="creation" title={t('additionalEvolution')}>
            <SecondaryButtonWithPlusIcon onClick={onAddEvolution} disabled={state.evolveTo === '__undef__' && !state.isMega}>
              {t('addNewEvolution')}
            </SecondaryButtonWithPlusIcon>
          </Editor>
        </SubEditorContainer>
      </EditorChildWithSubEditorContainer>
    </EditorWithPagination>
  );
});
EvolutionEditor.displayName = 'EvolutionEditor';
