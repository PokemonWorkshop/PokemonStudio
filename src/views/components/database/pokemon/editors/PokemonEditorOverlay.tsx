import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { assertUnreachable } from '@utils/assertUnreachable';
import { DialogRefData } from '@utils/useDialogsRef';
import React from 'react';
import { AbilityEditor } from './AbilityEditor';
import { BreedingEditor } from './BreedingEditor';
import { CreatureDeletion } from './CreatureDeletion';
import { CreatureFormDeletion } from './CreatureFormDeletion';
import { EncounterEditor } from './EncounterEditor';
import { ExperienceEditor } from './ExperienceEditor';
import { InformationsEditor } from './InformationsEditor';
import { PokedexEditor } from './PokedexEditor';
import { PokemonFormNewEditor } from './PokemonFormNewEditor';
import { PokemonNewEditor } from './PokemonNewEditor';
import { StatEditor } from './StatsEditor';
import { EvolutionEditor } from './EvolutionEditor';

export type PokemonEditorAndDeletionKeys =
  | 'information'
  | 'pokedex'
  | 'exp'
  | 'abilities'
  | 'breeding'
  | 'stats'
  | 'encounter'
  | 'evolution'
  | 'new'
  | 'newForm'
  | 'deletion'
  | 'deleteForm';
export type PokemonDialogRef = React.RefObject<DialogRefData<PokemonEditorAndDeletionKeys>>;

export const PokemonEditorOverlay = defineEditorOverlay<
  PokemonEditorAndDeletionKeys,
  {
    evolutionIndex: number;
    setEvolutionIndex: (index: number) => void;
  }
>('PokemonEditorOverlay', (dialogToShow, handleCloseRef, closeDialog, props) => {
  switch (dialogToShow) {
    case 'abilities':
      return <AbilityEditor ref={handleCloseRef} />;
    case 'breeding':
      return <BreedingEditor ref={handleCloseRef} />;
    case 'deletion':
      return <CreatureDeletion closeDialog={closeDialog} ref={handleCloseRef} />;
    case 'deleteForm':
      return <CreatureFormDeletion closeDialog={closeDialog} ref={handleCloseRef} />;
    case 'encounter':
      return <EncounterEditor ref={handleCloseRef} />;
    case 'evolution':
      return (
        <EvolutionEditor
          closeDialog={closeDialog}
          evolutionIndex={props.evolutionIndex}
          setEvolutionIndex={props.setEvolutionIndex}
          ref={handleCloseRef}
        />
      );
    case 'exp':
      return <ExperienceEditor ref={handleCloseRef} />;
    case 'information':
      return <InformationsEditor ref={handleCloseRef} />;
    case 'new':
      return <PokemonNewEditor closeDialog={closeDialog} ref={handleCloseRef} setEvolutionIndex={props.setEvolutionIndex} />;
    case 'newForm':
      return <PokemonFormNewEditor closeDialog={closeDialog} ref={handleCloseRef} setEvolutionIndex={props.setEvolutionIndex} />;
    case 'pokedex':
      return <PokedexEditor ref={handleCloseRef} />;
    case 'stats':
      return <StatEditor ref={handleCloseRef} />;
    default:
      return assertUnreachable(dialogToShow);
  }
});
