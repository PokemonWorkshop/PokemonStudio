import React, { useMemo } from 'react';
import { SecondaryButtonWithPlusIconResponsive } from '@components/buttons';
import { DarkButtonWithPlusIconResponsive } from '@components/buttons/DarkButtonWithPlusIcon';
import { ControlBar, ControlBarButtonContainer, ControlBarLabelContainer } from '@components/ControlBar';
import { useTranslation } from 'react-i18next';
import { useSetCurrentDatabasePath } from '@hooks/useSetCurrentDatabasePage';
import { PokemonDialogRef } from './editors/PokemonEditorOverlay';
import { getNextDbSymbolByDexOrder, getPreviousDbSymbolByDexOrder, useProjectPokemon } from '@hooks/useProjectData';
import { StudioShortcutActions, useShortcut } from '@hooks/useShortcuts';
import { SelectPokemon } from '@components/selects/SelectPokemon';
import { SelectPokemonForm } from '@components/selects/SelectPokemonForm';

const NEW_BREAKPOINT = 'screen and (max-width: 1050px)';
const SELECT_BREAKPOINT = 'screen and (max-width: 1180px)';
const FORM_BREAKPOINT = 'screen and (max-width: 1280px)';

type Props = {
  dialogsRef?: PokemonDialogRef;
  setEvolutionIndex?: (index: number) => void;
};

export const PokemonControlBar = ({ dialogsRef, setEvolutionIndex }: Props) => {
  useSetCurrentDatabasePath();
  const { t } = useTranslation(['database_pokemon']);
  const { selectedDataIdentifier: currentPokemon, setSelectedDataIdentifier, state } = useProjectPokemon();
  const shortcutMap = useMemo<StudioShortcutActions>(() => {
    const isShortcutEnabled = () => dialogsRef?.current?.currentDialog === undefined;

    return {
      db_previous: () => {
        if (!isShortcutEnabled()) return;
        if (setEvolutionIndex) setEvolutionIndex(0);
        setSelectedDataIdentifier({ pokemon: { specie: getPreviousDbSymbolByDexOrder(currentPokemon.specie, state), form: 0 } });
      },
      db_next: () => {
        if (!isShortcutEnabled()) return;
        if (setEvolutionIndex) setEvolutionIndex(0);
        setSelectedDataIdentifier({ pokemon: { specie: getNextDbSymbolByDexOrder(currentPokemon.specie, state), form: 0 } });
      },
      db_new: () => isShortcutEnabled() && dialogsRef?.current?.openDialog('new'),
    };
  }, [currentPokemon.specie]);
  useShortcut(shortcutMap);

  const onClickNew = dialogsRef ? () => dialogsRef.current?.openDialog('new') : undefined;
  const onClickFormNew = dialogsRef ? () => dialogsRef.current?.openDialog('newForm') : undefined;
  const onPokemonChange = (dbSymbol: string) => {
    if (setEvolutionIndex) setEvolutionIndex(0);
    setSelectedDataIdentifier({ pokemon: { specie: dbSymbol, form: 0 } });
  };
  const onFormChange = (form: string) => {
    if (setEvolutionIndex) setEvolutionIndex(0);
    setSelectedDataIdentifier({ pokemon: { specie: currentPokemon.specie, form: Number(form) } });
  };

  return (
    <ControlBar>
      {onClickNew ? (
        <SecondaryButtonWithPlusIconResponsive
          data-tooltip-responsive={t('database_pokemon:newPokemon')}
          breakpoint={NEW_BREAKPOINT}
          onClick={onClickNew}
        >
          {t('database_pokemon:newPokemon')}
        </SecondaryButtonWithPlusIconResponsive>
      ) : (
        <div />
      )}
      <ControlBarButtonContainer>
        <ControlBarLabelContainer>
          <SelectPokemon dbSymbol={currentPokemon.specie} onChange={onPokemonChange} breakpoint={SELECT_BREAKPOINT} />
        </ControlBarLabelContainer>
        <ControlBarLabelContainer>
          <SelectPokemonForm dbSymbol={currentPokemon.specie} form={currentPokemon.form} onChange={onFormChange} breakpoint={SELECT_BREAKPOINT} />
          {onClickFormNew && (
            <DarkButtonWithPlusIconResponsive
              data-tooltip-responsive={t('database_pokemon:newForm')}
              breakpoint={FORM_BREAKPOINT}
              onClick={onClickFormNew}
            >
              <span>{t('database_pokemon:newForm')}</span>
            </DarkButtonWithPlusIconResponsive>
          )}
        </ControlBarLabelContainer>
      </ControlBarButtonContainer>
    </ControlBar>
  );
};
