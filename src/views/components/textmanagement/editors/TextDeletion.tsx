import { Deletion } from '@components/deletion';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { getEntityNameTextUsingTextId, useDeleteProjectText } from '@utils/ReadingProjectText';
import { cloneEntity } from '@utils/cloneEntity';
import { useTextInfos } from '@hooks/useTextInfos';
import React, { forwardRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type TextDeletionProps = {
  closeDialog: () => void;
};

/**
 * Component responsive of asking the user if they really want to delete the texts before doing so.
 */
export const TextDeletion = forwardRef<EditorHandlingClose, TextDeletionProps>(({ closeDialog }, ref) => {
  const { t } = useTranslation('text_management');
  const {
    textInfosValues: textInfos,
    currentTextInfo: currentTextInfo,
    setTextInfosValues: setTextInfos,
    selectedDataIdentifier: identifier,
    state,
  } = useTextInfos();
  const deleteProjectText = useDeleteProjectText();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const textName = useMemo(() => getEntityNameTextUsingTextId(currentTextInfo, state), []);

  const onClickDelete = () => {
    const textInfosCloned = cloneEntity(textInfos).filter(({ fileId }) => fileId !== identifier);
    const firstFileId = textInfosCloned.sort((a, b) => a.fileId - b.fileId)[0].fileId;
    setTextInfos(textInfosCloned, { textInfo: firstFileId });
    deleteProjectText(identifier);
    closeDialog();
  };

  // This component can be cancelled under no conditions and don't need to handle anything for the close behavior
  useEditorHandlingClose(ref);

  return (
    <Deletion title={t('deletion_of')} message={t('deletion_message', { name: textName })} onClickDelete={onClickDelete} onClose={closeDialog} />
  );
});
TextDeletion.displayName = 'TextDeletion';
