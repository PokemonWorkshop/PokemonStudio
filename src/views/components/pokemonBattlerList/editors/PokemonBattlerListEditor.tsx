import React, { useMemo } from 'react';
import { EditorWithCollapse, useRefreshUI } from '@components/editor';
import {
  Input,
  InputContainer,
  InputWithLeftLabelContainer,
  InputWithSeparatorContainer,
  InputWithTopLabelContainer,
  Label,
  PaddedInputContainer,
} from '@components/inputs';
import Encounter, { cleanExpandPokemonSetup, createEncounter, createOptionalExpandPokemonSetup, LevelMinMax } from '@modelEntities/Encounter';
import { useTranslation } from 'react-i18next';
import { SelectAbility, SelectPokemon, SelectPokemonForm } from '@components/selects';
import { PokemonBattlerListIEVsEditor } from './PokemonBattlerListIEVsEditor';
import { ToolTip, ToolTipContainer } from '@components/Tooltip';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { useProjectGroups, useProjectPokemon, useProjectTrainers } from '@utils/useProjectData';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { PokemonBattlerListMoveEditor } from './PokemonBattlerListMoveEditor';
import { PokemonBattlerListMoreInfoEditor } from './PokemonBattlerListMoreInfoEditor';
import styled from 'styled-components';
import { ProjectData, useGlobalState } from '@src/GlobalStateProvider';
import TrainerModel from '@modelEntities/trainer/Trainer.model';
import GroupModel from '@modelEntities/group/Group.model';
import { EmbeddedUnitInput } from '@components/inputs/EmbeddedUnitInput';
import { cleanNaNValue } from '@utils/cleanNaNValue';
import { CurrentBattlerType } from '../PokemonBattlerList';
import { SelectNature } from '@components/selects/SelectNature';

const GroupCollapseContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 8px;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0 0 0;
  gap: 8px;
