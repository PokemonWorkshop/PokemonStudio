import React, { useImperativeHandle, useRef } from 'react';

const voidOnClose = () => {};
const alwaysCanClose = () => true;

export type EditorHandlingClose = { onClose: () => void; canClose: () => boolean };
export const useEditorHandlingCloseRef = () => useRef<EditorHandlingClose>(null);
/**
 * Define the ref content of the editor handling close
 *
 * If canClose is not defined, then it can always close
 * If onClose is not defined it won't do anything when closing
 */
export const useEditorHandlingClose = (
  ref: React.Ref<EditorHandlingClose>,
  onClose?: () => void,
  canClose?: () => boolean,
  deps?: React.DependencyList
) =>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useImperativeHandle(ref, () => ({ onClose: onClose || voidOnClose, canClose: canClose || alwaysCanClose }), deps);
