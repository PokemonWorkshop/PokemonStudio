import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { TranslationEditorWithCloseHandling } from '@components/editor/TranslationEditorWithCloseHandling';
import { StudioGroup, GROUP_NAME_TEXT_ID } from '@modelEntities/group';
import { assertUnreachable } from '@utils/assertUnreachable';
import React from 'react';

export type GroupTranslationEditorTitle = 'translation_name';

type Props = {
  onClose: () => void;
  group: StudioGroup;
};

/**
 * Editor overlay for the translation of group texts
 */
export const GroupTranslationOverlay = defineEditorOverlay<GroupTranslationEditorTitle, Props>(
  'GroupTranslationOverlay',
  (dialogToShow, handleCloseRef, closeDialog, { onClose, group }) => {
    switch (dialogToShow) {
      case 'translation_name':
        return (
          <TranslationEditorWithCloseHandling
            title={dialogToShow}
            nameTextId={GROUP_NAME_TEXT_ID}
            fileId={GROUP_NAME_TEXT_ID}
            textIndex={group.id}
            isMultiline={false}
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
