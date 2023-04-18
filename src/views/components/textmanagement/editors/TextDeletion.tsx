import { Deletion } from '@components/deletion';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

type TextDeletionProps = {
  closeDialog: () => void;
};

// TODO: add a hook to get the data and use it

/**
 * Component responsive of asking the user if they really want to delete the texts before doing so.
 */
export const TextDeletion = forwardRef<EditorHandlingClose, TextDeletionProps>(({ closeDialog }, ref) => {
  const { t } = useTranslation('text_management');
  // We memoise the ability name because when this dialog closes, the ability is already deleted and it shows another name than the one we deleted.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const textName = 'Phrases de victoire';

  const onClickDelete = () => {
    console.log('deleted');
    closeDialog();
  };

  // This component can be cancelled under no conditions and don't need to handle anything for the close behavior
  useEditorHandlingClose(ref);

  return (
    <Deletion title={t('deletion_of')} message={t('deletion_message', { name: textName })} onClickDelete={onClickDelete} onClose={closeDialog} />
  );
});
TextDeletion.displayName = 'TextDeletion';
