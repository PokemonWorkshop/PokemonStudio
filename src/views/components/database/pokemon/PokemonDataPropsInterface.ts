import { StudioCreature, StudioCreatureForm } from '@modelEntities/creature';
import { PokemonDialogRef } from './editors/PokemonEditorOverlay';

export type PokemonDataProps = {
  pokemonWithForm: PokemonWithForm;
  dialogsRef: PokemonDialogRef;
};

export type PokemonWithForm = {
  species: StudioCreature;
  form: StudioCreatureForm;
};
