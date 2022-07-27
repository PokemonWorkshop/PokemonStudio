import React, { ReactNode, useEffect } from 'react';
import styled from 'styled-components';
import { EditorContainer, EditorWithCollapseContainer } from './EditorContainer';

export const EditorOverlayContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: ${({ theme }) => theme.calc.height};
  background-color: rgba(10, 9, 11, 0.3);
  visibility: hidden;
  z-index: 1;
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
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      // event.preventDefault();
      if (event.key === 'Escape' && isActive) onClose();
    };
    window.addEventListener('keydown', handleKey);

    return () => window.removeEventListener('keydown', handleKey);
  });

  if (isActive) {
    return (
      <EditorOverlayContainer className="active" onMouseDown={(event) => event.target === event.currentTarget && onClose()} tabIndex={-1}>
        {editors[currentEditor]}
        {subEditor}
      </EditorOverlayContainer>
    );
  }

  return <EditorOverlayContainer />;
};
