import { InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { useTranslation } from 'react-i18next';
import { SelectPokemon } from '@components/selects/SelectPokemon';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { usePokemonBattler } from '@components/pokemonBattler/editors/usePokemonBattler';
import { SelectPokemonForm } from '@components/selects/SelectPokemonForm';
import { InputNumber } from '@components/pokemonBattler/editors/InputNumber';
import { SelectAbility, SelectNature } from '@components/selects';
import {
  PokemonBattlerMoreInfoEditor,
  PokemonBattlerMoveEditor,
  PokemonBattlerStatsEditor,
  PokemonBattlerContestStatsEditor,
} from '@components/pokemonBattler/editors';
import { StudioQuestEarning } from '@modelEntities/quest';
import React from 'react';

type QuestEarningPokemonProps = {
  earning: StudioQuestEarning;
  earningCreature: ReturnType<typeof usePokemonBattler>;
};

export const QuestEarningPokemon = ({ earning, earningCreature }: QuestEarningPokemonProps) => {
  const { t } = useTranslation();
  const { encounter, updateEncounter, expandPokemonSetup, updateExpandPokemonSetup, creatureUnavailable, formAvailable, state } = earningCreature;
  const earningMethod = earning.earningMethodName;

  return (
    <InputContainer size="l">
      {creatureUnavailable ? (
        <InputWithTopLabelContainer>
          <Label htmlFor="select-pokemon" required>
            {t('creature')}
          </Label>
          <SelectPokemon
            onChange={(dbSymbol) => updateEncounter({ specie: dbSymbol as DbSymbol })}
            dbSymbol={encounter.specie}
            undefValueOption={t('none')}
            noLabel
          />
        </InputWithTopLabelContainer>
      ) : (
        <>
          <InputWithTopLabelContainer>
            <Label htmlFor="select-pokemon" required>
              {t('creature')}
            </Label>
            <SelectPokemon onChange={(dbSymbol) => updateEncounter({ specie: dbSymbol as DbSymbol })} dbSymbol={encounter.specie} noLabel />
          </InputWithTopLabelContainer>
          {formAvailable && (
            <InputWithTopLabelContainer>
              <Label htmlFor="select-form">{t('form')}</Label>
              <SelectPokemonForm
                onChange={(value) => {
                  if (value === '__undef__') return updateEncounter({ form: -1 });
                  updateEncounter({ form: Number(value) });
                }}
                dbSymbol={encounter.specie}
                form={encounter.form === -1 ? '__undef__' : encounter.form}
                undefValueOption={t('random')}
                noLabel
              />
            </InputWithTopLabelContainer>
          )}
          {encounter.levelSetup.kind === 'fixed' && earningMethod === 'earning_pokemon' && (
            <InputWithLeftLabelContainer>
              <Label htmlFor="fixed-level">{t('level')}</Label>
              <InputNumber
                name="fixed-level"
                min="1"
                max={state.projectConfig.settings_config.pokemonMaxLevel}
                defaultValue={encounter.levelSetup.level}
                onChange={(value) => updateEncounter({ levelSetup: { kind: 'fixed', level: value } })}
              />
            </InputWithLeftLabelContainer>
          )}
          <InputWithTopLabelContainer>
            <Label htmlFor="select-ability">{t('ability')}</Label>
            <SelectAbility
              dbSymbol={expandPokemonSetup.ability as string}
              onChange={(dbSymbol) => updateExpandPokemonSetup({ ability: dbSymbol })}
              undefValueOption={t('random')}
              noLabel
            />
          </InputWithTopLabelContainer>
          <InputWithTopLabelContainer>
            <Label htmlFor="select-nature">{t('nature')}</Label>
            <SelectNature
              dbSymbol={expandPokemonSetup.nature as string}
              onChange={(selected) => updateExpandPokemonSetup({ nature: selected.value })}
              overwriteNoneValue={t('random')}
              noneValue
            />
          </InputWithTopLabelContainer>
          <InputContainer size="s">
            <PokemonBattlerMoreInfoEditor
              encounter={encounter}
              updateEncounter={updateEncounter}
              expandPokemonSetup={expandPokemonSetup}
              updateExpandPokemonSetup={updateExpandPokemonSetup}
              from="quest_earning"
              collapseByDefault={false}
            />
            <PokemonBattlerMoveEditor
              expandPokemonSetup={expandPokemonSetup}
              updateExpandPokemonSetup={updateExpandPokemonSetup}
              collapseByDefault={false}
            />
            <PokemonBattlerStatsEditor
              type="evs"
              expandPokemonSetup={expandPokemonSetup}
              updateExpandPokemonSetup={updateExpandPokemonSetup}
              collapseByDefault={false}
            />
            <PokemonBattlerStatsEditor
              type="ivs"
              expandPokemonSetup={expandPokemonSetup}
              updateExpandPokemonSetup={updateExpandPokemonSetup}
              collapseByDefault={false}
            />
            <PokemonBattlerContestStatsEditor expandPokemonSetup={expandPokemonSetup} updateExpandPokemonSetup={updateExpandPokemonSetup} />
          </InputContainer>
        </>
      )}
    </InputContainer>
  );
};
