import React, { ReactNode, useEffect } from 'react';
import styled from 'styled-components';
import { playSound } from '@utils/sound';
import { EditorContainer, EditorWithCollapseContainer } from './EditorContainer';

export const EditorOverlayContainer = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.calc.titleBarHeight};
  left: 0;
  width: 100vw;
  height: ${({ theme }) => theme.calc.height};
  background-color: rgba(10, 9, 11, 0.3);
  visibility: hidden;
  z-index: 8000;
  opacity: 0;
  transition: 0.2s;

  @keyframes slideEditorIn {
    from {
      left: 100%;
    }
    25% {
      left: 100%;
    }
    to {
      left: calc(100% - 288px);
    }
  }

  &.active {
    visibility: visible;
    opacity: 1;

    & > ${EditorContainer} {
      animation-name: slideEditorIn;
      animation-duration: 0.2s;
      animation-timing-function: ease-in;
      left: calc(100% - 288px);
    }

    & > ${EditorWithCollapseContainer} {
      animation-name: slideEditorIn;
      animation-duration: 0.2s;
      animation-timing-function: ease-in;
      left: calc(100% - 308px);
    }
  }
`;

type EditorOverlayProps = {
  currentEditor: string | undefined;
  editors: Record<string, ReactNode>;
  subEditor?: ReactNode;
  onClose: () => void;
};

/**
 * Overlay helping to handle edition of multiple part
 * Event onClose is called when escape key is pressed or mouse clicks outside of the editor.
 *
 * How to use:
 * @example
 * <EditorOverlay
 *   currentEditor={currentEditor}
 *   onClose={() => setCurrentEditor(undefined)}
 *   editors={{
 *     test1: <Editor type="edit" title="First editor"><StuffToEdit /></Editor>,
 *     test2:  <Editor type="edit" title="Second editor"><StuffToEdit2 /></Editor>
 *   }}
 * />
 * @note When changing currentEditor to undefined or any key of editors it will show the corresponding editor or nothing.
 * @note When showing an editor the back is not clickable.
 */
export const EditorOverlay = ({ currentEditor, editors, subEditor, onClose }: EditorOverlayProps) => {
  const isActive = currentEditor && editors[currentEditor];
  const active = Boolean(isActive);

  // This (v1) overlay slides in from the right just like EditorOverlayV2's
  // right dialogs, so it sounds the same: `loading` on arrival, `release` on
  // dismissal (Escape or clicking the dimmed backdrop).
  useEffect(() => {
    if (active) playSound('loading');
  }, [active]);

  const close = () => {
    playSound('release');
    onClose();
  };

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      // event.preventDefault();
      if (event.key === 'Escape' && isActive) close();
    };
    window.addEventListener('keydown', handleKey);

    return () => window.removeEventListener('keydown', handleKey);
  });

  if (isActive) {
    return (
      <EditorOverlayContainer className="active" onMouseDown={(event) => event.target === event.currentTarget && close()} tabIndex={-1}>
        {editors[currentEditor]}
        {subEditor}
      </EditorOverlayContainer>
    );
  }

  return <EditorOverlayContainer />;
};
