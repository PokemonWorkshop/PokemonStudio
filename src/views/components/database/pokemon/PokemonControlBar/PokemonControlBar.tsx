import React from 'react';
import { SecondaryButtonWithPlusIconResponsive } from '@components/buttons';
import { DarkButtonWithPlusIconResponsive } from '@components/buttons/DarkButtonWithPlusIcon';
import { ControlBar, ControlBarButtonContainer, ControlBarLabelContainer } from '@components/ControlBar';
import { useTranslation } from 'react-i18next';
import { PokemonControlBarProps } from './PokemonControlBarPropsInterface';
import { SelectPokemon, SelectPokemonForm } from '@components/selects';

export const PokemonControlBar = ({
  onPokemonChange,
  onFormChange,
  onClickNewPokemon,
  onClickNewForm,
  currentPokemonWithForm,
}: PokemonControlBarProps) => {
  const { t } = useTranslation(['database_pokemon']);

  return (
    <ControlBar>
      {onClickNewPokemon ? (
        <SecondaryButtonWithPlusIconResponsive
          tooltip={{ left: '100%', top: '100%' }}
          breakpoint="screen and (max-width: 1050px)"
          onClick={onClickNewPokemon}
        >
          {t('database_pokemon:newPokemon')}
        </SecondaryButtonWithPlusIconResponsive>
      ) : (
        <div />
      )}
      <ControlBarButtonContainer>
        <ControlBarLabelContainer>
          <SelectPokemon dbSymbol={currentPokemonWithForm.species.dbSymbol} onChange={onPokemonChange} breakpoint="screen and (max-width: 1180px)" />
        </ControlBarLabelContainer>
        <ControlBarLabelContainer>
          <SelectPokemonForm
            dbSymbol={currentPokemonWithForm.species.dbSymbol}
            form={currentPokemonWithForm.form.form}
            onChange={onFormChange}
            breakpoint="screen and (max-width: 1180px)"
          />
          {onClickNewForm && (
            <DarkButtonWithPlusIconResponsive
              tooltip={{ right: '100%', top: '100%' }}
              breakpoint="screen and (max-width: 1280px)"
              onClick={onClickNewForm}
            >
              <span>{t('database_pokemon:newForm')}</span>
            </DarkButtonWithPlusIconResponsive>
          )}
        </ControlBarLabelContainer>
      </ControlBarButtonContainer>
    </ControlBar>
  );
};
