import { StudioCreature, StudioCreatureForm } from '@modelEntities/creature';
import { PokemonDialogRef } from './editors/PokemonEditorOverlay';
import { IClickable } from '@hooks/useShortcutNavigation';

export type PokemonDataProps = {
  pokemonWithForm: PokemonWithForm;
  dialogsRef: PokemonDialogRef;
  clickable?: IClickable;
};

export type PokemonWithForm = {
  species: StudioCreature;
  form: StudioCreatureForm;
};
