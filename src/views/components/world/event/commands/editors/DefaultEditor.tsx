import { Editor } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import React, { forwardRef } from 'react';

export const DefaultEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const canClose = () => true;

  const onClose = () => {
    console.log('bye bye');
  };
  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <Editor type="edit" title="Basic editor">
      <div />
    </Editor>
  );
});

DefaultEditor.displayName = 'DefaultEditor';
