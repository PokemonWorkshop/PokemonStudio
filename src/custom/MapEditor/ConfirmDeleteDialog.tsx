import React from 'react';
import styled from 'styled-components';
import { DarkButton, DeleteButton } from '@components/buttons';

/**
 * Lightweight, self-contained confirmation used by the map editor when the
 * user presses Delete on the last-clicked layer or event. Styled to match
 * the editor's other modals (AddTilesetDialog etc.) rather than pulled from
 * Studio's EditorOverlayV2 stack — this lives inside the custom canvas UI.
 *
 * The "Don't ask me again" checkbox is surfaced here; the parent persists
 * the preference (localStorage) and skips this dialog entirely next time.
 */

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
`;

const Modal = styled.div`
  background-color: ${({ theme }) => theme.colors.dark16};
  border-radius: 8px;
  width: min(420px, 92vw);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Body = styled.div`
  padding: 18px 20px 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Title = styled.h3`
  ${({ theme }) => theme.fonts.titlesHeadline6};
  color: ${({ theme }) => theme.colors.text100};
  margin: 0;
`;

const Message = styled.p`
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text400};
  margin: 0;

  b {
    color: ${({ theme }) => theme.colors.text100};
    word-break: break-word;
  }
`;

const Irreversible = styled.p`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.dangerBase};
  margin: 0;
`;

const SkipRow = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  cursor: pointer;
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};

  input {
    cursor: pointer;
  }
`;

const Footer = styled.div`
  padding: 12px 20px 16px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

type ConfirmDeleteDialogProps = {
  title: string;
  /** The message body. Use {name} placeholders resolved by the caller. */
  message: React.ReactNode;
  confirmLabel: string;
  skipLabel: string;
  skip: boolean;
  onSkipChange: (value: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmDeleteDialog = ({
  title,
  message,
  confirmLabel,
  skipLabel,
  skip,
  onSkipChange,
  onConfirm,
  onCancel,
}: ConfirmDeleteDialogProps) => {
  // Enter confirms, Escape cancels — matches the rest of the editor's modals.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        onConfirm();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
      }
    };
    // Capture phase so we win over the editor's global Delete/hotkey handlers.
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onConfirm, onCancel]);

  return (
    <Backdrop onMouseDown={onCancel}>
      <Modal onMouseDown={(e) => e.stopPropagation()}>
        <Body>
          <Title>{title}</Title>
          <Message>{message}</Message>
          <Irreversible>This action cannot be undone.</Irreversible>
          <SkipRow>
            <input type="checkbox" checked={skip} onChange={(e) => onSkipChange(e.target.checked)} />
            {skipLabel}
          </SkipRow>
        </Body>
        <Footer>
          <DarkButton onClick={onCancel}>Cancel</DarkButton>
          <DeleteButton onClick={onConfirm}>{confirmLabel}</DeleteButton>
        </Footer>
      </Modal>
    </Backdrop>
  );
};
