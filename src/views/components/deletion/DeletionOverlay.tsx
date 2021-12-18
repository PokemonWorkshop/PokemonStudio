import { EditorOverlayContainer } from '@components/editor';
import React, { ReactNode, useEffect } from 'react';
import styled from 'styled-components';

const DeletionOverlayContainer = styled(EditorOverlayContainer)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

type DeletionOverlayProps = {
  currentDeletion: string | undefined;
  deletions: Record<string, ReactNode>;
  onClose: () => void;
};

/**
 * See {@link EditorOverlay}
 */
export const DeletionOverlay = ({ currentDeletion, deletions, onClose }: DeletionOverlayProps) => {
  const isActive = currentDeletion && deletions[currentDeletion];
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
      <DeletionOverlayContainer className="active" onClick={(event) => event.target === event.currentTarget && onClose()} tabIndex={-1}>
        {deletions[currentDeletion]}
      </DeletionOverlayContainer>
    );
  }

  return <DeletionOverlayContainer />;
};
