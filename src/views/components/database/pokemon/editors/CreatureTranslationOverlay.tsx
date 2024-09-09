import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { TranslationEditorWithCloseHandling } from '@components/editor/TranslationEditorWithCloseHandling';
import {
  CREATURE_DESCRIPTION_TEXT_ID,
  CREATURE_FORM_DESCRIPTION_TEXT_ID,
  CREATURE_FORM_NAME_TEXT_ID,
  CREATURE_NAME_TEXT_ID,
  CREATURE_SPECIE_TEXT_ID,
  StudioCreature,
  StudioCreatureForm,
} from '@modelEntities/creature';
import { assertUnreachable } from '@utils/assertUnreachable';
import React from 'react';

export type TranslationEditorTitle =
  | 'translation_name'
  | 'translation_description'
  | 'translation_species'
  | 'translation_form_name'
  | 'translation_form_description';

type Props = {
  onClose: () => void;
  creature: StudioCreature;
  form: StudioCreatureForm;
};

const fileIds: Record<TranslationEditorTitle, number> = {
  translation_species: CREATURE_SPECIE_TEXT_ID,
  translation_description: CREATURE_DESCRIPTION_TEXT_ID,
  translation_name: CREATURE_NAME_TEXT_ID,
  translation_form_name: CREATURE_FORM_NAME_TEXT_ID,
  translation_form_description: CREATURE_FORM_DESCRIPTION_TEXT_ID,
};

export const CreatureTranslationOverlay = defineEditorOverlay<TranslationEditorTitle, Props>(
  'CreatureTranslationOverlay',
  (dialogToShow, handleCloseRef, closeDialog, { onClose, creature, form }) => {
    switch (dialogToShow) {
      case 'translation_name':
      case 'translation_description':
      case 'translation_species':
        return (
          <TranslationEditorWithCloseHandling
            title={dialogToShow}
            nameTextId={CREATURE_NAME_TEXT_ID}
            fileId={fileIds[dialogToShow]}
            textIndex={creature.id}
            isMultiline={dialogToShow === 'translation_description'}
            closeDialog={closeDialog}
            onClose={onClose}
            ref={handleCloseRef}
          />
        );
      case 'translation_form_name':
      case 'translation_form_description':
        return (
          <TranslationEditorWithCloseHandling
            title={dialogToShow}
            nameTextId={CREATURE_FORM_NAME_TEXT_ID}
            nameTextIndex={form.formTextId.name}
            fileId={fileIds[dialogToShow]}
            textIndex={dialogToShow === 'translation_form_name' ? form.formTextId.name : form.formTextId.description}
            isMultiline={dialogToShow === 'translation_form_description'}
            closeDialog={closeDialog}
            onClose={onClose}
            ref={handleCloseRef}
          />
        );
      default:
        return assertUnreachable(dialogToShow);
    }
  }
);
