import React, { forwardRef, useState } from 'react';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import type { CurrentBattlerType, PokemonBattlerFrom } from './PokemonBattlerEditorOverlay';
import { useTranslation } from 'react-i18next';
import { EditorWithCollapse } from '@components/editor';
import {
  InputContainer,
  InputWithLeftLabelContainer,
  InputWithSeparatorContainer,
  InputWithTopLabelContainer,
  Label,
  PaddedInputContainer,
} from '@components/inputs';
import styled from 'styled-components';
import { ToolTip, ToolTipContainer } from '@components/Tooltip';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { usePokemonBattler } from './usePokemonBattler';
import { SelectPokemon } from '@components/selects/SelectPokemon';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { SelectPokemonForm } from '@components/selects/SelectPokemonForm';
import { StudioEncounterLevelMinMax } from '@modelEntities/groupEncounter';
import { SelectAbility } from '@components/selects';
import { SelectNature } from '@components/selects/SelectNature';
import { PokemonBattlerMoreInfoEditor, PokemonBattlerMoveEditor, PokemonBattlerStatsEditor } from '.';
import { EmbeddedUnitInputNumber, InputNumber } from './InputNumber';
import { TextInputError } from '@components/inputs/Input';

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0 0 0;
  gap: 8px;
`;

type PokemonBattlerEditorProps = {
  action: 'edit' | 'creation';
  currentBattler: CurrentBattlerType;
  from: PokemonBattlerFrom;
  closeDialog: () => void;
};

export const PokemonBattlerEditor = forwardRef<EditorHandlingClose, PokemonBattlerEditorProps>(
  ({ action, currentBattler, from, closeDialog }, ref) => {
    const { t } = useTranslation(['database_pokemon', 'database_abilities', 'pokemon_battler_list', 'select']);
    const {
      encounter,
      updateEncounter,
      expandPokemonSetup,
      updateExpandPokemonSetup,
      isChangeOrder,
      setIsChangeOrder,
      updateStudioEntity,
      canClose,
      canNew,
      creatureUnavailable,
      formAvailable,
      state,
    } = usePokemonBattler({ action, currentBattler, from });
    const [minMaxLevelError, setMinMaxLevelError] = useState<boolean>(false);

    const handleNew = () => {
      if (!canNew) return;

      updateStudioEntity();
      closeDialog();
    };

    const onClose = () => {
      if (action === 'creation') return;

      updateStudioEntity();
    };

    useEditorHandlingClose(ref, onClose, canClose);

    return (
      <EditorWithCollapse type={action} title={t('database_pokemon:pokemon')}>
        <InputContainer size="l">
          {creatureUnavailable ? (
            <PaddedInputContainer>
              <InputWithTopLabelContainer>
                <Label htmlFor="select-pokemon" required>
                  {t('database_pokemon:pokemon')}
                </Label>
                <SelectPokemon
                  onChange={(dbSymbol) => updateEncounter({ specie: dbSymbol as DbSymbol })}
                  dbSymbol={encounter.specie}
                  undefValueOption={t('select:none')}
                  noLabel
                />
              </InputWithTopLabelContainer>
            </PaddedInputContainer>
          ) : (
            <>
              <PaddedInputContainer>
                <InputWithTopLabelContainer>
                  <Label htmlFor="select-pokemon" required>
                    {t('database_pokemon:pokemon')}
                  </Label>
                  <SelectPokemon onChange={(dbSymbol) => updateEncounter({ specie: dbSymbol as DbSymbol })} dbSymbol={encounter.specie} noLabel />
                </InputWithTopLabelContainer>
                {formAvailable && (
                  <InputWithTopLabelContainer>
                    <Label htmlFor="select-form">{t('database_pokemon:form')}</Label>
                    <SelectPokemonForm
                      onChange={(value) => {
                        if (value === '__undef__') return updateEncounter({ form: -1 });
                        updateEncounter({ form: Number(value) });
                      }}
                      dbSymbol={encounter.specie}
                      form={encounter.form === -1 ? '__undef__' : encounter.form}
                      undefValueOption={t('pokemon_battler_list:random')}
                      noLabel
                    />
                  </InputWithTopLabelContainer>
                )}
                {from !== 'group' && encounter.levelSetup.kind === 'fixed' && (
                  <InputWithLeftLabelContainer>
                    <Label htmlFor="fixed-level">{t('pokemon_battler_list:level')}</Label>
                    <InputNumber
                      name="fixed-level"
                      min="1"
                      max={state.projectConfig.settings_config.pokemonMaxLevel}
                      defaultValue={encounter.levelSetup.level}
                      onChange={(value) => updateEncounter({ levelSetup: { kind: 'fixed', level: value } })}
                    />
                  </InputWithLeftLabelContainer>
                )}
                {from === 'group' && encounter.levelSetup.kind === 'minmax' && (
                  <InputWithTopLabelContainer>
                    <InputWithLeftLabelContainer>
                      <Label htmlFor="minmax-level">{t('pokemon_battler_list:level')}</Label>
                      <InputWithSeparatorContainer>
                        <InputNumber
                          name="min-level"
                          min="1"
                          max={state.projectConfig.settings_config.pokemonMaxLevel}
                          defaultValue={encounter.levelSetup.level.minimumLevel}
                          onChange={(value) => {
                            const level = encounter.levelSetup.level as StudioEncounterLevelMinMax;
                            updateEncounter({
                              levelSetup: {
                                kind: 'minmax',
                                level: { ...level, minimumLevel: value },
                              },
                            });
                            setMinMaxLevelError(value > level.maximumLevel);
                          }}
                          error={minMaxLevelError}
                        />
                        <span className="separator">{t('pokemon_battler_list:level_separator')}</span>
                        <InputNumber
                          name="max-level"
                          min="1"
                          max={state.projectConfig.settings_config.pokemonMaxLevel}
                          defaultValue={encounter.levelSetup.level.maximumLevel}
                          onChange={(value) => {
                            const level = encounter.levelSetup.level as StudioEncounterLevelMinMax;
                            updateEncounter({
                              levelSetup: {
                                kind: 'minmax',
                                level: { ...level, maximumLevel: value },
                              },
                            });
                            setMinMaxLevelError(value < level.minimumLevel);
                          }}
                          error={minMaxLevelError}
                        />
                      </InputWithSeparatorContainer>
                    </InputWithLeftLabelContainer>
                    {minMaxLevelError && <TextInputError>{t('pokemon_battler_list:min_max_level_error')}</TextInputError>}
                  </InputWithTopLabelContainer>
                )}
                {from === 'group' && (
                  <InputWithLeftLabelContainer>
                    <Label htmlFor="encounter-chance">{t('pokemon_battler_list:random_encounter_chance')}</Label>
                    <EmbeddedUnitInputNumber
                      name="encounter-chance"
                      min="1"
                      max="100"
                      unit="%"
                      defaultValue={encounter.randomEncounterChance}
                      onChange={(value) => updateEncounter({ randomEncounterChance: value })}
                    />
                  </InputWithLeftLabelContainer>
                )}
                <InputWithTopLabelContainer>
                  <Label htmlFor="select-ability">{t('database_abilities:ability')}</Label>
                  <SelectAbility
                    dbSymbol={expandPokemonSetup.ability as string}
                    onChange={(dbSymbol) => updateExpandPokemonSetup({ ability: dbSymbol })}
                    undefValueOption={t('pokemon_battler_list:random')}
                    noLabel
                  />
                </InputWithTopLabelContainer>
                <InputWithTopLabelContainer>
                  <Label htmlFor="select-nature">{t('pokemon_battler_list:nature')}</Label>
                  <SelectNature
                    dbSymbol={expandPokemonSetup.nature as string}
                    onChange={(selected) => updateExpandPokemonSetup({ nature: selected.value })}
                    overwriteNoneValue={t('pokemon_battler_list:random')}
                    noneValue
                  />
                </InputWithTopLabelContainer>
              </PaddedInputContainer>
              <InputContainer size="s">
                <PokemonBattlerMoreInfoEditor
                  encounter={encounter}
                  updateEncounter={updateEncounter}
                  expandPokemonSetup={expandPokemonSetup}
                  updateExpandPokemonSetup={updateExpandPokemonSetup}
                  from={from}
                  action={action}
                  currentBattler={currentBattler}
                  isChangeOrder={isChangeOrder}
                  setIsChangeOrder={setIsChangeOrder}
                  collapseByDefault={false}
                />
                <PokemonBattlerMoveEditor
                  expandPokemonSetup={expandPokemonSetup}
                  updateExpandPokemonSetup={updateExpandPokemonSetup}
                  collapseByDefault={currentBattler.kind === 'moves'}
                />
                <PokemonBattlerStatsEditor
                  type="evs"
                  expandPokemonSetup={expandPokemonSetup}
                  updateExpandPokemonSetup={updateExpandPokemonSetup}
                  collapseByDefault={currentBattler?.kind === 'evs'}
                />
                {from !== 'group' && (
                  <PokemonBattlerStatsEditor
                    type="ivs"
                    expandPokemonSetup={expandPokemonSetup}
                    updateExpandPokemonSetup={updateExpandPokemonSetup}
                    collapseByDefault={false}
                  />
                )}
              </InputContainer>
            </>
          )}
          {action === 'creation' && (
            <ButtonContainer>
              <ToolTipContainer>
                {!canNew && <ToolTip bottom="100%">{t('pokemon_battler_list:fields_asterisk_required')}</ToolTip>}
                <PrimaryButton onClick={handleNew} disabled={!canNew}>
                  {t('database_pokemon:create_pokemon')}
                </PrimaryButton>
              </ToolTipContainer>
              <DarkButton onClick={closeDialog}>{t('database_pokemon:cancel')}</DarkButton>
            </ButtonContainer>
          )}
        </InputContainer>
      </EditorWithCollapse>
    );
  }
);
PokemonBattlerEditor.displayName = 'PokemonBattlerEditor';