`;

type InputNumberLevelProps = {
  name: string;
  max: number;
  value: number;
  setValue: (value: number) => void;
};

const InputNumberLevel = ({ name, max, value, setValue }: InputNumberLevelProps) => {
  return (
    <Input
      type="number"
      name={name}
      min="1"
      max={max.toString()}
      value={isNaN(value) ? '' : value}
      onChange={(event) => {
        const newValue = event.target.value === '' ? Number.NaN : parseInt(event.target.value);
        if (newValue < 0 || newValue > max) return event.preventDefault();
        setValue(newValue);
      }}
      onBlur={() => setValue(cleanNaNValue(value, 1))}
    />
  );
};

const updateGivenName = (battler: Encounter, species: ProjectData['pokemon']) => {
  const givenNameSetup = battler.expandPokemonSetup.find((eps) => eps.type === 'givenName');
  if (givenNameSetup) givenNameSetup.value = species[battler.specie]?.name() || '???';
};

const updateRareness = (battler: Encounter, species: ProjectData['pokemon']) => {
  const rarenessSetup = battler.expandPokemonSetup.find((eps) => eps.type === 'rareness');
  if (rarenessSetup) rarenessSetup.value = species[battler.specie]?.forms[battler.form].catchRate || 0;
};

const updateNature = (battler: Encounter, nature: string) => {
  const natureSetup = battler.expandPokemonSetup.find((eps) => eps.type === 'nature');
  if (natureSetup) natureSetup.value = nature;
};

const getBattler = (model: TrainerModel | GroupModel, index: number) => {
  if ('party' in model) return model.party[index];
  return model.encounters[index];
};

const getIsWild = (model: TrainerModel | GroupModel) => {
  return 'encounters' in model;
};

type PokemonBattlerListEditorProps = {
  type: 'creation' | 'edit';
  model: TrainerModel | GroupModel;
  currentBattler?: CurrentBattlerType;
  isWild?: true;
  onClose?: () => void;
};

export const PokemonBattlerListEditor = ({ type, model, currentBattler, onClose }: PokemonBattlerListEditorProps) => {
  if (type === 'edit' && currentBattler?.index === undefined) console.warn('index should be define when edit mode is used.');
  if (type === 'creation' && onClose === undefined) console.warn('onClose() should be define when creation mode is used.');

  const isWild = useMemo(() => getIsWild(model), [model]);
  const newBattler = useMemo(() => createEncounter(isWild || false), [isWild]);
  const battler = type === 'edit' && currentBattler?.index !== undefined ? getBattler(model, currentBattler?.index) : newBattler;
  const { projectDataValues: species } = useProjectPokemon();
  const { setProjectDataValues: setTrainer } = useProjectTrainers();
  const { setProjectDataValues: setGroup } = useProjectGroups();
  const [state] = useGlobalState();
  const { t } = useTranslation(['database_pokemon', 'database_abilities', 'pokemon_battler_list']);
  const refreshUI = useRefreshUI();
  createOptionalExpandPokemonSetup(battler);

  const checkDisabled = () => battler.specie === '__undef__';
  const onClickNew = () => {
    cleanExpandPokemonSetup(battler, species, isWild);
    if ('party' in model) {
      model.party.push(battler);
      model.updatePartyTrainerName();
      setTrainer({ [model.dbSymbol]: model });
    } else {
      model.encounters.push(battler);
      setGroup({ [model.dbSymbol]: model });
    }
    if (onClose) onClose();
  };

  const onChangePokemon = (selected: SelectOption) => {
    battler.specie = selected.value;
    battler.form = 0;
    updateGivenName(battler, species);
    updateRareness(battler, species);
  };

  const onChangeAbility = (selected: SelectOption) => {
    const abilitySetup = battler.expandPokemonSetup.find((eps) => eps.type === 'ability');
    if (abilitySetup) abilitySetup.value = selected.value;
  };

  const onChangeOrder = () => {
    if ('encounters' in model || currentBattler?.index === undefined || currentBattler.index === 0) return;

    model.party.splice(0, 0, model.party.splice(currentBattler.index, 1)[0]);
    currentBattler.index = 0;
  };

  return (
    <EditorWithCollapse type={type} title={t('database_pokemon:pokemon')}>
      <InputContainer>
        {battler.specie === '__undef__' || !species[battler.specie] ? (
          <PaddedInputContainer>
            <InputWithTopLabelContainer>
              <Label htmlFor="select-pokemon" required>
                {t('database_pokemon:pokemon')}
              </Label>
              <SelectPokemon onChange={(value) => refreshUI(onChangePokemon(value))} dbSymbol={battler.specie} noLabel noneValue noneValueIsError />
            </InputWithTopLabelContainer>
          </PaddedInputContainer>
        ) : (
          <PaddedInputContainer>
            <InputWithTopLabelContainer>
              <Label htmlFor="select-pokemon" required>
                {t('database_pokemon:pokemon')}
              </Label>
              <SelectPokemon onChange={(value) => refreshUI(onChangePokemon(value))} dbSymbol={battler.specie} noLabel noneValue noneValueIsError />
            </InputWithTopLabelContainer>
            {species[battler.specie].forms.length > 1 && (
              <InputWithTopLabelContainer>
                <Label htmlFor="select-form">{t('database_pokemon:form')}</Label>
                <SelectPokemonForm
                  onChange={(value) => refreshUI((battler.form = species[battler.specie].forms[Number(value.value)].form))}
                  dbSymbol={battler.specie}
                  form={battler.form}
                  noLabel
                />
              </InputWithTopLabelContainer>
            )}
            {!isWild && battler.levelSetup.kind === 'fixed' && (
              <InputWithLeftLabelContainer>
                <Label htmlFor="fixed-level">{t('pokemon_battler_list:level')}</Label>
                <InputNumberLevel
                  name="fixed-level"
                  max={state.projectConfig.settings_config.pokemonMaxLevel}
                  value={battler.levelSetup.level}
                  setValue={(value: number) => refreshUI((battler.levelSetup.level = value))}
                />
              </InputWithLeftLabelContainer>
            )}
            {isWild && battler.levelSetup.kind === 'minmax' && (
              <InputWithLeftLabelContainer>
                <Label htmlFor="minmax-level">{t('pokemon_battler_list:level')}</Label>
                <InputWithSeparatorContainer>
                  <InputNumberLevel
                    name="min-level"
                    max={state.projectConfig.settings_config.pokemonMaxLevel}
                    value={battler.levelSetup.level.minimumLevel}
                    setValue={(value: number) => refreshUI(((battler.levelSetup.level as LevelMinMax).minimumLevel = value))}
                  />
                  <span className="separator">{t('pokemon_battler_list:level_separator')}</span>
                  <InputNumberLevel
                    name="max-level"
                    max={state.projectConfig.settings_config.pokemonMaxLevel}
                    value={battler.levelSetup.level.maximumLevel}
                    setValue={(value: number) => refreshUI(((battler.levelSetup.level as LevelMinMax).maximumLevel = value))}
                  />
                </InputWithSeparatorContainer>
              </InputWithLeftLabelContainer>
            )}
            {isWild && (
              <InputWithLeftLabelContainer>
                <Label htmlFor="encounter-chance">{t('pokemon_battler_list:random_encounter_chance')}</Label>
                <EmbeddedUnitInput
                  type="number"
                  name="encounter-chance"
                  min="1"
                  max="100"
                  unit="%"
                  value={isNaN(battler.randomEncounterChance) ? '' : battler.randomEncounterChance}
                  onChange={(event) => {
                    const newValue = parseInt(event.target.value);
                    if (newValue < 1 || newValue > 100) return event.preventDefault();
                    refreshUI((battler.randomEncounterChance = newValue));
                  }}
                  onBlur={() => refreshUI((battler.randomEncounterChance = cleanNaNValue(battler.randomEncounterChance)))}
                />
              </InputWithLeftLabelContainer>
            )}
            <InputWithTopLabelContainer>
              <Label htmlFor="select-ability">{t('database_abilities:ability')}</Label>
              <SelectAbility
                dbSymbol={battler.expandPokemonSetup.find((eps) => eps.type === 'ability')?.value as string}
                onChange={(selected) => refreshUI(onChangeAbility(selected))}
                noLabel
                noneValue
                overwriteNoneValue={t('pokemon_battler_list:random')}
                noneValueIsError={false}
              />
            </InputWithTopLabelContainer>
            <InputWithTopLabelContainer>
              <Label htmlFor="select-nature">{t('pokemon_battler_list:nature')}</Label>
              <SelectNature
                dbSymbol={battler.expandPokemonSetup.find((eps) => eps.type === 'nature')?.value as string}
                onChange={(selected) => refreshUI(updateNature(battler, selected.value))}
                overwriteNoneValue={t('pokemon_battler_list:random')}
                noneValue
              />
            </InputWithTopLabelContainer>
          </PaddedInputContainer>
        )}
        {battler.specie !== '__undef__' && species[battler.specie] && (
          <GroupCollapseContainer>
            <PokemonBattlerListMoreInfoEditor
              battler={battler}
              collapseByDefault={false}
              isWild={isWild || false}
              key={battler.specie}
              index={currentBattler?.index}
              onChangeOrder={onChangeOrder}
            />
            <PokemonBattlerListMoveEditor battler={battler} collapseByDefault={currentBattler?.kind === 'moves'} />
            <PokemonBattlerListIEVsEditor type="evs" battler={battler} collapseByDefault={currentBattler?.kind === 'evs'} />
            {!isWild && <PokemonBattlerListIEVsEditor type="ivs" battler={battler} collapseByDefault={false} />}
          </GroupCollapseContainer>
        )}
        {type === 'creation' && (
          <ButtonContainer>
            <ToolTipContainer>
              {checkDisabled() && <ToolTip bottom="100%">{t('pokemon_battler_list:fields_asterisk_required')}</ToolTip>}
              <PrimaryButton onClick={onClickNew} disabled={checkDisabled()}>
                {t('database_pokemon:create_pokemon')}
              </PrimaryButton>
            </ToolTipContainer>
            <DarkButton onClick={onClose}>{t('database_pokemon:cancel')}</DarkButton>
          </ButtonContainer>
        )}
      </InputContainer>
    </EditorWithCollapse>
  );
};
