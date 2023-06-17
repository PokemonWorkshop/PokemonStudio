import { Deletion } from '@components/deletion';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { getEntityNameTextUsingTextId, useGetTextList, useSetProjectText } from '@utils/ReadingProjectText';
import { useTextInfos } from '@utils/useTextInfos';
import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

type TextListClearProps = {
  closeDialog: () => void;
};

/**
 * Component responsive of asking the user if they really want to clear the texts before doing so.
 */
export const TextListClear = forwardRef<EditorHandlingClose, TextListClearProps>(({ closeDialog }, ref) => {
  const { t } = useTranslation('text_management');
  const { currentTextInfo: currentTextInfo, state } = useTextInfos();
  const getTextList = useGetTextList();
  const setText = useSetProjectText();

  const onClickClear = () => {
    getTextList(currentTextInfo.fileId).forEach((text) => setText(currentTextInfo.fileId, text.textId, ''));
    closeDialog();
  };

  // This component can be cancelled under no conditions and don't need to handle anything for the close behavior
  useEditorHandlingClose(ref);

  return (
    <Deletion
      title={t('clearing_texts')}
      message={t('clearing_texts_message', { name: getEntityNameTextUsingTextId(currentTextInfo, state) })}
      icon="clear"
      onClickDelete={onClickClear}
      onClose={closeDialog}
    />
  );
});
TextListClear.displayName = 'TextListClear';
