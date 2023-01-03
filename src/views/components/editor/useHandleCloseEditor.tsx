import React, { useImperativeHandle, useRef } from 'react';

export type EditorHandlingClose = { onClose: () => void; canClose: () => boolean };
export const useEditorHandlingCloseRef = () => useRef<EditorHandlingClose>(null);
export const useEditorHandlingClose = (
  ref: React.Ref<EditorHandlingClose>,
  onClose: () => void,
  canClose: () => boolean,
  deps?: React.DependencyList
) =>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useImperativeHandle(ref, () => ({ onClose, canClose }), deps);
