import React, { forwardRef } from 'react';
import { Deletion } from '@components/deletion';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useTranslation } from 'react-i18next';
import { useTypePage } from '@utils/usePage';
import { useNavigate } from 'react-router-dom';
import { useProjectTypes } from '@utils/useProjectData';

type TypeDeletionEditorProps = {
  onClose: () => void;
};

/**
 * Component responsive of asking the user if they really want to delete the move before doing so.
 */
export const TypeDeletionEditor = forwardRef<EditorHandlingClose, TypeDeletionEditorProps>(({ onClose }, ref) => {
  const { types, currentTypeName, currentType: type } = useTypePage();
  const { removeProjectDataValue: deleteType } = useProjectTypes();
  const { t } = useTranslation('database_types');
  const navigate = useNavigate();
  const onClickDelete = () => {
    const firstDbSymbol = Object.keys(types)
      .map((value) => ({ value, index: currentTypeName }))
      .filter((d) => d.value !== type.dbSymbol)
      .sort((a, b) => a.index.localeCompare(b.index))[0].value;
    navigate(`/database/types/${type.dbSymbol}`);
    setTimeout(() => {
      deleteType(type.dbSymbol, { type: firstDbSymbol });
    }, 0);
    onClose();
  };

  useEditorHandlingClose(ref);

  return (
    <Deletion
      title={t('deletion_of', { type: currentTypeName })}
      message={t('deletion_message', { type: currentTypeName })}
      onClickDelete={onClickDelete}
      onClose={onClose}
    />
  );
});
TypeDeletionEditor.displayName = 'TypeDeletionEditor';
