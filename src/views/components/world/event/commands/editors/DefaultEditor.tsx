import { Editor } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useGlobalState } from '@src/GlobalStateProvider';
import React, { forwardRef } from 'react';

export const DefaultEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const [, setState] = useGlobalState();
  const canClose = () => true;

  const onClose = () => {
    //console.log('bye bye');
    setState((s) => ({ ...s, textVersion: s.textVersion + 1 }));
  };
  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <Editor type="edit" title="Basic editor">
      <div />
    </Editor>
  );
});

DefaultEditor.displayName = 'DefaultEditor';
