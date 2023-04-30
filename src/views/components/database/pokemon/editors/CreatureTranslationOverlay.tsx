import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { TranslationEditorWithCloseHandling } from '@components/editor/TranslationEditorWithCloseHandling';
import { ABILITY_DESCRIPTION_TEXT_ID, ABILITY_NAME_TEXT_ID, StudioAbility } from '@modelEntities/ability';
import { CREATURE_DESCRIPTION_TEXT_ID, CREATURE_NAME_TEXT_ID, CREATURE_SPECIE_TEXT_ID, StudioCreature } from '@modelEntities/creature';
import { assertUnreachable } from '@utils/assertUnreachable';
import React from 'react';

export type TranslationEditorTitle = 'translation_name' | 'translation_description' | 'translation_species';

type Props = {
  onClose: () => void;
  creature: StudioCreature;
};

const fileIds: Record<TranslationEditorTitle, number> = {
  translation_species: CREATURE_SPECIE_TEXT_ID,
  translation_description: CREATURE_DESCRIPTION_TEXT_ID,
  translation_name: CREATURE_NAME_TEXT_ID,
};

export const CreatureTranslationOverlay = defineEditorOverlay<TranslationEditorTitle, Props>(
  'CreatureTranslationOverlay',
  (dialogToShow, handleCloseRef, closeDialog, { onClose, creature }) => {
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
      default:
        return assertUnreachable(dialogToShow);
    }
  }
);
